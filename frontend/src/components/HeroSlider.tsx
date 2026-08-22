"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    title: "Mega Midweek Sale",
    subtitle: "Up to 40% off electronics and fashion",
    image:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=80",
    href: "/search?q=phone",
  },
  {
    title: "Fresh Fashion Drops",
    subtitle: "New arrivals for every wardrobe",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&q=80",
    href: "/category/fashion",
  },
  {
    title: "Home Comfort Picks",
    subtitle: "Make every room feel warmer",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400&q=80",
    href: "/category/home",
  },
];

export function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  const slide = slides[index];

  return (
    <section className="relative h-[34vh] min-h-[220px] w-full overflow-hidden max-[480px]:h-[28vh] max-[480px]:min-h-[180px] sm:h-[46vh] lg:h-[52vh]">
      {slides.map((s, i) => (
        <div
          key={s.title}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={s.image}
            alt={s.title}
            fill
            priority={i === 0}
            className="object-cover"
            sizes="100vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/55" />
        </div>
      ))}
      <div className="relative z-10 mx-auto flex h-full w-full flex-col items-center justify-center px-2.5 text-center">
        <p className="animate-fade-up font-display text-4xl font-extrabold text-white max-[480px]:text-2xl sm:text-5xl md:text-6xl">
          IoT programmers
        </p>
        <h1
          key={slide.title}
          className="animate-slide-in mt-2 text-xl font-semibold text-white max-[480px]:mt-1 max-[480px]:text-base sm:text-2xl"
        >
          {slide.title}
        </h1>
        <p className="mt-2 max-w-md text-sm text-white/85 max-[480px]:mt-1 max-[480px]:text-xs sm:text-base">
          {slide.subtitle}
        </p>
        <Link
          href={slide.href}
          className="mt-5 inline-flex rounded-md bg-amer-orange px-5 py-2.5 text-sm font-bold text-white transition hover:bg-amer-orange-dark max-[480px]:mt-3 max-[480px]:px-4 max-[480px]:py-2 max-[480px]:text-xs"
        >
          Shop now
        </Link>
        <div className="mt-6 flex justify-center gap-2 max-[480px]:mt-3">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full ${
                i === index ? "bg-amer-orange" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
