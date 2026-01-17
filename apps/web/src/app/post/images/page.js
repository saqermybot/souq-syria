"use client";
import { useEffect } from "react";
export default function LegacyImagesRedirect() {
  useEffect(()=>{ window.location.href="/post"; },[]);
  return null;
}
