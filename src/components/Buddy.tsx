"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Buddy() {
  const [becomeBuddySubmitted, setBecomeBuddySubmitted] = useState(false);
  const [requestBuddySubmitted, setRequestBuddySubmitted] = useState(false);

  // Form 1 state
  const [bName, setBName] = useState("");
  const [bPhone, setBPhone] = useState("");
  const [bFree, setBFree] = useState("");
  const [bHelpList, setBHelpList] = useState<string[]>([]);

  // Form 2 state
  const [rName, setRName] = useState("");
  const [rPhone, setRPhone] = useState("");
  const [rOften, setROften] = useState("");
  const [rNeedList, setRNeedList] = useState<string[]>([]);

  const buddyTasks = [
    "Companionship walks",
    "Tech help (phone, video calls)",
    "Doctor / clinic visits",
    "Grocery shopping",
    "Light errands",
    "Reading mail / paperwork",
    "Cooking together",
    "Just a coffee & chat",
    "Airport drop / pickup",
    "Pet sitting (short term)",
    "Help during illness",
    "Welcoming new members",
  ];

  const requestTasks = [
    "Companionship walks",
    "Tech help (phone, video calls)",
    "Doctor / clinic visits",
    "Grocery shopping",
    "Light errands",
    "Reading mail / paperwork",
    "Cooking together",
    "Just a coffee & chat",
    "Airport drop / pickup",
    "Pet sitting (short term)",
    "Help during illness",
    "Settling into the neighbourhood",
  ];

  const handleBecomeBuddySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBecomeBuddySubmitted(true);
    setBName("");
    setBPhone("");
    setBFree("");
    setBHelpList([]);

    setTimeout(() => {
      const el = document.getElementById("becomeBuddySuccess");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleRequestBuddySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestBuddySubmitted(true);
    setRName("");
    setRPhone("");
    setROften("");
    setRNeedList([]);

    setTimeout(() => {
      const el = document.getElementById("requestBuddySuccess");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleHelpChange = (task: string) => {
    if (bHelpList.includes(task)) {
      setBHelpList(bHelpList.filter((t) => t !== task));
    } else {
      setBHelpList([...bHelpList, task]);
    }
  };

  const handleNeedChange = (task: string) => {
    if (rNeedList.includes(task)) {
      setRNeedList(rNeedList.filter((t) => t !== task));
    } else {
      setRNeedList([...rNeedList, task]);
    }
  };

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
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const, staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <motion.section
      id="buddy"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="container">
        <motion.div className="section-label" variants={textVariants}>
          ~ a hand to hold ~
        </motion.div>
        <motion.h2 className="section-title" variants={textVariants}>
          The Buddy System.
        </motion.h2>

        <motion.div className="buddy-note" variants={textVariants}>
          <p>
            Sometimes we don't need a workshop — we just need a kind face beside
            us at the clinic, a hand with the new phone, or someone to come
            along to the market. Our Buddy System pairs members who'd like to
            give a little time with members who'd like a little company or help.
            Quietly. Lovingly. No fuss.
          </p>
        </motion.div>

        <div className="buddy-grid">
          {/* Card 1: Become a Buddy */}
          <motion.div className="buddy-card" variants={cardVariants}>
            <motion.div className="buddy-card-header" variants={itemVariants}>
              <div className="buddy-icon">♡</div>
              <h3>Become a Buddy</h3>
            </motion.div>
            <motion.p className="sub" variants={itemVariants}>
              Offer your time and care to neighbours who'd like a buddy. You can
              choose one task or many — and we'll match you thoughtfully.
            </motion.p>

            <motion.form
              id="signupBuddyForm"
              onSubmit={handleBecomeBuddySubmit}
              variants={containerVariants}
            >
              <motion.div className="b-group" variants={itemVariants}>
                <label>Your name</label>
                <input
                  type="text"
                  required
                  value={bName}
                  onChange={(e) => setBName(e.target.value)}
                  placeholder="e.g. Fatima Al Marri"
                />
              </motion.div>
              <motion.div className="b-group" variants={itemVariants}>
                <label>WhatsApp number</label>
                <input
                  type="tel"
                  required
                  value={bPhone}
                  onChange={(e) => setBPhone(e.target.value)}
                  placeholder="+971 50 000 0000"
                />
              </motion.div>
              <motion.div className="b-group" variants={itemVariants}>
                <label>I'm happy to help with…</label>
                <div className="task-grid">
                  {buddyTasks.map((task) => (
                    <label className="task-pill" key={`help-${task}`}>
                      <input
                        type="checkbox"
                        name="help"
                        checked={bHelpList.includes(task)}
                        onChange={() => handleHelpChange(task)}
                      />
                      <motion.span
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {task}
                      </motion.span>
                    </label>
                  ))}
                </div>
              </motion.div>
              <motion.div className="b-group" variants={itemVariants}>
                <label>I'm usually free…</label>
                <select
                  required
                  value={bFree}
                  onChange={(e) => setBFree(e.target.value)}
                >
                  <option value="">Select…</option>
                  <option>Weekday mornings</option>
                  <option>Weekday afternoons</option>
                  <option>Weekday evenings</option>
                  <option>Weekends</option>
                  <option>Flexible — just ask me</option>
                </select>
              </motion.div>
              <motion.button
                type="submit"
                className="buddy-submit"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                variants={itemVariants}
              >
                Sign me up as a buddy
              </motion.button>
              <AnimatePresence>
                {becomeBuddySubmitted && (
                  <motion.div
                    id="becomeBuddySuccess"
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: "auto", opacity: 1, marginTop: 18 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    className="buddy-success show"
                    style={{ overflow: "hidden" }}
                  >
                    ✦ Thank you for opening your heart. A host will be in touch on
                    WhatsApp soon to welcome you as a buddy.
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.form>
          </motion.div>

          {/* Card 2: Request a Buddy */}
          <motion.div className="buddy-card dark" variants={cardVariants}>
            <motion.div className="buddy-card-header" variants={itemVariants}>
              <div className="buddy-icon">→</div>
              <h3>Request a Buddy</h3>
            </motion.div>
            <motion.p className="sub" variants={itemVariants}>
              Need a hand — for one little thing, or a few? Tell us how we can
              help. Everything is kept private between you and your matched
              buddy.
            </motion.p>

            <motion.form
              id="requestBuddyForm"
              onSubmit={handleRequestBuddySubmit}
              variants={containerVariants}
            >
              <motion.div className="b-group" variants={itemVariants}>
                <label>Your name</label>
                <input
                  type="text"
                  required
                  value={rName}
                  onChange={(e) => setRName(e.target.value)}
                  placeholder="e.g. Margaret O'Connor"
                />
              </motion.div>
              <motion.div className="b-group" variants={itemVariants}>
                <label>WhatsApp number</label>
                <input
                  type="tel"
                  required
                  value={rPhone}
                  onChange={(e) => setRPhone(e.target.value)}
                  placeholder="+971 50 000 0000"
                />
              </motion.div>
              <motion.div className="b-group" variants={itemVariants}>
                <label>I'd love a buddy for…</label>
                <div className="task-grid">
                  {requestTasks.map((task) => (
                    <label className="task-pill" key={`need-${task}`}>
                      <input
                        type="checkbox"
                        name="need"
                        checked={rNeedList.includes(task)}
                        onChange={() => handleNeedChange(task)}
                      />
                      <motion.span
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {task}
                      </motion.span>
                    </label>
                  ))}
                </div>
              </motion.div>
              <motion.div className="b-group" variants={itemVariants}>
                <label>How often / when?</label>
                <select
                  required
                  value={rOften}
                  onChange={(e) => setROften(e.target.value)}
                >
                  <option value="">Select…</option>
                  <option>One-off — just this once</option>
                  <option>Weekly</option>
                  <option>Fortnightly</option>
                  <option>As and when I need</option>
                </select>
              </motion.div>
              <motion.button
                type="submit"
                className="buddy-submit"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                variants={itemVariants}
              >
                Request a buddy
              </motion.button>
              <AnimatePresence>
                {requestBuddySubmitted && (
                  <motion.div
                    id="requestBuddySuccess"
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: "auto", opacity: 1, marginTop: 18 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    className="buddy-success show"
                    style={{ overflow: "hidden" }}
                  >
                    ✦ Your request is in. A host will reach out within 48 hours and
                    quietly match you with a buddy.
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.form>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
