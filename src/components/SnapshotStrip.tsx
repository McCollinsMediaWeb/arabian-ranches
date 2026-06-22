"use client";

import React from "react";
import { motion } from "framer-motion";

interface PolaroidItem {
  id: string | number;
  caption: React.ReactNode;
  p1: string;
  p2: string;
  rot: number;
  marginTop: string;
  imageUrl?: string | null;
  svg?: React.ReactNode;
}

const defaultSVGs: Record<string, React.ReactNode> = {
  "seed-1": (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
      <path d="M20 50 L20 70 Q20 80 30 80 L50 80 Q60 80 60 70 L60 50 Z" opacity="0.9" />
      <path d="M60 55 Q70 55 70 62 Q70 68 60 68" fill="none" stroke="currentColor" strokeWidth="3" />
      <ellipse cx="40" cy="50" rx="20" ry="3" opacity="0.6" />
      <path d="M28 40 Q30 35 28 30" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.7" />
      <path d="M40 38 Q42 33 40 28" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.7" />
      <path d="M52 40 Q54 35 52 30" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.7" />
    </svg>
  ),
  "seed-2": (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
      <circle cx="40" cy="55" r="22" opacity="0.4" />
      <circle cx="40" cy="55" r="22" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M22 50 Q45 48 58 60" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M20 55 Q45 55 60 65" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M22 60 Q45 62 58 70" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M28 70 Q40 75 50 73" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M60 60 L78 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M76 28 Q82 28 82 34" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  "seed-3": (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
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
      <ellipse cx="30" cy="65" rx="8" ry="3" transform="rotate(-30 30 65)" opacity="0.7" />
      <ellipse cx="72" cy="72" rx="7" ry="3" transform="rotate(30 72 72)" opacity="0.7" />
    </svg>
  ),
  "seed-4": (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
      <ellipse cx="50" cy="55" rx="32" ry="20" opacity="0.85" />
      <path d="M28 50 Q30 45 33 50" fill="none" stroke="#f6efe4" strokeWidth="1.5" />
      <path d="M40 47 Q42 42 45 47" fill="none" stroke="#f6efe4" strokeWidth="1.5" />
      <path d="M52 46 Q54 41 57 46" fill="none" stroke="#f6efe4" strokeWidth="1.5" />
      <path d="M64 47 Q66 42 69 47" fill="none" stroke="#f6efe4" strokeWidth="1.5" />
      <ellipse cx="50" cy="55" rx="32" ry="20" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <path d="M20 75 Q50 78 80 75" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
};

const cameraSVG = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "40px", height: "40px", opacity: 0.6 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
  </svg>
);

const defaultPolaroids: PolaroidItem[] = [
  {
    id: "seed-1",
    caption: "Persian Tea\n& Poetry",
    p1: "#b8533a",
    p2: "#d9a48a",
    rot: -4,
    marginTop: "30px",
    imageUrl: null,
  },
  {
    id: "seed-2",
    caption: "Crochet\nCircle",
    p1: "#8f3d29",
    p2: "#c79a4b",
    rot: 2,
    marginTop: "0px",
    imageUrl: null,
  },
  {
    id: "seed-3",
    caption: "Garden Walk\n& Cuttings",
    p1: "#6b6b3a",
    p2: "#c79a4b",
    rot: -2,
    marginTop: "40px",
    imageUrl: null,
  },
  {
    id: "seed-4",
    caption: "Sourdough\nWednesdays",
    p1: "#d9a48a",
    p2: "#b8533a",
    rot: 5,
    marginTop: "10px",
    imageUrl: null,
  },
];

export function SnapshotStrip() {
  const [polaroids, setPolaroids] = React.useState<PolaroidItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/snapshots")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          const items = data.map((item: any) => ({
            id: item.id,
            caption: item.caption,
            p1: item.p1,
            p2: item.p2,
            rot: item.rotation,
            marginTop: item.marginTop,
            imageUrl: item.imageUrl,
          }));
          setPolaroids(items);
        } else {
          setPolaroids(defaultPolaroids);
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load snapshots:", err);
        setPolaroids(defaultPolaroids);
        setLoading(false);
      });
  }, []);

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

  const renderCaption = (text: string) => {
    return text.split("\n").map((line, idx) => (
      <React.Fragment key={idx}>
        {line}
        {idx < text.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  if (loading) {
    return (
      <section className="featured-photos">
        <div className="container" style={{ textAlign: "center", padding: "60px 0" }}>
          <p style={{ color: "var(--cream)", opacity: 0.6 }}>Loading snapshots...</p>
        </div>
      </section>
    );
  }

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
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt="Gathering Snapshot"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  defaultSVGs[String(p.id)] || cameraSVG
                )}
              </div>
              <div className="polaroid-caption">
                {typeof p.caption === "string" ? renderCaption(p.caption) : p.caption}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {polaroids.some((p) => p.imageUrl) ? null : (
          <motion.p className="replace-note" variants={textVariants}>
            ↑ placeholder photos — to be replaced with snapshots from your meet-ups
          </motion.p>
        )}
      </div>
    </motion.section>
  );
}
