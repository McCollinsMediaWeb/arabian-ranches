"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";

export function Team() {
  const DEFAULT_TEAM = [
    {
      id: "member-1",
      name: "Linda",
      role: "~ Book Club Host ~",
      location: "Mirador · 42",
      bio: "Avid reader who loves sharing stories and hosting weekend book club discussions over homemade cookies.",
      image: "/team/linda.jpg",
      g1: "#d9a48a",
      g2: "#b8533a",
    },
    {
      id: "member-2",
      name: "Dimple",
      role: "~ Yoga & Wellness ~",
      location: "Saheel · 38",
      bio: "Certified yoga instructor passionate about helping neighbours find peace and mindfulness in their lives.",
      image: "/team/dimple.jpg",
      g1: "#c79a4b",
      g2: "#8f3d29",
    },
    {
      id: "member-3",
      name: "Meghna",
      role: "~ Gardening Enthusiast ~",
      location: "Alvorada · 47",
      bio: "Transforms desert yards into blooming sanctuaries and leads our community gardening and seed sharing workshops.",
      image: "/team/meghna.jpg",
      g1: "#6b6b3a",
      g2: "#c79a4b",
    },
    {
      id: "member-4",
      name: "Maya",
      role: "~ Cooking Circles ~",
      location: "Hattan · 12",
      bio: "Brings people together through cooking masterclasses and culinary storytelling sessions featuring global flavours.",
      image: "/team/maya.jpg",
      g1: "#b8533a",
      g2: "#d9a48a",
    },
    {
      id: "member-5",
      name: "Sandya",
      role: "~ Youth Mentor ~",
      location: "Mirador · 15",
      bio: "Retired school counsellor who organises youth tutoring networks and summer camps for the neighborhood children.",
      image: "/team/sandya.jpg",
      g1: "#8f3d29",
      g2: "#c79a4b",
    },
  ];

  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [cardWidth, setCardWidth] = useState(300);
  const sliderRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  // Fetch team members
  useEffect(() => {
    fetch("/api/team")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setTeamMembers(data);
        } else {
          setTeamMembers(DEFAULT_TEAM);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load team members:", err);
        setTeamMembers(DEFAULT_TEAM);
        setLoading(false);
      });
  }, []);

  // Update card width dynamically on resize
  const updateCardWidth = () => {
    if (!sliderRef.current) return;
    const card = sliderRef.current.querySelector(".team-card");
    if (card) {
      setCardWidth(card.getBoundingClientRect().width);
    }
  };

  useEffect(() => {
    updateCardWidth();
    window.addEventListener("resize", updateCardWidth);
    return () => window.removeEventListener("resize", updateCardWidth);
  }, [loading, teamMembers]);

  // Center initial scroll position to the middle set of cards
  useEffect(() => {
    if (loading || teamMembers.length === 0 || !sliderRef.current) return;
    const container = sliderRef.current;
    const gap = 28;
    const W = (cardWidth + gap) * teamMembers.length;
    container.scrollLeft = W;
  }, [loading, teamMembers, cardWidth]);

  // Marquee animation player
  const playMarquee = () => {
    if (!sliderRef.current || teamMembers.length === 0) return;
    const container = sliderRef.current;
    const gap = 28;
    const W = (cardWidth + gap) * teamMembers.length;

    // Boundary check: Reset scroll if out of bounds
    if (container.scrollLeft >= 2 * W - 10 || container.scrollLeft <= W - container.clientWidth) {
      container.scrollLeft = W;
    }

    const currentScroll = container.scrollLeft;
    const remainingDistance = 2 * W - currentScroll;
    const speed = 35; // Pixels per second (slow and smooth)
    const duration = remainingDistance / speed;

    if (tweenRef.current) tweenRef.current.kill();

    tweenRef.current = gsap.to(container, {
      scrollLeft: 2 * W,
      duration: duration,
      ease: "none",
      onComplete: () => {
        container.scrollLeft = W;
        playMarquee();
      },
    });
  };

  // Handle play/pause marquee on hover status
  useEffect(() => {
    if (loading || teamMembers.length === 0) return;

    if (isHovered) {
      if (tweenRef.current) tweenRef.current.pause();
    } else {
      playMarquee();
    }

    return () => {
      if (tweenRef.current) tweenRef.current.kill();
    };
  }, [isHovered, loading, teamMembers, cardWidth]);

  // Manual Next/Prev action using GSAP smooth transitions
  const scroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const gap = 28;
    const scrollAmount = cardWidth + gap;
    const W = (cardWidth + gap) * teamMembers.length;

    if (tweenRef.current) tweenRef.current.kill();

    const targetScroll =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    gsap.to(container, {
      scrollLeft: targetScroll,
      duration: 0.6,
      ease: "power2.out",
      onComplete: () => {
        // Boundary adjustments after manual scroll completes
        if (container.scrollLeft >= 2 * W - 10) {
          container.scrollLeft -= W;
        } else if (container.scrollLeft <= W - container.clientWidth) {
          container.scrollLeft += W;
        }
      },
    });
  };

  // Boundary loop listener for manual swiping/dragging
  useEffect(() => {
    const container = sliderRef.current;
    if (!container || loading || teamMembers.length === 0) return;

    const checkLoop = () => {
      const gap = 28;
      const W = (cardWidth + gap) * teamMembers.length;

      if (container.scrollLeft >= 2 * W - 10) {
        container.scrollLeft -= W;
      } else if (container.scrollLeft <= W - container.clientWidth) {
        container.scrollLeft += W;
      }
    };

    container.addEventListener("scroll", checkLoop);
    return () => container.removeEventListener("scroll", checkLoop);
  }, [loading, teamMembers, cardWidth]);

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
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <motion.section
      className="team"
      id="team"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="container">
        <motion.div className="section-label" variants={textVariants}>
          ~ the women behind it all ~
        </motion.div>
        <motion.h2 className="section-title" variants={textVariants}>
          Meet our team.
        </motion.h2>
        <motion.p className="section-intro" variants={textVariants}>
          Connecting Hearts is run entirely by volunteers — five neighbours who
          fell in love with the idea of belonging, and decided to build it. Say
          hello when you see them at a gathering.
        </motion.p>

        <div
          className="team-slider-wrapper"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
        >
          <AnimatePresence>
            {isHovered && (
              <>
                <motion.button
                  key="prev-btn"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => scroll("left")}
                  className="slider-nav-btn prev"
                  aria-label="Previous Team Member"
                >
                  ←
                </motion.button>
                <motion.button
                  key="next-btn"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => scroll("right")}
                  className="slider-nav-btn next"
                  aria-label="Next Team Member"
                >
                  →
                </motion.button>
              </>
            )}
          </AnimatePresence>

          <motion.div
            className={`team-slider ${isHovered ? "snapping" : ""}`}
            ref={sliderRef}
            variants={containerVariants}
          >
            {[...teamMembers, ...teamMembers, ...teamMembers].map((member, idx) => (
              <motion.div
                className="team-card"
                key={`${member.id || idx}-${idx}`}
                variants={cardVariants}
                whileHover={{
                  y: -6,
                  boxShadow: "0 16px 30px rgba(43, 36, 25, 0.15)",
                  transition: { duration: 0.2 },
                }}
              >
                <div
                  className="team-photo"
                  style={
                    {
                      "--g1": member.g1,
                      "--g2": member.g2,
                      overflow: "hidden",
                    } as React.CSSProperties
                  }
                >
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    member.name ? member.name.charAt(0).toUpperCase() : ""
                  )}
                </div>
                <h3>{member.name}</h3>
                <p className="role">{member.role}</p>
                <p className="location">{member.location}</p>
                <p className="bio">{member.bio}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
