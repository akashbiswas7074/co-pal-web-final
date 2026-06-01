"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  const [logo, setLogo] = useState<{ logoUrl: string; name: string; altText: string } | null>(null);

  useEffect(() => {
    fetch("/api/website/logo", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.logo) setLogo(d.logo);
        else if (d.defaultLogo) setLogo(d.defaultLogo);
      })
      .catch(() => {});
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8f9ff",
        fontFamily: "'Segoe UI', sans-serif",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      {/* Decorative blobs */}
      <div style={{
        position: "absolute", width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(120,80,255,0.07) 0%, transparent 70%)",
        top: "-150px", right: "-150px", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: 350, height: 350, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,200,180,0.05) 0%, transparent 70%)",
        bottom: "-100px", left: "-100px", pointerEvents: "none",
      }} />

      {/* Logo */}
      <div style={{ marginBottom: 36 }}>
        {logo?.logoUrl ? (
          <Image
            src={logo.logoUrl}
            alt={logo.altText || "Logo"}
            width={140}
            height={50}
            style={{ objectFit: "contain", maxHeight: 56 }}
          />
        ) : (
          <div style={{ fontSize: 22, fontWeight: 800, color: "#1a1a2e", letterSpacing: 2, opacity: 0.9 }}>
            PEEDS Sports
          </div>
        )}
      </div>

      {/* Giant 404 */}
      <div style={{ position: "relative", marginBottom: 4 }}>
        <span
          style={{
            fontSize: "clamp(100px, 20vw, 180px)", fontWeight: 900,
            color: "transparent",
            WebkitTextStroke: "2px rgba(255,255,255,0.12)",
            lineHeight: 1, display: "block", userSelect: "none",
            letterSpacing: -8,
          }}
        >
          404
        </span>
        <span
          style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "clamp(100px, 20vw, 180px)", fontWeight: 900,
            background: "linear-gradient(135deg, #a78bfa 0%, #60a5fa 50%, #34d399 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1, letterSpacing: -8,
            filter: "blur(0px)",
            opacity: 0.9,
          }}
        >
          404
        </span>
      </div>

      {/* Tagline */}
      <p style={{
        fontSize: 20, fontWeight: 700, color: "#1a1a2e",
        margin: "12px 0 8px", letterSpacing: 0.5,
      }}>
        Page Not Found
      </p>

      <p style={{
        fontSize: 15, color: "#555", margin: "0 0 16px", maxWidth: 380, lineHeight: 1.6,
      }}>
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>

      <p style={{
        fontSize: 14, color: "#888", margin: "0 0 40px", maxWidth: 360,
      }}>
        Try refreshing the page, or head back to the homepage to find what you need.
      </p>

      {/* CTAs */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "linear-gradient(135deg, #a78bfa, #60a5fa)",
            color: "#fff", borderRadius: 12,
            padding: "14px 28px", fontSize: 15, fontWeight: 700,
            textDecoration: "none", boxShadow: "0 8px 30px rgba(167,139,250,0.3)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Go to Homepage
        </Link>

        <Link
          href="/shop"
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "rgba(0,0,0,0.06)", color: "#1a1a2e",
            border: "1px solid rgba(0,0,0,0.12)", borderRadius: 12,
            padding: "14px 28px", fontSize: 15, fontWeight: 600,
            textDecoration: "none", backdropFilter: "blur(10px)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          Browse Shop
        </Link>

        <button
          onClick={() => { if (typeof window !== "undefined") window.location.reload(); }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "rgba(0,0,0,0.04)", color: "#555",
            border: "1px solid rgba(0,0,0,0.1)", borderRadius: 12,
            padding: "14px 24px", fontSize: 14, fontWeight: 500,
            cursor: "pointer", backdropFilter: "blur(10px)",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Footer */}
      <p style={{ marginTop: 52, fontSize: 12, color: "rgba(0,0,0,0.3)" }}>
        {logo?.name || "PEEDS Sports"} · All rights reserved
      </p>
    </div>
  );
}
