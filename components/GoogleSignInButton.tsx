"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function GoogleSignInButton({ next = "/buy" }: { next?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function signIn() {
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const callback = new URL("/auth/callback", window.location.origin);
      callback.searchParams.set("next", next.startsWith("/") ? next : "/buy");

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callback.toString(),
          queryParams: { prompt: "select_account" },
        },
      });
      if (authError) throw authError;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start Google sign in.");
      setLoading(false);
    }
  }

  return (
    <div className="googleAuthWrap">
      <button className="googleAuthButton" type="button" onClick={signIn} disabled={loading}>
        <span className="googleMark" aria-hidden="true">G</span>
        <span>{loading ? "OPENING GOOGLE..." : "CONTINUE WITH GOOGLE"}</span>
        <span aria-hidden="true">→</span>
      </button>
      {error ? <p className="checkoutError" role="alert">{error}</p> : null}
    </div>
  );
}
