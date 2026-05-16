"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import "./reclaim.css";
import NoiseCanvas, { type NoiseHandle } from "./NoiseCanvas";
import Cursor from "./Cursor";
import Nav from "./Nav";
import SceneHero from "./SceneHero";
import SceneReclaim from "./SceneReclaim";
import DevToggle from "./DevToggle";
import SceneFeatures from "./SceneFeatures";
import SceneAudio from "./SceneAudio";
import SceneControl from "./SceneControl";
import SceneHow from "./SceneHow";
import SceneQuiet from "./SceneQuiet";
import SceneTrust from "./SceneTrust";
import SceneClose from "./SceneClose";

/**
 * The whole experience. Lenis carries the scroll; GSAP ScrollTrigger
 * choreographs it — restrained, not busy: a mount cascade, the one
 * pinned Break beat, and a single quiet reveal per block as it enters.
 * No velocity gimmicks. The page should feel composed, not hyperactive.
 *
 * Reliability: reveals are progressive enhancement — CSS leaves content
 * visible; JS only hides it once Lenis/ST are confirmed up.
 *
 * Reduced motion: we skip the *journey* and present the *destination*.
 * `.is-static` drops the shader, unpins the Break and lays everything
 * out as a clean, calm, fully-resolved editorial page — the quiet
 * layer, statically. (Earlier this branch looked broken; now it's a
 * deliberate, finished alternate.)
 */
export default function ReclaimHome() {
  const noiseRef = useRef<NoiseHandle>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  // Dev toolbar is off by default now (nothing to test). It's kept in
  // the codebase and can be summoned anytime by appending `?dev` to the
  // URL for future experiments. Gated behind effect-set state → no SSR
  // hydration mismatch.
  const [showDev, setShowDev] = useState(false);

  useEffect(() => {
    setShowDev(window.location.search.includes("dev"));
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduce) {
      noiseRef.current?.setProgress(1);
      rootRef.current?.classList.add("is-static");
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ lerp: 0.09 });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context((self) => {
      const q = self.selector!;
      const set = gsap.set;

      // Scroll progress hairline — the one always-on accent.
      gsap.to(q(".r-progress"), {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.4 },
      });

      // Hero mount cascade.
      set(q("[data-hero] .r-line"), { yPercent: 110 });
      gsap
        .timeline({ defaults: { ease: "expo.out", duration: 1.15 } })
        .from(q("[data-hero] .r-eyebrow"), { autoAlpha: 0, y: 16 }, 0)
        .to(q("[data-hero] .r-line"), { yPercent: 0, stagger: 0.1 }, 0.1)
        .from(q("[data-hero] .r-deck"), { autoAlpha: 0, y: 20 }, 0.55)
        .from(q("[data-hero] .r-hero-actions"), { autoAlpha: 0, y: 20 }, 0.7)
        .from(q("[data-hero] .r-trust"), { autoAlpha: 0, y: 14 }, 0.85)
        .from(q(".r-cue"), { autoAlpha: 0, y: 12 }, 1);

      // No hero exit scrub — it created a dead, brighter screen between
      // the hero and the Break. The hero now scrolls straight into the
      // reclaim beat, which pins immediately (start: top top below).

      // The reclaim beat — one continuous moment, no seam, no split.
      // The headline is visible from the instant it enters (calm
      // continuation of the hero over the still-noisy shader) so there
      // is no dead/empty pre-pin screen. Scrub then strips the noise
      // and the de-noised Toppings screen resolves beneath the line.
      const proxy = { p: 0 };
      const setP = () => noiseRef.current?.setProgress(proxy.p);
      set(q(".r-reclaim-screen"), { autoAlpha: 0, y: 36, scale: 0.97 });
      set(q(".r-reclaim-deck"), { autoAlpha: 0, y: 16 });
      const desktop = window.matchMedia("(min-width: 821px)").matches;

      if (desktop) {
        // The headline ARRIVES as you scroll into the reclaim — a
        // scroll-linked entrance that finishes before the pin starts,
        // so it never shows while you're still on the hero and never
        // sits there pre-rendered.
        gsap.fromTo(
          q(".r-reclaim-head"),
          { autoAlpha: 0, y: 60 },
          {
            autoAlpha: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: ".r-reclaim-stage",
              start: "top 40%",
              end: "top 6%",
              scrub: 0.6,
            },
          },
        );

        gsap
          .timeline({
            scrollTrigger: {
              trigger: ".r-reclaim-stage",
              start: "top top",
              end: "+=2000",
              scrub: 0.7,
              pin: true,
              anticipatePin: 1,
            },
          })
          .to(proxy, { p: 1, ease: "power2.inOut", duration: 0.5, onUpdate: setP }, 0)
          .fromTo(
            q(".r-darken"),
            { opacity: 0.5 },
            { opacity: 0.9, duration: 0.5 },
            0,
          )
          .to(
            q(".r-reclaim-screen"),
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              ease: "expo.out",
              duration: 0.55,
            },
            0.34,
          )
          .to(
            q(".r-reclaim-deck"),
            { autoAlpha: 1, y: 0, ease: "expo.out", duration: 0.4 },
            0.72,
          );
      } else {
        ScrollTrigger.create({
          trigger: ".r-reclaim",
          start: "top 75%",
          once: true,
          onEnter: () => {
            gsap
              .timeline()
              .to(proxy, { p: 1, duration: 1.1, ease: "power2.inOut", onUpdate: setP }, 0)
              .to(q(".r-darken"), { opacity: 0.9, duration: 1.0 }, 0)
              .to(
                q(".r-reclaim-screen"),
                {
                  autoAlpha: 1,
                  y: 0,
                  scale: 1,
                  duration: 0.8,
                  ease: "expo.out",
                },
                0.2,
              )
              .to(
                q(".r-reclaim-deck"),
                { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" },
                0.6,
              );
          },
        });
      }

      // One quiet reveal per block (robust, progressive-enhanced).
      (q("[data-reveal]") as HTMLElement[]).forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          },
        );
      });

      ScrollTrigger.refresh();
    }, rootRef);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    if (document.fonts?.ready) document.fonts.ready.then(refresh);

    return () => {
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
      window.removeEventListener("load", refresh);
    };
  }, []);

  return (
    <div ref={rootRef} className="reclaim">
      <Cursor />
      {showDev && <DevToggle />}
      <div className="r-progress" aria-hidden />
      <NoiseCanvas ref={noiseRef} variant="signal" />
      <div className="r-darken" aria-hidden />
      <Nav />
      <main className="r-flow">
        <SceneHero />
        <SceneReclaim />
        <SceneFeatures />
        <SceneAudio />
        <SceneControl />
        <SceneHow />
        <SceneQuiet />
        <SceneTrust />
        <SceneClose />
      </main>
    </div>
  );
}
