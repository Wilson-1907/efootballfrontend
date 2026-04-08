"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Props = {
  splashSrc: string;
  ms: number;
  children: React.ReactNode;
};

export function SplashGate({ splashSrc, ms, children }: Props) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setShowSplash(false), ms);
    return () => window.clearTimeout(t);
  }, [ms]);

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[60] bg-black">
        <div className="relative h-full w-full">
          <Image
            src={splashSrc}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-black/40" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

