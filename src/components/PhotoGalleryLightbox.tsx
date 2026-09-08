"use client";

import { useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import SmartImage from "@/components/SmartImage";

interface PhotoGalleryLightboxProps {
  images: string[];
  altPrefix: string;
}

export default function PhotoGalleryLightbox({ images, altPrefix }: PhotoGalleryLightboxProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const showPrev = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length)),
    [images.length]
  );
  const showNext = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length]
  );

  useEffect(() => {
    if (openIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") showPrev();
      else if (e.key === "ArrowRight") showNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, close, showPrev, showNext]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {images.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="group relative aspect-[4/5] overflow-hidden bg-[var(--cream)] cursor-zoom-in"
            aria-label={`View ${altPrefix} — detail ${i + 1} full size`}
          >
            <SmartImage
              src={src}
              alt={`${altPrefix} — detail ${i + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, 300px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {openIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-4 md:p-10"
            onClick={close}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-5 top-5 text-[13px] uppercase tracking-[0.14em] text-white/70 transition-colors hover:text-white"
            >
              Close &times;
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    showPrev();
                  }}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 -translate-y-1/2 px-3 py-6 text-2xl text-white/60 transition-colors hover:text-white md:left-6"
                >
                  &lsaquo;
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    showNext();
                  }}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-6 text-2xl text-white/60 transition-colors hover:text-white md:right-6"
                >
                  &rsaquo;
                </button>
              </>
            )}

            <motion.div
              key={openIndex}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="relative h-full max-h-[85vh] w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <SmartImage
                src={images[openIndex]}
                alt={`${altPrefix} — detail ${openIndex + 1}`}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </motion.div>

            {images.length > 1 && (
              <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-[0.14em] text-white/50">
                {openIndex + 1} / {images.length}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
