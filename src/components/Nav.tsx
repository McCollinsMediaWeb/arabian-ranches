"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { label: "About", href: "#about" },
    { label: "Team", href: "#team" },
    { label: "Join", href: "#register" },
    { label: "Calendar", href: "#events" },
    { label: "Gallery", href: "#gallery" },
    { label: "Buddy System", href: "#buddy" },
  ];

  return (
    <nav>
      <div className="container nav-inner">
        <div className="logo">
          <span>♡</span> Connecting Hearts
        </div>

        {/* Desktop Links */}
        <ul className="nav-links">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>

        {/* Mobile menu button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {/* Animated Hamburger Icon */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <motion.path
              d="M3 6h18"
              animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              style={{ originX: 0.5, originY: 0.5 }}
              transition={{ duration: 0.2 }}
            />
            <motion.path
              d="M3 12h18"
              animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
            <motion.path
              d="M3 18h18"
              animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              style={{ originX: 0.5, originY: 0.5 }}
              transition={{ duration: 0.2 }}
            />
          </svg>
        </button>

        {/* Mobile menu overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="mobile-menu-overlay"
            >
              <ul className="mobile-menu-links">
                {links.map((link, idx) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <a href={link.href} onClick={() => setIsOpen(false)}>
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
