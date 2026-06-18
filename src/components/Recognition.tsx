"use client";

import React, { useState, useEffect } from "react";
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
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [buddyOfWeek, setBuddyOfWeek] = useState<any>(null);
  const [buddyOfMonth, setBuddyOfMonth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load local vote state from localStorage
    const savedVote = localStorage.getItem("starBuddyVote");
    if (savedVote) {
      setVoted(true);
      setYourVote(savedVote);
    }

    fetch("/api/recognition")
      .then((res) => res.json())
      .then((data) => {
        setBuddyOfWeek(data.buddyOfWeek);
        setBuddyOfMonth(data.buddyOfMonth);
        
        // Map votes from nominees
        const voteMap: Record<string, number> = {};
        data.buddyOfMonth?.nominees?.forEach((nominee: any) => {
          voteMap[nominee.id] = nominee.votes || 0;
        });
        setVotes(voteMap);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load recognition data:", err);
        setLoading(false);
      });
  }, []);

  const handleVote = async (id: string) => {
    if (voted) return;

    // Save vote in localStorage to prevent duplicate votes
    localStorage.setItem("starBuddyVote", id);
    setYourVote(id);
    setVoted(true);

    // Optimistic UI update
    setVotes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));

    try {
      const response = await fetch("/api/recognition/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nomineeId: id }),
      });

      if (!response.ok) {
        throw new Error("Failed to persist vote");
      }
    } catch (error) {
      console.error("Error casting vote:", error);
      // Revert states if request failed
      localStorage.removeItem("starBuddyVote");
      setYourVote(null);
      setVoted(false);
      setVotes((prev) => ({
        ...prev,
        [id]: Math.max(0, (prev[id] || 0) - 1),
      }));
    }
  };

  const nominees: Nominee[] = buddyOfMonth?.nominees || [];
  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

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
      <section className="recognition" id="recognition">
        <div className="container" style={{ textAlign: "center", padding: "80px 0" }}>
          <p style={{ color: "var(--cream)", opacity: 0.6 }}>Loading recognition stats...</p>
        </div>
      </section>
    );
  }

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
          {buddyOfWeek && (
            <motion.div className="recognition-card" variants={cardVariants}>
              <div className="badge">
                <span className="star">✦</span> Buddy of the Week
              </div>
              <div className="featured-buddy">
                <div className="buddy-avatar">{buddyOfWeek.avatar || buddyOfWeek.name?.charAt(0)}</div>
                <div>
                  <h3>{buddyOfWeek.name}</h3>
                  <div className="role">~ {buddyOfWeek.role} ~</div>
                </div>
              </div>
              <p className="story">{buddyOfWeek.story}</p>
              <p className="attribution">{buddyOfWeek.attribution}</p>
            </motion.div>
          )}

          {/* Star Buddy of the Month Poll */}
          {buddyOfMonth && (
            <motion.div className="recognition-card" variants={cardVariants}>
              <div className="badge">
                <span className="star">★</span> {buddyOfMonth.title}
              </div>
              <p className="story" style={{ marginBottom: "18px", fontSize: "16px" }}>
                {buddyOfMonth.description}
              </p>

              <div className="poll-list" id="pollList">
                {nominees.map((nominee) => {
                  const count = votes[nominee.id] || 0;
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
                      <div className="mini-avatar">{nominee.initial || nominee.name?.charAt(0)}</div>
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
              <p className="poll-note">{buddyOfMonth.note}</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
