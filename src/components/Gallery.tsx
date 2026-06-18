"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface GalleryItem {
  month: string;
  title: string;
  meta: string;
  photos: string;
  g1: string;
  g2: string;
  deco: "mezze" | "yarn" | "leaves" | "flower";
}

const decoSVGs: Record<string, React.ReactNode> = {
  mezze: (
    <svg
      className="deco-svg"
      viewBox="0 0 400 500"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none" stroke="#f6efe4" strokeWidth="1.5" opacity="0.7">
        <circle cx="100" cy="120" r="40" />
        <circle cx="220" cy="80" r="50" />
        <circle cx="320" cy="180" r="35" />
        <circle cx="80" cy="280" r="45" />
        <circle cx="250" cy="240" r="38" />
        <circle cx="340" cy="340" r="30" />
        <circle cx="150" cy="380" r="42" />
      </g>
    </svg>
  ),
  yarn: (
    <svg
      className="deco-svg"
      viewBox="0 0 400 500"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none" stroke="#f6efe4" strokeWidth="1.2" opacity="0.6">
        <path d="M50 100 Q120 80 180 120 T320 110" />
        <path d="M50 140 Q120 120 180 160 T320 150" />
        <path d="M50 180 Q120 160 180 200 T320 190" />
        <path d="M50 220 Q120 200 180 240 T320 230" />
        <path d="M80 320 Q150 300 220 340 T360 330" />
        <path d="M80 360 Q150 340 220 380 T360 370" />
        <path d="M80 400 Q150 380 220 420 T360 410" />
      </g>
    </svg>
  ),
  leaves: (
    <svg
      className="deco-svg"
      viewBox="0 0 400 500"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="#f6efe4" opacity="0.5">
        <ellipse
          cx="80"
          cy="100"
          rx="25"
          ry="10"
          transform="rotate(-30 80 100)"
        />
        <ellipse
          cx="320"
          cy="120"
          rx="30"
          ry="12"
          transform="rotate(40 320 120)"
        />
        <ellipse
          cx="200"
          cy="180"
          rx="28"
          ry="11"
          transform="rotate(-10 200 180)"
        />
        <ellipse
          cx="120"
          cy="250"
          rx="22"
          ry="9"
          transform="rotate(60 120 250)"
        />
        <ellipse
          cx="300"
          cy="280"
          rx="26"
          ry="10"
          transform="rotate(-45 300 280)"
        />
        <ellipse
          cx="180"
          cy="350"
          rx="30"
          ry="12"
          transform="rotate(20 180 350)"
        />
      </g>
    </svg>
  ),
  flower: (
    <svg
      className="deco-svg"
      viewBox="0 0 400 500"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="#f6efe4" opacity="0.45">
        <g transform="translate(120,140)">
          <circle cx="0" cy="-20" r="14" />
          <circle cx="18" cy="-6" r="14" />
          <circle cx="12" cy="16" r="14" />
          <circle cx="-12" cy="16" r="14" />
          <circle cx="-18" cy="-6" r="14" />
          <circle cx="0" cy="0" r="8" fill="#c79a4b" />
        </g>
        <g transform="translate(280,260)">
          <circle cx="0" cy="-16" r="12" />
          <circle cx="15" cy="-5" r="12" />
          <circle cx="9" cy="13" r="12" />
          <circle cx="-9" cy="13" r="12" />
          <circle cx="-15" cy="-5" r="12" />
          <circle cx="0" cy="0" r="6" fill="#c79a4b" />
        </g>
      </g>
    </svg>
  ),
};

export function Gallery() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gallery")
      .then((res) => res.json())
      .then((data) => {
        setGalleryItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load gallery:", err);
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

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  if (loading) {
    return (
      <section className="gallery" id="gallery">
        <div className="container" style={{ textAlign: "center", padding: "80px 0" }}>
          <p style={{ color: "var(--cream)", opacity: 0.6 }}>Loading gallery...</p>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      className="gallery"
      id="gallery"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="container">
        <motion.div className="section-label" variants={textVariants}>
          ~ moments we've shared ~
        </motion.div>
        <motion.h2 className="section-title" variants={textVariants}>
          From our gatherings.
        </motion.h2>
        <motion.p className="section-intro" variants={textVariants}>
          A little look back at our recent Wednesdays — the laughter, the dough,
          the watercolours, the long conversations. Real photos from real
          afternoons.
        </motion.p>

        {galleryItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ color: "var(--cream)", opacity: 0.6 }}>No gallery items to show.</p>
          </div>
        ) : (
          <motion.div className="gallery-grid" id="galleryGrid" variants={containerVariants}>
            {galleryItems.map((item, idx) => (
              <motion.div
                className="gallery-card"
                key={idx}
                variants={cardVariants}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
              >
                <div
                  className="bg"
                  style={{
                    background: `linear-gradient(135deg, ${item.g1}, ${item.g2})`,
                  }}
                ></div>
                {decoSVGs[item.deco]}
                <span className="gallery-photo-tag">{item.photos}</span>
                <div className="gallery-overlay">
                  <span className="g-month">{item.month}</span>
                  <h4>{item.title}</h4>
                  <p>{item.meta}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
