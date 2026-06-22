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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIndex((prev) => {
      if (prev === null) return null;
      return prev === 0 ? polaroids.length - 1 : prev - 1;
    });
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIndex((prev) => {
      if (prev === null) return null;
      return prev === polaroids.length - 1 ? 0 : prev + 1;
    });
  };

  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "Escape") {
        setSelectedIndex(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIndex, polaroids.length]);

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
          {polaroids.map((p, index) => (
            <motion.div
              className="polaroid"
              key={p.id}
              style={{ marginTop: p.marginTop, cursor: "zoom-in" }}
              variants={getPolaroidVariants(p.rot)}
              onClick={() => setSelectedIndex(index)}
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
        {selectedIndex !== null && polaroids[selectedIndex] && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIndex(null)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(10, 8, 6, 0.92)",
              backdropFilter: "blur(12px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              cursor: "zoom-out",
              padding: "20px",
              userSelect: "none",
            }}
          >
            {/* Custom CSS styles inside modal overlay for arrows/thumbnails/etc */}
            <style dangerouslySetInnerHTML={{ __html: `
              .lightbox-arrow {
                background: rgba(10, 8, 6, 0.6);
                border: 1px solid rgba(246, 239, 228, 0.15);
                color: var(--cream);
                border-radius: 50%;
                width: 52px;
                height: 52px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                outline: none;
                z-index: 1010;
              }
              .lightbox-arrow:hover {
                background: rgba(199, 154, 75, 0.3);
                border-color: var(--gold, #c79a4b);
                color: var(--gold, #c79a4b);
                transform: translateY(-50%) scale(1.1) !important;
              }
              .lightbox-arrow:active {
                transform: translateY(-50%) scale(0.95) !important;
              }
              .lightbox-arrow-left {
                position: fixed;
                left: 24px;
                top: 50%;
                transform: translateY(-50%);
              }
              .lightbox-arrow-right {
                position: fixed;
                right: 24px;
                top: 50%;
                transform: translateY(-50%);
              }
              .lightbox-close {
                position: fixed;
                top: 24px;
                right: 24px;
                background: rgba(10, 8, 6, 0.6);
                border: 1px solid rgba(246, 239, 228, 0.15);
                color: var(--cream);
                cursor: pointer;
                transition: all 0.25s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 48px;
                height: 48px;
                border-radius: 50%;
                outline: none;
                z-index: 1015;
              }
              .lightbox-close:hover {
                color: var(--gold, #c79a4b);
                border-color: var(--gold, #c79a4b);
                transform: rotate(90deg) scale(1.1);
                background: rgba(199, 154, 75, 0.2);
              }
              .lightbox-thumbs-container {
                position: fixed;
                bottom: 24px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 12px;
                justify-content: center;
                align-items: center;
                max-width: 90vw;
                overflow-x: auto;
                padding: 10px;
                z-index: 1010;
                background: rgba(10, 8, 6, 0.5);
                backdrop-filter: blur(4px);
                border-radius: 30px;
                border: 1px solid rgba(246, 239, 228, 0.05);
                scrollbar-width: thin;
                scrollbar-color: var(--gold) rgba(0,0,0,0.2);
              }
              .lightbox-thumbs-container::-webkit-scrollbar {
                height: 4px;
              }
              .lightbox-thumbs-container::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.1);
              }
              .lightbox-thumbs-container::-webkit-scrollbar-thumb {
                background-color: var(--gold);
                border-radius: 4px;
              }
              .lightbox-thumb {
                width: 54px;
                height: 54px;
                border-radius: 50%;
                object-fit: cover;
                cursor: pointer;
                transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                opacity: 0.45;
                border: 2px solid transparent;
              }
              .lightbox-thumb:hover {
                opacity: 0.85;
                transform: translateY(-3px);
              }
              .lightbox-thumb.active {
                opacity: 1;
                border-color: var(--gold, #c79a4b);
                transform: scale(1.12) translateY(-3px);
                box-shadow: 0 4px 12px rgba(199, 154, 75, 0.4);
              }
              .lightbox-main-img-container {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
                max-width: 80vw;
                margin-top: -20px;
              }
              .lightbox-main-img {
                max-width: 100%;
                max-height: 76vh;
                border-radius: 6px;
                box-shadow: 0 30px 60px rgba(0,0,0,0.8);
                border: 4px solid var(--cream);
                object-fit: contain;
                user-select: none;
                pointer-events: none;
              }
              @media (max-width: 768px) {
                .lightbox-arrow {
                  width: 44px;
                  height: 44px;
                }
                .lightbox-arrow-left {
                  left: 16px;
                }
                .lightbox-arrow-right {
                  right: 16px;
                }
                .lightbox-close {
                  top: 16px;
                  right: 16px;
                  width: 40px;
                  height: 40px;
                }
                .lightbox-thumbs-container {
                  gap: 8px;
                  bottom: 16px;
                  padding: 8px 14px;
                }
                .lightbox-thumb {
                  width: 44px;
                  height: 44px;
                }
                .lightbox-main-img-container {
                  max-width: 95vw;
                }
                .lightbox-main-img {
                  max-height: 68vh;
                  border-width: 3px;
                }
              }
            ` }} />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left Arrow Button */}
              <button 
                className="lightbox-arrow lightbox-arrow-left" 
                onClick={handlePrev} 
                aria-label="Previous image"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>

              {/* Main Image Container */}
              <div className="lightbox-main-img-container">
                <img
                  src={polaroids[selectedIndex].imageUrl}
                  alt="Enlarged Gathering Snapshot"
                  className="lightbox-main-img"
                />
              </div>

              {/* Right Arrow Button */}
              <button 
                className="lightbox-arrow lightbox-arrow-right" 
                onClick={handleNext} 
                aria-label="Next image"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>

              {/* Close Button */}
              <button
                className="lightbox-close"
                onClick={() => setSelectedIndex(null)}
                aria-label="Close lightbox"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              {/* Bottom Row: Thumbnails Strip */}
              {polaroids.length > 1 && (
                <div className="lightbox-thumbs-container">
                  {polaroids.map((p, idx) => (
                    <img
                      key={p.id}
                      src={p.imageUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className={`lightbox-thumb ${idx === selectedIndex ? "active" : ""}`}
                      onClick={() => setSelectedIndex(idx)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
