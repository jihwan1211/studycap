"use client";
import {useEffect, useState, type RefObject} from "react";

export function useCapsuleScroll(journeyRef: RefObject<HTMLElement | null>) {
 const [state, setState] = useState({progress: 0, mobile: false, reducedMotion: false});
 useEffect(() => {
  const mobile = window.matchMedia("(max-width: 760px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  function update() {
   frame = 0;
   const journey = journeyRef.current;
   if (!journey) return;
   const distance = Math.max(1, journey.offsetHeight - window.innerHeight);
   setState({progress: Math.max(0, Math.min(1, -journey.getBoundingClientRect().top / distance)), mobile: mobile.matches, reducedMotion: reducedMotion.matches});
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  update();
  window.addEventListener("scroll", schedule, {passive: true});
  window.addEventListener("resize", schedule);
  reducedMotion.addEventListener("change", schedule);
  mobile.addEventListener("change", schedule);
  return () => {
   cancelAnimationFrame(frame);
   window.removeEventListener("scroll", schedule);
   window.removeEventListener("resize", schedule);
   reducedMotion.removeEventListener("change", schedule);
   mobile.removeEventListener("change", schedule);
  };
 }, [journeyRef]);
 return state;
}
