import React, { useEffect, useRef, useState } from "react";
import promoDelMes from "../assets/hero/promo-del-mes.png";
import promo20Off from "../assets/hero/20-off.mp4";
import promoVideo from "../assets/hero/50-off.mp4";
import promoDia from "../assets/hero/el-dia-es-hoy.png";
import "../styles/HeroCarousel.css";

const AUTOPLAY_MS = 6000;
const INTERACTION_PAUSE_MS = 8000;

function HeroCarousel() {
  const slides = [
    { type: "video", src: promo20Off, alt: "Promo 20 por ciento off", durationMs: 8000 },
    { type: "image", src: promoDelMes, alt: "Promo del mes", durationMs: AUTOPLAY_MS },
    { type: "video", src: promoVideo, alt: "Promo 50 por ciento off", durationMs: AUTOPLAY_MS },
    { type: "image", src: promoDia, alt: "El dia es hoy", durationMs: AUTOPLAY_MS },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [pauseUntil, setPauseUntil] = useState(0);
  const resumeTimeoutRef = useRef(null);
  const videoRefs = useRef([]);

  const isPaused = pauseUntil > Date.now();

  useEffect(() => {
    if (isPaused) return undefined;
    const durationMs = slides[activeIndex]?.durationMs || AUTOPLAY_MS;
    const timer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, durationMs);
    return () => clearTimeout(timer);
  }, [activeIndex, isPaused, slides]);

  useEffect(
    () => () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    },
    []
  );

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === activeIndex) {
        video.currentTime = 0;
        const playPromise = video.play();
        if (playPromise?.catch) playPromise.catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [activeIndex]);

  const pauseAfterInteraction = () => {
    const until = Date.now() + INTERACTION_PAUSE_MS;
    setPauseUntil(until);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => setPauseUntil(0), INTERACTION_PAUSE_MS);
  };

  const goPrev = () => {
    pauseAfterInteraction();
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goNext = () => {
    pauseAfterInteraction();
    setActiveIndex((prev) => (prev + 1) % slides.length);
  };

  const goTo = (index) => {
    pauseAfterInteraction();
    setActiveIndex(index);
  };

  return (
    <section className="hero-carousel" aria-label="Promociones">
      <div className="hero-carousel-track">
        {slides.map((slide, index) => (
          <div
            key={`${slide.type}-${slide.src}`}
            className={`hero-carousel-slide ${activeIndex === index ? "active" : ""}`}
            aria-hidden={activeIndex !== index}
          >
            {slide.type === "video" ? (
              <video
                className="hero-carousel-media"
                src={slide.src}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}
              />
            ) : (
              <img className="hero-carousel-media" src={slide.src} alt={slide.alt} />
            )}
          </div>
        ))}
      </div>

      <button className="hero-carousel-arrow left" type="button" aria-label="Anterior" onClick={goPrev}>
        ‹
      </button>
      <button className="hero-carousel-arrow right" type="button" aria-label="Siguiente" onClick={goNext}>
        ›
      </button>

      <div className="hero-carousel-dots" role="tablist" aria-label="Seleccionar slide">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`hero-carousel-dot ${activeIndex === index ? "active" : ""}`}
            onClick={() => goTo(index)}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default HeroCarousel;
