"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [logo, setLogo] = useState<{ logoUrl: string; name: string; altText: string } | null>(null);
  const [dots, setDots] = useState(".");

  useEffect(() => {
    console.error(error);
    // Fetch logo from backend
    fetch("/api/website/logo", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.logo) setLogo(d.logo);
        else if (d.defaultLogo) setLogo(d.defaultLogo);
      })
      .catch(() => {});
  }, [error]);

  // Animated dots for "refreshing" indicator
  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d.length >= 3 ? "." : d + ".")), 600);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        fontFamily: "'Segoe UI', sans-serif",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative blobs */}
      <div style={{
        position: "absolute", width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,100,100,0.12) 0%, transparent 70%)",
        top: "-100px", left: "-100px", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(100,100,255,0.15) 0%, transparent 70%)",
        bottom: "-80px", right: "-80px", pointerEvents: "none",
      }} />

      {/* Logo */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        {logo?.logoUrl ? (
          <Image
            src={logo.logoUrl}
            alt={logo.altText || "Logo"}
            width={140}
            height={50}
            style={{ objectFit: "contain", maxHeight: 56, filter: "brightness(0) invert(1)", opacity: 0.9 }}
          />
        ) : (
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: 2, opacity: 0.9 }}>
            {logo?.name || "PEEDS Sports"}
          </div>
        )}
      </div>

      {/* Error code badge */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20,
        background: "rgba(255,80,80,0.18)", border: "1px solid rgba(255,80,80,0.35)",
        borderRadius: 999, padding: "6px 18px",
      }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5050", display: "inline-block", animation: "pulse 1.5s infinite" }} />
        <span style={{ color: "#ff8080", fontSize: 13, fontWeight: 600, letterSpacing: 1 }}>ERROR</span>
      </div>

      {/* Main heading */}
      <h1 style={{
        fontSize: "clamp(40px, 8vw, 72px)", fontWeight: 900, color: "#ffffff",
        margin: "0 0 8px", letterSpacing: -2, textAlign: "center", lineHeight: 1,
      }}>
        Oops!
      </h1>

      <p style={{
        fontSize: 18, color: "rgba(255,255,255,0.65)", margin: "0 0 8px", textAlign: "center", maxWidth: 420,
      }}>
        Something went wrong on our end.
      </p>
      <p style={{
        fontSize: 14, color: "rgba(255,255,255,0.4)", margin: "0 0 40px", textAlign: "center", maxWidth: 380,
      }}>
        This is usually temporary. Try refreshing the page and it should be back to normal.
      </p>

      {/* CTA buttons */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={reset}
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "linear-gradient(135deg, #ff6b6b, #ee5a24)",
            color: "#fff", border: "none", borderRadius: 12,
            padding: "14px 28px", fontSize: 15, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 8px 30px rgba(238,90,36,0.35)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
        >
          {/* Refresh icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Refresh Page
        </button>

        <Link
          href="/"
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,0.1)", color: "#fff",
            border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12,
            padding: "14px 28px", fontSize: 15, fontWeight: 600,
            textDecoration: "none", backdropFilter: "blur(10px)",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.18)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.1)"; }}
        >
          {/* Home icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Go Home
        </Link>
      </div>

      {/* Footer hint */}
      <p style={{
        marginTop: 48, fontSize: 12, color: "rgba(255,255,255,0.25)", textAlign: "center",
      }}>
        If the problem persists, please contact support.
        {error?.digest && <><br /><span style={{ fontFamily: "monospace", opacity: 0.5 }}>Ref: {error.digest}</span></>}
      </p>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}
