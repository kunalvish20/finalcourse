"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      );

      const params = new URLSearchParams(window.location.search);
      const next = params.get("next") || "/buy";

      const callbackUrl = new URL(
        "/auth/callback",
        window.location.origin
      );

      callbackUrl.searchParams.set("next", next);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error("GOOGLE_LOGIN_FAILED", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to continue with Google."
      );

      setLoading(false);
    }
  };

  return (
    <main className="loginPage">
      <div className="loginGrid" />

      <header className="loginHeader">
        <a href="/" className="loginBrand">
          <img src="/Logo_dattrax.jpg" alt="Dattrax" className="loginBrandLogo" />

          <div>
            <strong>DATTRAX GAMING</strong>
            <span>CREATOR MASTERCLASS</span>
          </div>
        </a>
      </header>

      <section className="loginStage">
        <div className="loginCard">
          <div className="loginStatus">
            <span className="loginStatusDot" />
            SECURE MEMBER ACCESS
          </div>

          <div className="loginHeading">
            <span>01 / LOGIN</span>

            <h1>
              Continue to
              <br />
              your course.
            </h1>

            <p>
              Sign in with Google to purchase the course or access your
              existing lifetime membership.
            </p>
          </div>

          <button
            className="googleLoginButton"
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <span className="googleIcon">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M21.35 12.2c0-.74-.07-1.45-.2-2.13H12v4.03h5.23a4.47 4.47 0 0 1-1.94 2.93v2.62h3.14c1.84-1.7 2.92-4.2 2.92-7.45Z"
                />
                <path
                  fill="#34A853"
                  d="M12 21.7c2.63 0 4.84-.87 6.45-2.36l-3.14-2.62c-.87.58-1.99.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.3v2.7A9.74 9.74 0 0 0 12 21.7Z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.54 13.62A5.86 5.86 0 0 1 6.24 12c0-.56.1-1.1.3-1.62v-2.7H3.3A9.7 9.7 0 0 0 2.3 12c0 1.56.37 3.03 1 4.32l3.24-2.7Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 6.35c1.43 0 2.71.49 3.72 1.45l2.79-2.79A9.36 9.36 0 0 0 12 2.3a9.74 9.74 0 0 0-8.7 5.38l3.24 2.7C7.31 8.07 9.46 6.35 12 6.35Z"
                />
              </svg>
            </span>

            <span className="googleButtonText">
              {loading ? "CONNECTING..." : "CONTINUE WITH GOOGLE"}
            </span>

            <span className="googleArrow">→</span>
          </button>

          {error && (
            <div className="loginError">
              {error}
            </div>
          )}

          <div className="loginBenefits">
            <span>
              <i>✓</i>
              Secure Google login
            </span>

            <span>
              <i>✓</i>
              Lifetime access after purchase
            </span>
          </div>

          <div className="loginDivider" />

          <p className="loginCheckoutNote">
            New here? After signing in, you&apos;ll continue directly to
            checkout.
          </p>

          <p className="loginLegal">
            By continuing, you agree to our{" "}
            <a href="/terms">Terms</a> and{" "}
            <a href="/privacy">Privacy Policy</a>.
          </p>
        </div>
      </section>

      <footer className="loginFooter">
        <span>© {new Date().getFullYear()} Dattrax Gaming</span>

        <span className="loginFooterSecure">
          <i />
          SECURE ACCESS
        </span>
      </footer>
    </main>
  );
}
