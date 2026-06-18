"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EventItem {
  month: string;
  monthFull: string;
  day: string;
  title: string;
  host: string;
  location: string;
  time: string;
}

export function Events() {
  const [activeMonth, setActiveMonth] = useState("May");
  const [rsvps, setRsvps] = useState<string[]>([]);

  const events: EventItem[] = [
    // May
    {
      month: "May",
      monthFull: "May",
      day: "07",
      title: "Welcome Tea — Founding Fifty",
      host: "Hosted by the founding hosts",
      location: "Mirador Clubhouse",
      time: "4:00 – 6:00 PM",
    },
    {
      month: "May",
      monthFull: "May",
      day: "14",
      title: "Levantine Mezze Afternoon",
      host: "Hosted by Samira",
      location: "Mirador Garden",
      time: "4:00 – 6:30 PM",
    },
    {
      month: "May",
      monthFull: "May",
      day: "21",
      title: "Watercolour Florals — Beginners Welcome",
      host: "Hosted by Priya",
      location: "Community Centre",
      time: "4:00 – 6:00 PM",
    },
    {
      month: "May",
      monthFull: "May",
      day: "28",
      title: "Garden Walk & Herb Cuttings Exchange",
      host: "Hosted by Margaret",
      location: "Saheel — Margaret's home",
      time: "8:30 – 10:30 AM",
    },
    // June
    {
      month: "Jun",
      monthFull: "June",
      day: "04",
      title: "Persian Tea & Poetry",
      host: "Hosted by Roya",
      location: "Alvorada Clubhouse",
      time: "4:30 – 6:30 PM",
    },
    {
      month: "Jun",
      monthFull: "June",
      day: "11",
      title: "Sourdough Workshop",
      host: "Hosted by Helen",
      location: "Hattan — Helen's kitchen",
      time: "10:00 AM – 12:30 PM",
    },
    {
      month: "Jun",
      monthFull: "June",
      day: "18",
      title: "Crochet Circle — Granny Squares",
      host: "Hosted by Aisha",
      location: "Saheel Community Room",
      time: "4:00 – 6:00 PM",
    },
    {
      month: "Jun",
      monthFull: "June",
      day: "25",
      title: "Memoir Writing — Our First Stories",
      host: "Hosted by Elaine",
      location: "Polo Café",
      time: "10:00 AM – 12:00 PM",
    },
    // July
    {
      month: "Jul",
      monthFull: "July",
      day: "02",
      title: "Indoor Plant Propagation",
      host: "Hosted by Anjali",
      location: "Terra Nova — Anjali's home",
      time: "4:30 – 6:30 PM",
    },
    {
      month: "Jul",
      monthFull: "July",
      day: "09",
      title: "Calligraphy & Cardmaking",
      host: "Hosted by Noor",
      location: "Community Centre",
      time: "4:00 – 6:00 PM",
    },
    {
      month: "Jul",
      monthFull: "July",
      day: "16",
      title: "Summer Gazpacho Cook-Along",
      host: "Hosted by Carmen",
      location: "Mirador — Carmen's kitchen",
      time: "5:00 – 7:00 PM",
    },
  ];

  const handleRsvpToggle = (title: string) => {
    if (rsvps.includes(title)) {
      setRsvps(rsvps.filter((t) => t !== title));
    } else {
      setRsvps([...rsvps, title]);
    }
  };

  const getMonthCount = (monthKey: string) => {
    return events.filter((e) => e.month === monthKey).length;
  };

  const filteredEvents = events.filter((e) => e.month === activeMonth);

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

  return (
    <motion.section
      id="events"
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
          ~ what's happening ~
        </motion.div>
        <motion.h2 className="section-title" variants={textVariants}>
          Calendar of gatherings.
        </motion.h2>
        <motion.p className="section-intro" variants={textVariants}>
          We meet every Wednesday afternoon. Pick a month, find a gathering that
          calls to you, and tap RSVP. Locations rotate between members' homes,
          the community centre, and the polo lawns when the weather is kind.
        </motion.p>

        <motion.div className="month-tabs" role="tablist" variants={textVariants}>
          {["May", "Jun", "Jul"].map((m) => {
            const label = m === "Jun" ? "June" : m === "Jul" ? "July" : "May";
            const isActive = activeMonth === m;
            return (
              <button
                key={m}
                className={`month-tab ${isActive ? "active" : ""}`}
                onClick={() => setActiveMonth(m)}
                style={{ position: "relative" }}
              >
                {label} <span className="month-count">{getMonthCount(m)}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="active-underline"
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "2px",
                      background: "var(--terracotta)",
                      zIndex: 2,
                    }}
                  />
                )}
              </button>
            );
          })}
        </motion.div>

        <motion.div className="events-list" style={{ overflow: "hidden" }} layout>
          <AnimatePresence mode="popLayout">
            {filteredEvents.map((event) => {
              const isConfirmed = rsvps.includes(event.title);
              return (
                <motion.div
                  className="event-item"
                  key={event.title}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
                >
                  <div className="event-date">
                    <div className="day">{event.day}</div>
                    <div className="month">{event.month}</div>
                  </div>
                  <div className="event-info">
                    <h4>{event.title}</h4>
                    <div className="meta">
                      <span>✦ {event.host}</span>
                      <span>◦ {event.location}</span>
                      <span>◦ {event.time}</span>
                    </div>
                  </div>
                  <motion.button
                    className={`rsvp-btn ${isConfirmed ? "confirmed" : ""}`}
                    onClick={() => handleRsvpToggle(event.title)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    layout
                  >
                    {isConfirmed ? "✓ You're in" : "RSVP"}
                  </motion.button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.section>
  );
}
