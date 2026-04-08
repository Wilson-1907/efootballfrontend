import Image from "next/image";

/**
 * Konami/eFootball-ish hero backdrop.
 *
 * Note: we ship stylized SVG silhouettes (license-safe).
 * You can replace them with licensed images by dropping files into
 * `public/players/` with the same names.
 */
export function HeroBackdrop() {
  return (
    <div className="absolute inset-0">
      <div className="hero-gradient absolute inset-0 opacity-95" />

      {/* Moving light sweep */}
      <div className="hero-sweep pointer-events-none absolute -inset-24 opacity-60" />

      {/* Pitch base (field color/stripes) */}
      <div className="hero-pitch pointer-events-none absolute inset-x-0 bottom-0 h-[58%] sm:h-[62%]" />

      {/* Player silhouettes collage */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-10 top-0 hidden h-[115%] w-[65%] sm:block">
          <Image
            src="/players/player-a.svg"
            alt=""
            fill
            priority
            className="object-contain object-top opacity-80 mix-blend-screen"
          />
        </div>
        <div className="absolute right-[18%] top-[6%] hidden h-[92%] w-[46%] md:block">
          <Image
            src="/players/player-b.svg"
            alt=""
            fill
            className="object-contain object-top opacity-70 mix-blend-screen blur-[0.2px]"
          />
        </div>
        <div className="absolute -left-6 top-[10%] hidden h-[85%] w-[45%] lg:block">
          <Image
            src="/players/player-c.svg"
            alt=""
            fill
            className="object-contain object-top opacity-55 mix-blend-screen blur-[0.6px]"
          />
        </div>
      </div>

      {/* Grain */}
      <div className="hero-grain pointer-events-none absolute inset-0 opacity-30" />
    </div>
  );
}

