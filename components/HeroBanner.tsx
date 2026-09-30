'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store-context';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';

interface HeroBannerProps {
  onExploreClick: () => void;
}

export function HeroBanner({ onExploreClick }: HeroBannerProps) {
  const { settings } = useStore();
  const activeBanners = settings.banners.filter((b) => b.active);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-6">
      <div className="relative overflow-hidden rounded-3xl bg-[#5C4033] shadow-xl min-h-[360px] sm:min-h-[420px] flex items-center">
        {/* Background Image with Warm Gradient Overlay */}
        <div className="absolute inset-0">
          <img
            src={currentBanner.imageUrl}
            alt={currentBanner.title}
            className="w-full h-full object-cover object-center scale-105 transition-all duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#5C4033]/90 via-[#5C4033]/70 to-transparent" />
          <div className="absolute inset-0 bg-radial from-transparent via-[#5C4033]/30 to-[#5C4033]/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-2xl p-6 sm:p-12 md:p-16 text-white space-y-4">
          {currentBanner.badge && (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#C49A45]/30 text-[#F5EBDD] border border-[#C49A45]/60 text-xs font-semibold backdrop-blur-xs tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#C49A45]" />
              <span>{currentBanner.badge}</span>
            </div>
          )}

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight text-[#FFFDF9]">
            {currentBanner.title}
          </h1>

          <p className="text-sm sm:text-base text-[#F5EBDD]/90 max-w-xl font-light leading-relaxed">
            {currentBanner.subtitle}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onExploreClick}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C49A45] hover:bg-[#b58b38] text-white font-semibold text-sm shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
            >
              <span>Ver Catálogo Completo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href={`https://wa.me/55${settings.whatsapp}?text=Ol%C3%A1!%20Gostaria%20de%20um%20or%C3%A7amento%20personalizado.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-[#FFFDF9] font-medium text-sm backdrop-blur-xs border border-white/20 transition"
            >
              <span>Orçamento Sob Medida</span>
            </a>
          </div>
        </div>

        {/* Navigation Arrows */}
        {activeBanners.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-xs transition"
              aria-label="Banner anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % activeBanners.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-xs transition"
              aria-label="Próximo banner"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Pagination Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
              {activeBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex ? 'w-6 bg-[#C49A45]' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Ir para banner ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
