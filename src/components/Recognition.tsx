"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface Nominee {
  id: string;
  initial: string;
  name: string;
  reason: string;
}

export function Recognition() {
  const [voted, setVoted] = useState(false);
  const [yourVote, setYourVote] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, number>>({
    aisha: 12,
    helen: 9,
    roya: 15,
    samira: 7,
  });

  const nominees: Nominee[] = [
    {
      id: "aisha",
      initial: "A",
      name: "Aisha Rahman",
      reason: "for hosting weekly crochet circles",
    },
    {
      id: "helen",
      initial: "H",
      name: "Helen Pereira",
      reason: "for tech help & weekly grocery runs",
    },
    {
      id: "roya",
      initial: "R",
      name: "Roya Tehrani",
      reason: "for welcoming three new members",
    },
    {
      id: "samira",
      initial: "S",
      name: "Samira Khan",
      reason: "for cooking-together sessions",
    },
  ];

  const handleVote = (id: string) => {
    if (voted) return;

    setVotes((prev) => ({
      ...prev,
      [id]: prev[id] + 1,
    }));
    setYourVote(id);
    setVoted(true);
  };

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  const textVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
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

  return (
    <motion.section
      className="recognition"
      id="recognition"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } },
      }}
    >
      <div className="container">
        <motion.div className="section-label" variants={textVariants}>
          ~ celebrating our buddies ~
        </motion.div>
        <motion.h2 className="section-title" variants={textVariants}>
          The hearts behind the helping hands.
        </motion.h2>
        <motion.p className="section-intro" variants={textVariants}>
          Every week and every month, we pause to thank the buddies who've
          quietly made a difference. Because the small kindnesses are the ones
          that hold a community together.
        </motion.p>

        <div className="recognition-grid">
          {/* Buddy of the Week */}
          <motion.div className="recognition-card" variants={cardVariants}>
            <div className="badge">
              <span className="star">✦</span> Buddy of the Week
            </div>
            <div className="featured-buddy">
              <div className="buddy-avatar">L</div>
              <div>
                <h3>Leila Khoury</h3>
                <div className="role">~ Saheel, 62 ~</div>
              </div>
            </div>
            <p className="story">
              Leila drove Margaret to three hospital appointments this week, sat
              with her through each one, and brought her homemade lentil soup
              afterwards. Quietly, without being asked twice.
            </p>
            <p className="attribution">— nominated by Margaret &amp; the founding hosts</p>
          </motion.div>

          {/* Star Buddy of the Month Poll */}
          <motion.div className="recognition-card" variants={cardVariants}>
            <div className="badge">
              <span className="star">★</span> Star Buddy of the Month — Vote
            </div>
            <p className="story" style={{ marginBottom: "18px", fontSize: "16px" }}>
              Four wonderful buddies have been nominated this month. Cast your
              vote — voting closes the last Sunday of the month.
            </p>

            <div className="poll-list" id="pollList">
              {nominees.map((nominee) => {
                const count = votes[nominee.id];
                const pct = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                const isSelected = yourVote === nominee.id;

                let optionClass = "poll-option";
                if (voted) optionClass += " voted";
                if (isSelected) optionClass += " your-vote";

                return (
                  <motion.div
                    className={optionClass}
                    key={nominee.id}
                    onClick={() => handleVote(nominee.id)}
                    whileHover={!voted ? { scale: 1.01 } : {}}
                    whileTap={!voted ? { scale: 0.99 } : {}}
                    layout
                  >
                    <motion.div
                      className="poll-bar"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                    <div className="mini-avatar">{nominee.initial}</div>
                    <div className="nominee">
                      <span className="name">{nominee.name}</span>
                      <span className="for">{nominee.reason}</span>
                    </div>
                    <motion.span className="votes" layout>
                      {isSelected ? `✓ ${count}` : `${count} votes`}
                    </motion.span>
                  </motion.div>
                );
              })}
            </div>
            <p className="poll-note">
              One vote per member. The Star Buddy receives a hand-written letter
              and her name on our Wall of Hearts.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
