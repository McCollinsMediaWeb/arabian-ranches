"use client";

import React from "react";
import { motion } from "framer-motion";
import { RaindropText } from "./RaindropText";

export function About() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
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
        ease: [0.16, 1, 0.3, 1] as const, // easeOutExpo
      },
    },
  };

  return (
    <motion.section
      className="about"
      id="about"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="container">
        <motion.div className="section-label" variants={textVariants}>
          ~ what we're about ~
        </motion.div>
        <motion.h2 className="section-title" variants={textVariants}>
          A neighbourhood of expertise, generosity and gentle company.
        </motion.h2>
        <motion.p className="section-intro" variants={textVariants}>
          Every woman holds a lifetime of skills, recipes, gardens, brushstrokes
          and stories. Connecting Hearts is the warm Wednesday-afternoon kind
          of place where those gifts are shared — over chai, in someone's
          garden, around a baking table.
        </motion.p>

        <motion.div className="about-grid" variants={containerVariants}>
          <motion.div
            className="value-card"
            variants={cardVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
          >
            <div className="num">i.</div>
            <h3>Share your craft</h3>
            <p>
              Bake, paint, garden, knit, write, cook, photograph — host a
              session and pass on what you know to women who'll cherish it.
            </p>
          </motion.div>

          <motion.div
            className="value-card"
            variants={cardVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
          >
            <div className="num">ii.</div>
            <h3>Learn something new</h3>
            <p>
              From Levantine cooking to oil painting to medicinal herbs, every
              week brings a new skill and a new friend.
            </p>
          </motion.div>

          <motion.div
            className="value-card"
            variants={cardVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
          >
            <div className="num">iii.</div>
            <h3>Belong, simply.</h3>
            <p>
              No agenda, no fees, no performance. Just real connection in our
              own neighbourhood, with women who get it.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
