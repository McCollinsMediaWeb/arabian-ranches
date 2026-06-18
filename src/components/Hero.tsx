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

    // 2. Circle background fade scale
    tl.fromTo(
      containerRef.current.querySelector(".hero-art-circle"),
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 1.5, ease: "power3.out" },
      "-=1.2"
    );

    // 3. Botanical SVG drawings fade and reveal elastically
    tl.fromTo(
      containerRef.current.querySelectorAll(".hero-art svg path, .hero-art svg ellipse, .hero-art svg circle, .hero-art svg g g path"),
      { opacity: 0, scale: 0.75, transformOrigin: "50% 50%" },
      { opacity: (i, el) => parseFloat(el.getAttribute("opacity") || "1"), scale: 1, duration: 2, ease: "elastic.out(1, 0.75)", stagger: 0.05 },
      "-=1.0"
    );

    // 4. Made with love & est. labels rotate and fade
    tl.fromTo(
      containerRef.current.querySelectorAll(".deco-1, .deco-2"),
      { opacity: 0, scale: 0.9, rotation: (i) => (i === 0 ? 0 : -20) },
      { opacity: 1, scale: 1, rotation: (i) => (i === 0 ? 8 : -6), duration: 1.2, ease: "back.out(1.7)" },
      "-=1.5"
    );
  }, []);

  return (
    <section className="hero" ref={containerRef}>
      <div className="container hero-grid">
        <div>
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

        <div className="hero-art">
          <div className="deco-1" style={{ opacity: 0 }}>
            made with love ♡
          </div>
          <div className="hero-art-circle" style={{ opacity: 0 }}></div>
          <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            {/* Decorative botanical illustrations */}
            <g stroke="#f6efe4" strokeWidth="1.5" fill="none" opacity="0.85">
              {/* leaves */}
              <path
                d="M80 320 Q120 280 100 220 Q90 200 110 180"
                strokeLinecap="round"
              />
              <ellipse
                cx="92"
                cy="240"
                rx="14"
                ry="6"
                transform="rotate(-30 92 240)"
                fill="#f6efe4"
                opacity="0.4"
              />
              <ellipse
                cx="103"
                cy="210"
                rx="12"
                ry="5"
                transform="rotate(20 103 210)"
                fill="#f6efe4"
                opacity="0.4"
              />

              <path
                d="M320 300 Q280 260 300 200 Q310 180 290 160"
                strokeLinecap="round"
              />
              <ellipse
                cx="306"
                cy="220"
                rx="14"
                ry="6"
                transform="rotate(30 306 220)"
                fill="#f6efe4"
                opacity="0.4"
              />
              <ellipse
                cx="296"
                cy="190"
                rx="12"
                ry="5"
                transform="rotate(-20 296 190)"
                fill="#f6efe4"
                opacity="0.4"
              />

              {/* center flower */}
              <circle cx="200" cy="200" r="14" fill="#c79a4b" />
              <circle
                cx="200"
                cy="200"
                r="14"
                fill="none"
                stroke="#f6efe4"
                strokeWidth="2"
              />
              <g strokeWidth="2">
                <path
                  d="M200 186 Q190 170 200 160 Q210 170 200 186"
                  fill="#f6efe4"
                  opacity="0.9"
                />
                <path
                  d="M200 214 Q190 230 200 240 Q210 230 200 214"
                  fill="#f6efe4"
                  opacity="0.9"
                />
                <path
                  d="M186 200 Q170 190 160 200 Q170 210 186 200"
                  fill="#f6efe4"
                  opacity="0.9"
                />
                <path
                  d="M214 200 Q230 190 240 200 Q230 210 214 200"
                  fill="#f6efe4"
                  opacity="0.9"
                />
                <path
                  d="M188 188 Q175 175 170 168 Q180 175 188 188"
                  fill="#f6efe4"
                  opacity="0.7"
                />
                <path
                  d="M212 188 Q225 175 230 168 Q220 175 212 188"
                  fill="#f6efe4"
                  opacity="0.7"
                />
                <path
                  d="M188 212 Q175 225 170 232 Q180 225 188 212"
                  fill="#f6efe4"
                  opacity="0.7"
                />
                <path
                  d="M212 212 Q225 225 230 232 Q220 225 212 212"
                  fill="#f6efe4"
                  opacity="0.7"
                />
              </g>

              {/* small hearts scattered */}
              <path
                d="M140 130 a4 4 0 0 1 8 0 a4 4 0 0 1 8 0 q0 4 -8 10 q-8 -6 -8 -10z"
                fill="#f6efe4"
                opacity="0.7"
                stroke="none"
              />
              <path
                d="M260 140 a3 3 0 0 1 6 0 a3 3 0 0 1 6 0 q0 3 -6 7.5 q-6 -4.5 -6 -7.5z"
                fill="#f6efe4"
                opacity="0.6"
                stroke="none"
              />
              <path
                d="M150 290 a3 3 0 0 1 6 0 a3 3 0 0 1 6 0 q0 3 -6 7.5 q-6 -4.5 -6 -7.5z"
                fill="#f6efe4"
                opacity="0.6"
                stroke="none"
              />
              <path
                d="M270 280 a4 4 0 0 1 8 0 a4 4 0 0 1 8 0 q0 4 -8 10 q-8 -6 -8 -10z"
                fill="#f6efe4"
                opacity="0.7"
                stroke="none"
              />
            </g>
          </svg>
          <div className="deco-2" style={{ opacity: 0 }}>
            est. 2026
          </div>
        </div>
      </div>
    </section>
  );
}
