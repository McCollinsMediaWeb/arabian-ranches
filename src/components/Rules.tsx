"use client";

import React from "react";
import { motion } from "framer-motion";

export function Rules() {
  const ruleItems = [
    {
      title: "Kindness above all.",
      desc: "We speak gently, listen fully, and assume good intent. Disagreement is welcome; unkindness is not.",
    },
    {
      title: "What's shared here, stays here.",
      desc: "Personal stories told within the circle are held in confidence. We are each other's safe space.",
    },
    {
      title: "No selling, no soliciting.",
      desc: "This is not a marketplace. We don't promote businesses, MLMs, services or products inside the group.",
    },
    {
      title: "RSVP honestly.",
      desc: "Hosts plan with care. If you've said yes, please come. If plans change, let us know at least 24 hours ahead.",
    },
    {
      title: "Everyone hosts, eventually.",
      desc: "Each member is encouraged to lead at least one session a year. Your turn will be lovingly supported.",
    },
    {
      title: "Phones down, hearts up.",
      desc: "We keep phones tucked away during gatherings — except for the group photo at the end.",
    },
    {
      title: "Politics & religion — kept light.",
      desc: "We respect every faith and view, and keep our gatherings about connection, not debate.",
    },
    {
      title: "Bring a friend, by invitation.",
      desc: "This is an invite-only community. To bring a guest, please introduce them to a host first.",
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
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const asideVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const, delay: 0.2 },
    },
  };

  return (
    <motion.section
      className="rules"
      id="rules"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="container">
        <motion.div className="section-label" variants={textVariants}>
          ~ our promise to each other ~
        </motion.div>
        <motion.h2 className="section-title" variants={textVariants}>
          The rules of our circle.
        </motion.h2>

        <div className="rules-grid">
          <motion.ol className="rules-list" variants={containerVariants}>
            {ruleItems.map((rule, idx) => (
              <motion.li key={idx} variants={itemVariants}>
                <strong>{rule.title}</strong>
                <span>{rule.desc}</span>
              </motion.li>
            ))}
          </motion.ol>

          <motion.aside className="rules-aside" variants={asideVariants}>
            <p className="quote">
              A community is not a place. It is the people who keep showing up
              for each other — Wednesday after Wednesday, year after year.
            </p>
            <p className="signature">— The founding hosts ♡</p>
          </motion.aside>
        </div>
      </div>
    </motion.section>
  );
}
