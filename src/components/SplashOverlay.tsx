"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Props = {
  /** Image path under /public (e.g. "/efootball1.jpeg") */
  src: string;
  /** SessionStorage key so we only show once per tab/session. */
  sessionKey?: string;
  /** Minimum time to show splash even if image loads instantly. */
  minMs?: number;
};

export function SplashOverlay({
  src,
  sessionKey = "karatina_splash_seen_v1",
  minMs = 1200,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(sessionKey) === "1") return;
      setVisible(true);
      const t = window.setTimeout(() => setReady(true), minMs);
      return () => window.clearTimeout(t);
    } catch {
      // If sessionStorage is blocked, still show once.
      setVisible(true);
      const t = window.setTimeout(() => setReady(true), minMs);
      return () => window.clearTimeout(t);
    }
  }, [minMs, sessionKey]);

  useEffect(() => {
    if (!visible || !ready) return;
    try {
      sessionStorage.setItem(sessionKey, "1");
    } catch {
      /* ignore */
    }
  }, [ready, sessionKey, visible]);

  if (!visible) return null;

  const shouldHide = ready;

  return (
    <div
      className={[
        "fixed inset-0 z-[60] flex items-center justify-center bg-black transition-opacity duration-500",
        shouldHide ? "pointer-events-none opacity-0" : "opacity-100",
      ].join(" ")}
      aria-hidden
    >
      <div className="relative h-full w-full">
        <Image
          src={src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          onLoadingComplete={() => {
            // If image is slow, we still need to wait minMs; if minMs already passed,
            // allow fade immediately.
            setReady((r) => r);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-black/40" />
      </div>
    </div>
  );
}

