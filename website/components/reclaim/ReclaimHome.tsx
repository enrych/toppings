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
import SceneBreak from "./SceneBreak";
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
  // Persistent dev toolbar gate. Shows on localhost, or anywhere with
  // `?dev` — so the shipped site never renders it by default. Kept for
  // testing future work. Gated behind effect-set state → no SSR
  // hydration mismatch.
  const [showDev, setShowDev] = useState(false);

  useEffect(() => {
    const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(
      window.location.hostname,
    );
    setShowDev(local || window.location.search.includes("dev"));
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

      // The Break — pinned cinematic scrub on desktop; on mobile a
      // pinned tall stacked section janks, so there it's an unpinned
      // reveal that still strips the noise (CSS stacks it legibly).
      set(q(".r-break-copy .r-line"), { yPercent: 110 });
      set(q(".r-panel"), { x: 44, opacity: 0 });
      const proxy = { p: 0 };
      const setP = () => noiseRef.current?.setProgress(proxy.p);
      const desktop = window.matchMedia("(min-width: 821px)").matches;

      if (desktop) {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: ".r-break",
              start: "top top",
              end: "+=2600",
              scrub: 0.7,
              pin: true,
              anticipatePin: 1,
            },
          })
          .to(proxy, { p: 1, ease: "power2.inOut", duration: 0.42, onUpdate: setP }, 0)
          .fromTo(
            q(".r-darken"),
            { opacity: 0.5 },
            { opacity: 0.92, duration: 0.42 },
            0,
          )
          .from(q(".r-tag"), { autoAlpha: 0, duration: 0.3 }, 0.3)
          .to(q(".r-seam"), { scaleY: 1, ease: "expo.out", duration: 0.3 }, 0.34)
          .to(
            q(".r-panel"),
            { opacity: 1, x: 0, ease: "expo.out", duration: 0.42 },
            0.52,
          )
          .to(
            q(".r-break-copy .r-line"),
            { yPercent: 0, ease: "expo.out", duration: 0.7 },
            0.58,
          )
          .from(
            q(".r-break-copy .r-deck"),
            { autoAlpha: 0, y: 18, duration: 0.5 },
            0.8,
          );
      } else {
        ScrollTrigger.create({
          trigger: ".r-break",
          start: "top 78%",
          once: true,
          onEnter: () => {
            gsap
              .timeline()
              .to(proxy, { p: 1, duration: 1.1, ease: "power2.inOut", onUpdate: setP }, 0)
              .to(q(".r-darken"), { opacity: 0.92, duration: 1.0 }, 0)
              .to(
                q(".r-panel"),
                { opacity: 1, x: 0, duration: 0.7, ease: "expo.out" },
                0.15,
              )
              .to(
                q(".r-break-copy .r-line"),
                { yPercent: 0, duration: 0.7, ease: "expo.out" },
                0.3,
              )
              .from(
                q(".r-break-copy .r-deck"),
                { autoAlpha: 0, y: 16, duration: 0.5 },
                0.5,
              )
              .from(q(".r-tag"), { autoAlpha: 0, duration: 0.4 }, 0.05);
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
        <SceneBreak layout="split" />
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
