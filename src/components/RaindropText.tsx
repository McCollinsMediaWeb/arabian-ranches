"use client";

import React from "react";
import { motion } from "framer-motion";

interface RaindropTextProps {
  text: string;
  className?: string;
}

export function RaindropText({ text, className }: RaindropTextProps) {
  const words = text.split(" ");

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.015,
      },
    },
  };

  const child = {
    hidden: { opacity: 0, y: -18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 14,
        stiffness: 120,
      },
    },
  };

  return (
    <motion.span
      className={className}
      style={{ display: "inline-block" }}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      {words.map((word, wordIndex) => (
        <span
          key={wordIndex}
          style={{ display: "inline-block", whiteSpace: "nowrap" }}
        >
          {Array.from(word).map((char, charIndex) => (
            <motion.span
              key={charIndex}
              style={{ display: "inline-block" }}
              variants={child}
            >
              {char}
            </motion.span>
          ))}
          {wordIndex < words.length - 1 && (
            <span style={{ display: "inline-block" }}>&nbsp;</span>
          )}
        </span>
      ))}
    </motion.span>
  );
}
