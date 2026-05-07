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
import DevToggle from "./DevToggle";
import SceneFeatures from "./SceneFeatures";
import SceneControl from "./SceneControl";
import SceneHow from "./SceneHow";
import SceneQuiet from "./SceneQuiet";
import SceneTrust from "./SceneTrust";
import SceneClose from "./SceneClose";

export default function ReclaimHome() {
  const noiseRef = useRef<NoiseHandle>(null);
  const rootRef = useRef<HTMLDivElement>(null);
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

      gsap.to(q(".r-progress"), {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.4 },
      });

      set(q("[data-hero] .r-line"), { yPercent: 110 });
      gsap
        .timeline({ defaults: { ease: "expo.out", duration: 1.15 } })
        .from(q("[data-hero] .r-eyebrow"), { autoAlpha: 0, y: 16 }, 0)
        .to(q("[data-hero] .r-line"), { yPercent: 0, stagger: 0.1 }, 0.1)
        .from(q("[data-hero] .r-deck"), { autoAlpha: 0, y: 20 }, 0.55)
        .from(q("[data-hero] .r-hero-actions"), { autoAlpha: 0, y: 20 }, 0.7)
        .from(q("[data-hero] .r-trust"), { autoAlpha: 0, y: 14 }, 0.85)
        .from(q(".r-cue"), { autoAlpha: 0, y: 12 }, 1);

      const proxy = { p: 0 };
      const stripST = {
        trigger: ".r-hero",
        start: "top top",
        end: "bottom top",
        scrub: 0.7,
      } as const;
      gsap.fromTo(
        proxy,
        { p: 0 },
        {
          p: 1,
          ease: "none",
          onUpdate: () => noiseRef.current?.setProgress(proxy.p),
          scrollTrigger: stripST,
        },
      );
      gsap.fromTo(
        q(".r-darken"),
        { opacity: 0.5 },
        { opacity: 0.92, ease: "none", scrollTrigger: stripST },
      );

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
      <NoiseCanvas ref={noiseRef} />
      <div className="r-darken" aria-hidden />
      <Nav />
      <main className="r-flow">
        <SceneHero />
        <SceneFeatures />
        <SceneControl />
        <SceneHow />
        <SceneQuiet />
        <SceneTrust />
        <SceneClose />
      </main>
    </div>
  );
}
