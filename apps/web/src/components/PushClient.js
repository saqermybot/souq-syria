"use client";

import { useEffect } from "react";

export default function PushClient() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      console.log("SW not supported");
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("SW registered", reg.scope);
      })
      .catch((err) => {
        console.error("SW register failed", err);
      });
  }, []);

  return null;
}
