const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const originalEnv = {
  COURSE_PRICE_INR: process.env.COURSE_PRICE_INR,
  PAYU_KEY: process.env.PAYU_KEY,
  PAYU_SALT: process.env.PAYU_SALT,
  PAYU_ENV: process.env.PAYU_ENV,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
};
process.env.COURSE_PRICE_INR = "499";
process.env.PAYU_KEY = "test-merchant-key";
process.env.PAYU_SALT = "test-merchant-salt";
process.env.PAYU_ENV = "test";
process.env.NEXT_PUBLIC_SITE_URL = "https://example.test";

function loadTs(file, mocks = {}) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
    fileName: file,
  }).outputText;
  const mod = { exports: {} };
  new Function("require", "module", "exports", output)(
    specifier => specifier in mocks ? mocks[specifier] : require(specifier),
    mod,
    mod.exports,
  );
  return mod.exports;
}

const course = loadTs("lib/course.ts");
const coupon = loadTs("lib/coupon.ts", { "@/lib/course": course });
const payu = loadTs("lib/payu.ts", { "@/lib/course": course });

test("only DAX100 applies once and never makes the payable amount negative", () => {
  assert.equal(coupon.getCouponQuote(" D A X 1 0 0 ").totalPaise, 48882);
  assert.equal(coupon.getCouponQuote("dax100").discountPaise, 10000);
  assert.equal(coupon.getCouponQuote("DAX200"), null);
  assert.equal(coupon.getCouponQuote("DAX100DAX100"), null);
  assert.equal(coupon.getCouponQuote(100), null);
  process.env.COURSE_PRICE_INR = "50";
  const cheapCourse = loadTs("lib/course.ts");
  const cheapCoupon = loadTs("lib/coupon.ts", { "@/lib/course": cheapCourse });
  assert.equal(cheapCoupon.getCouponQuote("DAX100").totalPaise, 0);
  assert.equal(cheapCoupon.getCouponQuote("DAX100").discountPaise, 5900);
  process.env.COURSE_PRICE_INR = "499";
});

test("normal and discounted PayU fields sign the exact server amount", () => {
  const customer = { firstname: "Test User", email: "test@example.invalid", phone: "9999999999" };
  for (const amountPaise of [58882, 48882]) {
    const fields = payu.createPayUCheckoutFields({ txnid: `YTC_TEST_${amountPaise}`, amountPaise, customer });
    assert.equal(fields.amount, (amountPaise / 100).toFixed(2));
    assert.equal(fields.udf2, String(amountPaise));
    assert.equal(fields.surl, "https://example.test/api/payu/callback");
    const { hash, ...unsigned } = fields;
    const input = [unsigned.key, unsigned.txnid, unsigned.amount, unsigned.productinfo, unsigned.firstname, unsigned.email,
      unsigned.udf1, unsigned.udf2, unsigned.udf3, unsigned.udf4, unsigned.udf5, "", "", "", "", "", process.env.PAYU_SALT].join("|");
    assert.equal(hash, crypto.createHash("sha512").update(input).digest("hex"));
  }
});

test("only verified active successful payments qualify for enrollment", () => {
  const payment = { txnid: "YTC_TEST", amountPaise: 48882, productinfo: course.COURSE_SLUG, email: "test@example.invalid", status: "success", unmappedstatus: "captured", error: "e000" };
  assert.equal(payu.payUPaymentMatchesOrder(payment, { txnid: "YTC_TEST", amountPaise: 48882, email: "test@example.invalid" }), true);
  assert.equal(payu.payUPaymentMatchesOrder(payment, { txnid: "YTC_TEST", amountPaise: 58882, email: "test@example.invalid" }), false);
  assert.equal(payu.payUPaymentIsActiveSuccess(payment), true);
  for (const status of ["failed", "refunded", "cancelled"]) assert.equal(payu.payUPaymentIsActiveSuccess({ ...payment, status }), false);
  assert.equal(payu.payUPaymentIsActiveSuccess({ ...payment, unmappedstatus: "pending" }), false);
  assert.equal(payu.payUPaymentIsActiveSuccess({ ...payment, error: "e123" }), false);
});

function createHarness(price = course) {
  const quote = price === course ? coupon : loadTs("lib/coupon.ts", { "@/lib/course": price });
  const inserted = [];
  const rpcCalls = [];
  let orderError = null;
  const admin = {
    from(table) {
      if (table === "profiles") return { upsert: async () => ({ error: null }) };
      if (table === "payment_orders") return { insert: async value => { inserted.push(value); return { error: orderError }; } };
      throw new Error(`Unexpected table ${table}`);
    },
    rpc: async (name, args) => { rpcCalls.push({ name, args }); return { error: null }; },
  };
  const route = loadTs("app/api/payu/create/route.ts", {
    "next/server": { NextResponse: { json: (body, options = {}) => Response.json(body, { status: options.status || 200 }) } },
    "@/lib/auth": { getCurrentUser: async () => ({ id: "test-user", email: "test@example.invalid", user_metadata: {} }), hasLifetimeCourseAccess: async () => false },
    "@/lib/course": price,
    "@/lib/coupon": quote,
    "@/lib/supabase/admin": { createAdminClient: () => admin },
    "@/lib/payu": payu,
  });
  return {
    inserted,
    rpcCalls,
    setOrderError(error) { orderError = error; },
    async post(body) {
      const response = await route.POST(new Request("https://example.test/api/payu/create", { method: "POST", body: JSON.stringify({ firstname: "Test User", phone: "9999999999", ...body }) }));
      return { status: response.status, data: await response.json() };
    },
  };
}

test("create route handles normal, discounted, removed and invalid coupons", async () => {
  const h = createHarness();
  const normal = await h.post({});
  assert.equal(normal.status, 200);
  assert.equal(normal.data.fields.amount, "588.82");
  assert.equal(h.inserted[0].discount_paise, 0);
  assert.equal(h.inserted[0].coupon_code, null);
  const discounted = await h.post({ couponCode: " dax100 " });
  assert.equal(discounted.status, 200);
  assert.equal(discounted.data.fields.amount, "488.82");
  assert.equal(h.inserted[1].total_paise, 48882);
  assert.equal(h.inserted[1].discount_paise, 10000);
  assert.equal(h.inserted[1].coupon_code, "DAX100");
  const removed = await h.post({});
  assert.equal(removed.data.fields.amount, "588.82");
  assert.equal(h.inserted[2].coupon_code, null);
  const invalid = await h.post({ couponCode: "BAD" });
  assert.equal(invalid.status, 400);
  assert.equal(h.inserted.length, 3);
  assert.equal(h.rpcCalls.length, 0);
});

test("zero-total coupon enrolls through the server without PayU", async () => {
  process.env.COURSE_PRICE_INR = "50";
  const cheapCourse = loadTs("lib/course.ts");
  process.env.COURSE_PRICE_INR = "499";
  const h = createHarness(cheapCourse);
  const result = await h.post({ couponCode: "DAX100" });
  assert.equal(result.status, 200);
  assert.equal(result.data.completed, true);
  assert.equal(h.inserted[0].total_paise, 0);
  assert.equal(h.rpcCalls[0].name, "finalize_zero_total_coupon_purchase");
});

test("database rejection does not hand an invalid order to PayU", async () => {
  const h = createHarness();
  h.setOrderError({ code: "23514", message: "payment_orders_check rejected discounted total" });
  const originalError = console.error;
  console.error = () => {};
  try {
    const result = await h.post({ couponCode: "DAX100" });
    assert.equal(result.status, 500);
    assert.equal(result.data.code, "ORDER_23514");
    assert.equal(result.data.action, undefined);
  } finally {
    console.error = originalError;
  }
});

test("removing an applied coupon immediately restores the original UI total", () => {
  const states = ["DAX100", coupon.getCouponQuote("DAX100"), "", false, false, ""];
  let stateIndex = 0;
  const component = loadTs("components/CheckoutButton.tsx", {
    react: { useState: initial => {
      const index = stateIndex++;
      if (states[index] === undefined) states[index] = initial;
      return [states[index], value => { states[index] = value; }];
    } },
    "@/lib/course": course,
  }).default;
  const props = { courseName: "Test Course", basePricePaise: 49900, gstPaise: 8982, originalTotalPaise: 58882, gstRate: .18, defaultName: "Test User", email: "test@example.invalid", defaultPhone: "9999999999" };
  const walk = (node, visit) => {
    if (Array.isArray(node)) return node.forEach(child => walk(child, visit));
    if (!node || typeof node !== "object" || !node.props) return;
    visit(node);
    walk(node.props.children, visit);
  };
  const applied = component(props);
  let removeButton;
  const appliedText = [];
  walk(applied, node => {
    if (node.type === "button" && node.props.children === "Remove") removeButton = node;
    if (typeof node.props.children === "string") appliedText.push(node.props.children);
  });
  assert.ok(removeButton);
  assert.ok(appliedText.some(text => text.includes("488.82")));
  removeButton.props.onClick();
  assert.equal(states[0], "");
  assert.equal(states[1], null);
  stateIndex = 0;
  const removed = component(props);
  const removedText = [];
  walk(removed, node => { if (typeof node.props.children === "string") removedText.push(node.props.children); });
  assert.ok(removedText.some(text => text.includes("588.82")));
  assert.equal(removedText.some(text => text.includes("488.82")), false);
});

test("PayU callback grants access only after a matching verified payment", async () => {
  const rpcCalls = [];
  const events = [];
  const order = { txnid: "YTC_TEST", user_id: "test-user", total_paise: 48882, customer_email: "test@example.invalid" };
  const admin = { from(table) {
    if (table === "payment_orders") return { select() { return this; }, eq() { return this; }, maybeSingle: async () => ({ data: order }) };
    if (table === "payment_events") return { insert: async value => { events.push(value); return { error: null }; } };
    throw new Error(`Unexpected table ${table}`);
  }, rpc: async (name, args) => { rpcCalls.push({ name, args }); return { error: null }; } };
  const verified = { txnid: "YTC_TEST", amountPaise: 48882, productinfo: course.COURSE_SLUG, email: "test@example.invalid", status: "success", unmappedstatus: "captured", error: "e000", mihpayid: "verified-payu-id" };
  const route = loadTs("app/api/payu/callback/route.ts", {
    "next/server": { NextResponse: { redirect: (url, options) => ({ location: String(url), status: options.status }) } },
    "@/lib/supabase/admin": { createAdminClient: () => admin },
    "@/lib/payu": { ...payu, verifyPayUPayment: async () => verified, verifyPayUResponseHash: () => true },
  });
  const form = new FormData();
  form.set("txnid", "YTC_TEST");
  form.set("status", "success");
  const result = await route.POST({ formData: async () => form });
  assert.equal(result.location, "https://example.test/thank-you");
  assert.equal(result.status, 303);
  assert.equal(rpcCalls[0].name, "finalize_course_purchase");
  assert.equal(rpcCalls[0].args.p_verified_status, "success");
  assert.equal(events[0].event_type, "callback_verified");
});

test("failed PayU callback never grants access or overwrites a paid order", async () => {
  const updates = [];
  const rpcCalls = [];
  const order = { txnid: "YTC_TEST", user_id: "test-user", total_paise: 48882, customer_email: "test@example.invalid" };
  const admin = { from(table) {
    assert.equal(table, "payment_orders");
    return {
      select() { return this; },
      update(value) { updates.push(value); return this; },
      eq(column, value) { if (updates.length) updates.push({ column, value }); return this; },
      maybeSingle: async () => ({ data: order }),
      then(resolve) { return Promise.resolve({ error: null }).then(resolve); },
    };
  }, rpc: async (...args) => { rpcCalls.push(args); return { error: null }; } };
  const route = loadTs("app/api/payu/callback/route.ts", {
    "next/server": { NextResponse: { redirect: (url, options) => ({ location: String(url), status: options.status }) } },
    "@/lib/supabase/admin": { createAdminClient: () => admin },
    "@/lib/payu": { ...payu, verifyPayUResponseHash: () => true, verifyPayUPayment: async () => { throw new Error("Should not verify a failed callback"); } },
  });
  const form = new FormData();
  form.set("txnid", "YTC_TEST");
  form.set("status", "failure");
  const result = await route.POST({ formData: async () => form });
  assert.equal(result.location, "https://example.test/buy?payment=failed");
  assert.ok(updates.some(entry => entry.column === "status" && entry.value === "pending"));
  assert.equal(rpcCalls.length, 0);
});

test.after(() => {
  for (const [name, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});
