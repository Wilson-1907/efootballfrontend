"use client";

import { useEffect } from "react";

/** After welcome splash, scroll to hash stored by intro buttons (e.g. finals booking). */
export function IntroNavEffect() {
  useEffect(() => {
    const h = sessionStorage.getItem("kk_intro_hash");
    if (h) {
      sessionStorage.removeItem("kk_intro_hash");
      window.location.hash = h;
      return;
    }
    const tab = sessionStorage.getItem("kk_register_tab");
    if (tab === "signup" || tab === "login") {
      window.location.hash = "register";
    }
  }, []);
  return null;
}
