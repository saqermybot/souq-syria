"use client";
import { useEffect } from "react";
export default function LegacyDetailsRedirect() {
  useEffect(()=>{ window.location.href="/post"; },[]);
  return null;
}
