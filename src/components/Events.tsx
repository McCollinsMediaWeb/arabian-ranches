"use client";

import React, { useState, useEffect } from "react";
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

const monthLabels: Record<string, string> = {
  May: "May",
  Jun: "June",
  Jul: "July",
  Aug: "August",
  Sep: "September",
  Oct: "October",
  Nov: "November",
  Dec: "December",
  Jan: "January",
  Feb: "February",
  Mar: "March",
  Apr: "April"
};

export function Events() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMonth, setActiveMonth] = useState("May");
  const [rsvps, setRsvps] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        if (data.length > 0) {
          // If the default activeMonth has no events, set it to the first month with events
          const uniqueMonths = Array.from(new Set(data.map((e: any) => e.month))) as string[];
          if (uniqueMonths.length > 0 && !uniqueMonths.includes("May")) {
            setActiveMonth(uniqueMonths[0]);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load events:", err);
        setLoading(false);
      });
  }, []);

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

  // Get all unique months in order of occurrence in the database
  const uniqueMonths = Array.from(new Set(events.map((e) => e.month)));
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

  if (loading) {
    return (
      <section className="events" id="events">
        <div className="container" style={{ textAlign: "center", padding: "100px 0" }}>
          <p style={{ color: "var(--cream)", opacity: 0.6 }}>Loading gatherings...</p>
        </div>
      </section>
    );
  }

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

        {uniqueMonths.length > 0 && (
          <motion.div className="month-tabs" role="tablist" variants={textVariants}>
            {uniqueMonths.map((m) => {
              const label = monthLabels[m] || m;
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
        )}

        <motion.div className="events-list" style={{ overflow: "hidden" }} layout>
          {events.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ color: "var(--cream)", opacity: 0.6 }}>No gatherings scheduled at the moment.</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ color: "var(--cream)", opacity: 0.6 }}>No gatherings scheduled for this month.</p>
            </div>
          ) : (
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
          )}
        </motion.div>
      </div>
    </motion.section>
  );
}
