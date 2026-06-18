"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Register() {
  const [submitted, setSubmitted] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [registering, setRegistering] = useState("");
  const [note, setNote] = useState("");
  const [shareList, setShareList] = useState<string[]>([]);
  const [learnList, setLearnList] = useState<string[]>([]);

  const interests = [
    "Baking",
    "Cooking",
    "Gardening",
    "Painting & Art",
    "Knitting",
    "Crochet",
    "Embroidery",
    "Storytelling",
    "Poetry & Writing",
    "Photography",
    "Yoga / Wellness",
    "Music / Singing",
    "Languages",
    "Calligraphy",
    "Home Remedies",
    "Book Club",
  ];

  const handleShareChange = (interest: string) => {
    if (shareList.includes(interest)) {
      setShareList(shareList.filter((item) => item !== interest));
    } else {
      setShareList([...shareList, interest]);
    }
  };

  const handleLearnChange = (interest: string) => {
    if (learnList.includes(interest)) {
      setLearnList(learnList.filter((item) => item !== interest));
    } else {
      setLearnList([...learnList, interest]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    // Reset fields
    setName("");
    setAge("");
    setPhone("");
    setEmail("");
    setAddress("");
    setRegistering("");
    setNote("");
    setShareList([]);
    setLearnList([]);

    // Scroll to success message
    setTimeout(() => {
      const successEl = document.getElementById("formSuccess");
      if (successEl) {
        successEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <motion.section
      className="register"
      id="register"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="container">
        <motion.div className="section-label" variants={textVariants}>
          ~ join the circle ~
        </motion.div>
        <motion.h2 className="section-title" variants={textVariants}>
          Request your seat — for yourself, or for your mum.
        </motion.h2>
        <motion.p className="section-intro" variants={textVariants}>
          Fifty seats. Once they're filled, we'll keep a gentle waitlist. Tell
          us a little about who you are and what you'd like to share or learn.
        </motion.p>

        <motion.form
          id="registerForm"
          onSubmit={handleSubmit}
          variants={containerVariants}
        >
          <div className="form-grid">
            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="name">Full name</label>
              <input
                type="text"
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Layla Hassan"
              />
            </motion.div>
            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="age">Age</label>
              <select
                id="age"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
              >
                <option value="">Select…</option>
                <option>50 – 55</option>
                <option>56 – 60</option>
                <option>61 – 65</option>
                <option>66 – 70</option>
                <option>71+</option>
              </select>
            </motion.div>
            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="phone">WhatsApp number</label>
              <input
                type="tel"
                id="phone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+971 50 000 0000"
              />
            </motion.div>
            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@email.com"
              />
            </motion.div>
            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="address">Sub-community in Arabian Ranches</label>
              <select
                id="address"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              >
                <option value="">Select…</option>
                <option>Alvorada</option>
                <option>Mirador</option>
                <option>Mirador La Colección</option>
                <option>Saheel</option>
                <option>Hattan</option>
                <option>Savannah</option>
                <option>Terra Nova</option>
                <option>Palmera</option>
                <option>Al Reem</option>
                <option>Gold &amp; Diamond Park</option>
                <option>Polo Homes</option>
                <option>Ranches 2 / Ranches 3</option>
                <option>Other / Nearby</option>
              </select>
            </motion.div>
            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="registering">Registering for</label>
              <select
                id="registering"
                required
                value={registering}
                onChange={(e) => setRegistering(e.target.value)}
              >
                <option value="">Select…</option>
                <option>Myself</option>
                <option>My mother</option>
                <option>A relative or friend (with permission)</option>
              </select>
            </motion.div>
          </div>

          <div className="form-grid full" style={{ marginTop: "28px" }}>
            <motion.div className="form-group" variants={itemVariants}>
              <label>I'd like to share my expertise in… (select all that apply)</label>
              <div className="checkbox-grid">
                {interests.map((interest) => (
                  <label className="check-pill" key={`share-${interest}`}>
                    <input
                      type="checkbox"
                      name="share"
                      checked={shareList.includes(interest)}
                      onChange={() => handleShareChange(interest)}
                    />
                    <motion.span
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {interest}
                    </motion.span>
                  </label>
                ))}
              </div>
            </motion.div>

            <motion.div className="form-group" variants={itemVariants}>
              <label>I'd love to learn about… (select all that apply)</label>
              <div className="checkbox-grid">
                {interests.map((interest) => (
                  <label className="check-pill" key={`learn-${interest}`}>
                    <input
                      type="checkbox"
                      name="learn"
                      checked={learnList.includes(interest)}
                      onChange={() => handleLearnChange(interest)}
                    />
                    <motion.span
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {interest}
                    </motion.span>
                  </label>
                ))}
              </div>
            </motion.div>

            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="note">A few words about yourself (optional)</label>
              <textarea
                id="note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Tell us a little about who you are — we love getting to know our members."
              ></textarea>
            </motion.div>
          </div>

          <motion.div className="submit-row" variants={itemVariants}>
            <motion.button
              type="submit"
              className="btn-gold"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Send my request
            </motion.button>
            <p>
              By submitting, you agree to our community guidelines. We'll be in
              touch within 5 days.
            </p>
          </motion.div>

          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: "auto", opacity: 1, marginTop: 24 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                className="form-success show"
                id="formSuccess"
                style={{ overflow: "hidden" }}
              >
                ✦ Thank you. Your request has been received. One of our community
                hosts will reach out on WhatsApp very soon to welcome you in.
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>
      </div>
    </motion.section>
  );
}
