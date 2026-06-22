"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PolaroidItem {
  id: string | number;
  p1: string;
  p2: string;
  rot: number;
  marginTop: string;
  imageUrl: string;
}

export function SnapshotStrip() {
  const [polaroids, setPolaroids] = useState<PolaroidItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/snapshots")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          // Filter to only display snapshots that have custom images
          const items = data
            .filter((item: any) => item.imageUrl)
            .map((item: any) => ({
              id: item.id,
              p1: item.p1,
              p2: item.p2,
              rot: item.rotation,
              marginTop: item.marginTop,
              imageUrl: item.imageUrl,
            }));
          setPolaroids(items);
        } else {
          setPolaroids([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load snapshots:", err);
        setPolaroids([]);
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

  if (loading) {
    return (
      <section className="featured-photos">
        <div className="container" style={{ textAlign: "center", padding: "60px 0" }}>
          <p style={{ color: "var(--cream)", opacity: 0.6 }}>Loading snapshots...</p>
        </div>
      </section>
    );
  }

  // If there are no images, we can show a nice empty message or prompt the user to upload one.
  if (polaroids.length === 0) {
    return (
      <section className="featured-photos">
        <div className="container" style={{ textAlign: "center", padding: "80px 20px" }}>
          <motion.div className="strip-eyebrow" initial="hidden" animate="visible" variants={textVariants}>
            <div className="label">~ recent moments ~</div>
            <div className="sub">a few snapshots from our gatherings</div>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 0.5 }} 
            style={{ color: "var(--cream)", fontSize: "15px", marginTop: "30px", fontStyle: "italic" }}
          >
            No snapshots uploaded yet. Go to dashboard to upload photos.
          </motion.p>
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
              style={{ marginTop: p.marginTop, cursor: "zoom-in" }}
              variants={getPolaroidVariants(p.rot)}
              onClick={() => setSelectedImage(p.imageUrl)}
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
                style={{
                  border: "none",
                  marginBottom: "0px",
                  padding: "0px",
                  overflow: "hidden",
                }}
              >
                <img
                  src={p.imageUrl}
                  alt="Gathering Snapshot"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Modal Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              cursor: "zoom-out",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{
                position: "relative",
                maxWidth: "90%",
                maxHeight: "90%",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Enlarged Gathering Snapshot"
                style={{
                  maxWidth: "100%",
                  maxHeight: "85vh",
                  borderRadius: "4px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                  border: "4px solid var(--cream)",
                }}
              />
              <button
                onClick={() => setSelectedImage(null)}
                style={{
                  position: "absolute",
                  top: "-45px",
                  right: "0px",
                  background: "none",
                  border: "none",
                  color: "var(--cream)",
                  fontSize: "36px",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
