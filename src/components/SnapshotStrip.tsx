"use client";

import React from "react";
import { motion } from "framer-motion";

export function SnapshotStrip() {
  const polaroids = [
    {
      id: 1,
      caption: (
        <>
          Persian Tea
          <br />& Poetry
        </>
      ),
      p1: "#b8533a",
      p2: "#d9a48a",
      rot: -4,
      marginTop: "30px",
      svg: (
        <svg
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
        >
          <path
            d="M20 50 L20 70 Q20 80 30 80 L50 80 Q60 80 60 70 L60 50 Z"
            opacity="0.9"
          />
          <path
            d="M60 55 Q70 55 70 62 Q70 68 60 68"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <ellipse cx="40" cy="50" rx="20" ry="3" opacity="0.6" />
          <path
            d="M28 40 Q30 35 28 30"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            opacity="0.7"
          />
          <path
            d="M40 38 Q42 33 40 28"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            opacity="0.7"
          />
          <path
            d="M52 40 Q54 35 52 30"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            opacity="0.7"
          />
        </svg>
      ),
    },
    {
      id: 2,
      caption: (
        <>
          Crochet
          <br />
          Circle
        </>
      ),
      p1: "#8f3d29",
      p2: "#c79a4b",
      rot: 2,
      marginTop: "0px",
      svg: (
        <svg
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
        >
          <circle cx="40" cy="55" r="22" opacity="0.4" />
          <circle
            cx="40"
            cy="55"
            r="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M22 50 Q45 48 58 60"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M20 55 Q45 55 60 65"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M22 60 Q45 62 58 70"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M28 70 Q40 75 50 73"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M60 60 L78 30"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M76 28 Q82 28 82 34"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      id: 3,
      caption: (
        <>
          Garden Walk
          <br />& Cuttings
        </>
      ),
      p1: "#6b6b3a",
      p2: "#c79a4b",
      rot: -2,
      marginTop: "40px",
      svg: (
        <svg
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
        >
          <g transform="translate(35,40)">
            <circle cx="0" cy="-10" r="6" opacity="0.85" />
            <circle cx="9" cy="-3" r="6" opacity="0.85" />
            <circle cx="6" cy="8" r="6" opacity="0.85" />
            <circle cx="-6" cy="8" r="6" opacity="0.85" />
            <circle cx="-9" cy="-3" r="6" opacity="0.85" />
            <circle cx="0" cy="0" r="4" fill="#f6efe4" />
          </g>
          <g transform="translate(65,55)">
            <circle cx="0" cy="-8" r="5" opacity="0.85" />
            <circle cx="7" cy="-2" r="5" opacity="0.85" />
            <circle cx="5" cy="7" r="5" opacity="0.85" />
            <circle cx="-5" cy="7" r="5" opacity="0.85" />
            <circle cx="-7" cy="-2" r="5" opacity="0.85" />
            <circle cx="0" cy="0" r="3" fill="#f6efe4" />
          </g>
          <path d="M35 50 L35 80" stroke="currentColor" strokeWidth="1.5" />
          <path d="M65 63 L65 85" stroke="currentColor" strokeWidth="1.5" />
          <ellipse
            cx="30"
            cy="65"
            rx="8"
            ry="3"
            transform="rotate(-30 30 65)"
            opacity="0.7"
          />
          <ellipse
            cx="72"
            cy="72"
            rx="7"
            ry="3"
            transform="rotate(30 72 72)"
            opacity="0.7"
          />
        </svg>
      ),
    },
    {
      id: 4,
      caption: (
        <>
          Sourdough
          <br />
          Wednesdays
        </>
      ),
      p1: "#d9a48a",
      p2: "#b8533a",
      rot: 5,
      marginTop: "10px",
      svg: (
        <svg
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
        >
          <ellipse cx="50" cy="55" rx="32" ry="20" opacity="0.85" />
          <path
            d="M28 50 Q30 45 33 50"
            fill="none"
            stroke="#f6efe4"
            strokeWidth="1.5"
          />
          <path
            d="M40 47 Q42 42 45 47"
            fill="none"
            stroke="#f6efe4"
            strokeWidth="1.5"
          />
          <path
            d="M52 46 Q54 41 57 46"
            fill="none"
            stroke="#f6efe4"
            strokeWidth="1.5"
          />
          <path
            d="M64 47 Q66 42 69 47"
            fill="none"
            stroke="#f6efe4"
            strokeWidth="1.5"
          />
          <ellipse
            cx="50"
            cy="55"
            rx="32"
            ry="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.6"
          />
          <path
            d="M20 75 Q50 78 80 75"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      ),
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

    const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const getPolaroidVariants = (rot: number) => ({
    hidden: { opacity: 0, y: 60, rotate: 0 },
    visible: {
      opacity: 1,
      y: 0,
      rotate: rot,
      transition: {
        type: "spring" as const,
        stiffness: 70,
        damping: 15,
      },
    },
  });

  return (
    <motion.section
      className="featured-photos"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="container">
        <motion.div className="strip-eyebrow" variants={textVariants}>
          <div className="label">~ recent moments ~</div>
          <div className="sub">a few snapshots from our gatherings</div>
        </motion.div>

        <motion.div
          className="polaroid-strip"
          variants={listVariants}
        >
          {polaroids.map((p) => (
            <motion.div
              className="polaroid"
              key={p.id}
              style={{ marginTop: p.marginTop }}
              variants={getPolaroidVariants(p.rot)}
              whileHover={{
                rotate: 0,
                y: -12,
                scale: 1.05,
                transition: { type: "spring" as const, stiffness: 350, damping: 15 },
              }}
            >
              <div className="polaroid-tape"></div>
              <div
                className="polaroid-photo"
                style={
                  {
                    "--p1": p.p1,
                    "--p2": p.p2,
                  } as React.CSSProperties
                }
              >
                {p.svg}
              </div>
              <div className="polaroid-caption">{p.caption}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.p className="replace-note" variants={textVariants}>
          ↑ placeholder photos — to be replaced with snapshots from your meet-ups
        </motion.p>
      </div>
    </motion.section>
  );
}
