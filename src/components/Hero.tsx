"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create a GSAP timeline for choreographed entrance
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    // 1. Text elements slide and fade
    tl.fromTo(
      containerRef.current.querySelectorAll(".eyebrow, h1, .lead, .hero-cta, .seats-pill"),
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1.2, stagger: 0.15 }
    );

    // 2. Animated background blobs
    tl.fromTo(
      containerRef.current.querySelectorAll(".hero-bg-blob"),
      { opacity: 0, scale: 0.6 },
      { opacity: 1, scale: 1, duration: 1.8, ease: "power3.out", stagger: 0.15 },
      "-=1.2"
    );
  }, []);

  return (
    <section className="hero" ref={containerRef}>
      {/* Soft background glow blobs */}
      <div className="hero-bg-blob blob-1" style={{ opacity: 0 }}></div>
      <div className="hero-bg-blob blob-2" style={{ opacity: 0 }}></div>

      <div className="container hero-container">
        <div className="hero-content">
          <div className="eyebrow" style={{ opacity: 0 }}>
            Arabian Ranches · Invite Only
          </div>
          <h1 style={{ opacity: 0 }}>
            A circle of <em>women</em>
            <br />
            who bring their <span className="script">stories,</span>
            <br />
            skills &amp; warmth.
          </h1>
          <p className="lead" style={{ opacity: 0 }}>
            Connecting Hearts is a community for women aged 50 and above living
            in or around Arabian Ranches — a weekly gathering where we share
            what we love, learn from each other, and build the kind of
            friendships that nourish a life well-lived.
          </p>
          <div className="hero-cta" style={{ opacity: 0 }}>
            <a href="#register" className="btn-primary">
              Request your seat →
            </a>
            <a href="#about" className="btn-secondary">
              Learn more
            </a>
          </div>
          <div className="seats-pill" style={{ opacity: 0 }}>
            <span className="dot"></span>
            Limited to 50 founding members · Free to join
          </div>
        </div>
      </div>
    </section>
  );
}
