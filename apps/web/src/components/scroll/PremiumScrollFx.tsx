"use client";

import { useEffect } from "react";

type RevealElement = HTMLElement & {
  dataset: DOMStringMap & {
    revealDelay?: string;
  };
};

type ParallaxElement = HTMLElement & {
  dataset: DOMStringMap & {
    parallax?: string;
  };
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function PremiumScrollFx() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const isTouchLike = window.matchMedia("(pointer: coarse)").matches;

    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let lastY = window.scrollY;
    let rafId = 0;

    const revealElements = Array.from(document.querySelectorAll<RevealElement>("[data-reveal]"));
    const parallaxElements = Array.from(document.querySelectorAll<ParallaxElement>("[data-parallax]"));

    for (const element of revealElements) {
      const delayRaw = Number(element.dataset.revealDelay ?? "0");
      if (!Number.isNaN(delayRaw) && delayRaw > 0) {
        element.style.transitionDelay = `${delayRaw}ms`;
      }
      element.classList.add("sl-reveal");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );

    for (const element of revealElements) observer.observe(element);

    const onScroll = () => {
      targetY = window.scrollY;
    };

    const onResize = () => {
      targetY = window.scrollY;
      currentY = window.scrollY;
    };

    const render = () => {
      if (isTouchLike) {
        currentY = targetY;
      } else {
        const delta = targetY - currentY;
        currentY += delta * 0.085;
      }

      const velocity = currentY - lastY;
      lastY = currentY;

      const pageMax = Math.max(document.body.scrollHeight - window.innerHeight, 1);
      const progress = clamp(currentY / pageMax, 0, 1);

      root.style.setProperty("--sl-scroll-progress", progress.toFixed(4));
      root.style.setProperty("--sl-scroll-velocity", velocity.toFixed(4));
      root.style.setProperty("--sl-scroll-y", currentY.toFixed(2));

      const viewportCenter = window.innerHeight * 0.52;

      for (const element of parallaxElements) {
        const strength = Number(element.dataset.parallax ?? "0");
        if (Number.isNaN(strength) || strength === 0) continue;

        const rect = element.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const distance = viewportCenter - elementCenter;
        const moveY = distance * strength * 0.08;
        const scale = 1 + Math.abs(strength) * 0.012;

        element.style.transform = `translate3d(0, ${moveY.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
      }

      rafId = window.requestAnimationFrame(render);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    rafId = window.requestAnimationFrame(render);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.cancelAnimationFrame(rafId);
      observer.disconnect();

      root.style.removeProperty("--sl-scroll-progress");
      root.style.removeProperty("--sl-scroll-velocity");
      root.style.removeProperty("--sl-scroll-y");

      for (const element of parallaxElements) {
        element.style.removeProperty("transform");
      }
    };
  }, []);

  return null;
}
