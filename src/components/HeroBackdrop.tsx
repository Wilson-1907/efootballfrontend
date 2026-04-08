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

      {/* Top image (replaces the old silhouettes collage) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0">
          <Image
            src="/efootball.jpeg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-top opacity-85 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/55" />
        </div>
      </div>

      {/* Grain */}
      <div className="hero-grain pointer-events-none absolute inset-0 opacity-30" />
    </div>
  );
}

