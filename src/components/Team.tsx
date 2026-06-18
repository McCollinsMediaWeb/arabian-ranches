"use client";

import React from "react";
import { motion } from "framer-motion";

export function Team() {
  const teamMembers = [
    {
      initial: "R",
      name: "Reema Al Mansoori",
      role: "~ Community Chair ~",
      location: "Mirador · 58",
      bio: "Started Connecting Hearts after watching her own mother arrive in Dubai and find herself surrounded yet alone. Believes friendship is the best medicine.",
      g1: "#c79a4b",
      g2: "#8f3d29",
    },
    {
      initial: "S",
      name: "Sophia Nair",
      role: "~ Events Coordinator ~",
      location: "Saheel · 54",
      bio: "A retired teacher who plans every Wednesday with the care of a wedding planner. Brings fresh dates from her own date palm.",
      g1: "#b8533a",
      g2: "#d9a48a",
    },
    {
      initial: "M",
      name: "Margaret O'Connor",
      role: "~ Buddy System Lead ~",
      location: "Hattan · 63",
      bio: "Thirty years a nurse in Ireland and Dubai. First to volunteer when anyone needs a hand at the clinic or a meal during illness.",
      g1: "#6b6b3a",
      g2: "#c79a4b",
    },
    {
      initial: "A",
      name: "Aisha Rahman",
      role: "~ Crafts & Workshops ~",
      location: "Saheel · 56",
      bio: "Crochet queen and quiet pillar of our craft circles. Has taught more than forty ladies their first granny square.",
      g1: "#8f3d29",
      g2: "#c79a4b",
    },
    {
      initial: "R",
      name: "Roya Tehrani",
      role: "~ Welcome Host ~",
      location: "Alvorada · 61",
      bio: "First to greet every new member with Persian tea and a hug. Speaks four languages; warms a room in any of them.",
      g1: "#d9a48a",
      g2: "#b8533a",
    },
    {
      initial: "H",
      name: "Helen Pereira",
      role: "~ Communications ~",
      location: "Hattan · 59",
      bio: "A former magazine editor who runs our WhatsApp group with kindness. Sourdough is her love language.",
      g1: "#c79a4b",
      g2: "#6b6b3a",
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
          Connecting Hearts is run entirely by volunteers — six neighbours who
          fell in love with the idea of belonging, and decided to build it. Say
          hello when you see them at a gathering.
        </motion.p>

        <motion.div className="team-grid" variants={containerVariants}>
          {teamMembers.map((member, idx) => (
            <motion.div
              className="team-card"
              key={idx}
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
                  } as React.CSSProperties
                }
              >
                {member.initial}
              </div>
              <h3>{member.name}</h3>
              <p className="role">{member.role}</p>
              <p className="location">{member.location}</p>
              <p className="bio">{member.bio}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.p className="replace-note" style={{ marginTop: "40px" }} variants={textVariants}>
          ↑ placeholder avatars — to be replaced with team member photos
        </motion.p>
      </div>
    </motion.section>
  );
}
