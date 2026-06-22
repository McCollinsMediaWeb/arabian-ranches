"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FormPopup } from "./FormPopup";
import { PhoneInput } from "./PhoneInput";

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
  const [user, setUser] = useState<any>(null);
  const [myRsvps, setMyRsvps] = useState<Record<string, string>>({});

  // RSVP form states
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);
  const [rsvpConfirmOpen, setRsvpConfirmOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpPhone, setRsvpPhone] = useState("");
  const [rsvpEmail, setRsvpEmail] = useState("");
  const [rsvpSubmitLoading, setRsvpSubmitLoading] = useState(false);

  // Success/Error popup states
  const [showFormPopup, setShowFormPopup] = useState(false);
  const [popupSuccess, setPopupSuccess] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const fetchAuthAndRsvps = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
        
        // Fetch user RSVPs
        const rsvpRes = await fetch("/api/rsvps/my");
        if (rsvpRes.ok) {
          const rsvpData = await rsvpRes.json();
          const rsvpMap: Record<string, string> = {};
          rsvpData.forEach((r: any) => {
            rsvpMap[r.event_title] = r.status;
          });
          setMyRsvps(rsvpMap);
        }
      } else {
        setUser(null);
        setMyRsvps({});
      }
    } catch (err) {
      console.error("Failed to load user auth or RSVPs:", err);
    }
  };

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        if (data.length > 0) {
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

    fetchAuthAndRsvps();
    window.addEventListener("auth-state-change", fetchAuthAndRsvps);
    return () => {
      window.removeEventListener("auth-state-change", fetchAuthAndRsvps);
    };
  }, []);

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setRsvpSubmitLoading(true);

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formType: "rsvp",
          name: rsvpName,
          phone: rsvpPhone,
          email: rsvpEmail,
          eventName: selectedEvent.title,
          eventDate: `${selectedEvent.day} ${selectedEvent.month}`,
          eventTime: selectedEvent.time,
          eventLocation: selectedEvent.location
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit RSVP. Please try again.");
      }

      // Success
      setRsvps([...rsvps, selectedEvent.title]);
      setPopupSuccess(true);
      setPopupMessage(`Thank you, ${rsvpName}! Your RSVP for "${selectedEvent.title}" has been registered.`);
      setShowFormPopup(true);
      setIsRsvpOpen(false);

      // Reset fields
      setRsvpName("");
      setRsvpPhone("");
      setRsvpEmail("");
    } catch (err: any) {
      setPopupSuccess(false);
      setPopupMessage(err.message || "Failed to submit RSVP. Please try again.");
      setShowFormPopup(true);
    } finally {
      setRsvpSubmitLoading(false);
    }
  };

  const handleRsvpRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setRsvpSubmitLoading(true);

    try {
      const response = await fetch("/api/rsvps/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventTitle: selectedEvent.title,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit seat request. Please try again.");
      }

      // Success
      setMyRsvps(prev => ({ ...prev, [selectedEvent.title]: 'pending' }));
      setPopupSuccess(true);
      setPopupMessage(`Your seat request for "${selectedEvent.title}" has been submitted successfully! The administrator will review your request shortly.`);
      setShowFormPopup(true);
      setRsvpConfirmOpen(false);
    } catch (err: any) {
      setPopupSuccess(false);
      setPopupMessage(err.message || "Failed to submit seat request. Please try again.");
      setShowFormPopup(true);
    } finally {
      setRsvpSubmitLoading(false);
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
                const userRsvpStatus = user ? myRsvps[event.title] : null;
                const isConfirmed = rsvps.includes(event.title) || userRsvpStatus === "approved";
                
                let btnLabel = "RSVP";
                let btnClass = "rsvp-btn";
                let isDisabled = false;
                let customStyle = {};

                if (user) {
                  if (userRsvpStatus === "approved") {
                    btnLabel = "✓ Seat Approved";
                    btnClass = "rsvp-btn confirmed";
                    isDisabled = true;
                    customStyle = { cursor: "default", pointerEvents: "none" };
                  } else if (userRsvpStatus === "pending") {
                    btnLabel = "✓ Requested";
                    btnClass = "rsvp-btn pending";
                    isDisabled = true;
                    customStyle = {
                      backgroundColor: "rgba(199, 154, 75, 0.15)",
                      border: "1px solid var(--gold, #c79a4b)",
                      color: "var(--gold, #c79a4b)",
                      cursor: "default",
                      pointerEvents: "none"
                    };
                  } else if (userRsvpStatus === "declined") {
                    btnLabel = "Declined";
                    btnClass = "rsvp-btn declined";
                    isDisabled = true;
                    customStyle = {
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(246, 239, 228, 0.15)",
                      color: "rgba(246, 239, 228, 0.3)",
                      cursor: "default",
                      pointerEvents: "none"
                    };
                  }
                } else if (isConfirmed) {
                  btnLabel = "✓ You're in";
                  btnClass = "rsvp-btn confirmed";
                  isDisabled = true;
                  customStyle = { cursor: "default", pointerEvents: "none" };
                }

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
                      className={btnClass}
                      disabled={isDisabled}
                      onClick={() => {
                        if (!user) {
                          window.dispatchEvent(new Event("open-login-modal"));
                          return;
                        }
                        setSelectedEvent(event);
                        setRsvpConfirmOpen(true);
                      }}
                      whileHover={isDisabled ? {} : { scale: 1.05 }}
                      whileTap={isDisabled ? {} : { scale: 0.95 }}
                      style={customStyle}
                      layout
                    >
                      {btnLabel}
                    </motion.button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </motion.div>
      </div>

      {/* RSVP Modal Overlay */}
      <AnimatePresence>
        {isRsvpOpen && selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(10, 10, 10, 0.85)",
              backdropFilter: "blur(10px)",
              zIndex: 99998,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px"
            }}
            onClick={() => setIsRsvpOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              style={{
                backgroundColor: "#1c1c1c",
                border: "1px solid var(--gold, #c79a4b)",
                borderRadius: "8px",
                padding: "36px 32px",
                maxWidth: "480px",
                width: "100%",
                boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6)",
                position: "relative",
                textAlign: "left"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Icon */}
              <div 
                onClick={() => setIsRsvpOpen(false)}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "20px",
                  color: "rgba(246, 239, 228, 0.4)",
                  fontSize: "20px",
                  cursor: "pointer",
                  transition: "color 0.2s",
                  userSelect: "none"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "rgba(246, 239, 228, 0.8)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "rgba(246, 239, 228, 0.4)"}
              >
                ✕
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: "20px",
                color: "var(--cream, #f6efe4)",
                marginBottom: "8px",
                fontWeight: "normal",
                letterSpacing: "1px",
              }}>
                Gathering RSVP
              </h3>
              <p style={{
                color: "var(--gold, #c79a4b)",
                fontSize: "14px",
                marginBottom: "24px",
                lineHeight: "1.4"
              }}>
                {selectedEvent.title} — {selectedEvent.day} {monthLabels[selectedEvent.month] || selectedEvent.month}
              </p>

              <form onSubmit={handleRsvpSubmit}>
                {/* Name */}
                <div style={{ marginBottom: "16px" }}>
                  <label htmlFor="rsvpName" style={{ display: "block", color: "rgba(246, 239, 228, 0.7)", fontSize: "13px", marginBottom: "6px" }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="rsvpName"
                    required
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                    placeholder="e.g. Layla Hassan"
                    style={{
                      width: "100%",
                      padding: "12px",
                      backgroundColor: "#222",
                      border: "1px solid #333",
                      borderRadius: "4px",
                      color: "var(--cream, #f6efe4)",
                      fontSize: "14px",
                      outline: "none",
                      transition: "border-color 0.2s"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "var(--gold, #c79a4b)"}
                    onBlur={(e) => e.target.style.borderColor = "#333"}
                  />
                </div>

                {/* Phone */}
                <div style={{ marginBottom: "16px" }}>
                  <label htmlFor="rsvpPhone" style={{ display: "block", color: "rgba(246, 239, 228, 0.7)", fontSize: "13px", marginBottom: "6px" }}>
                    WhatsApp Number
                  </label>
                  <PhoneInput
                    id="rsvpPhone"
                    required
                    value={rsvpPhone}
                    onChange={setRsvpPhone}
                    theme="dark"
                  />
                </div>

                {/* Email */}
                <div style={{ marginBottom: "28px" }}>
                  <label htmlFor="rsvpEmail" style={{ display: "block", color: "rgba(246, 239, 228, 0.7)", fontSize: "13px", marginBottom: "6px" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="rsvpEmail"
                    required
                    value={rsvpEmail}
                    onChange={(e) => setRsvpEmail(e.target.value)}
                    placeholder="hello@email.com"
                    style={{
                      width: "100%",
                      padding: "12px",
                      backgroundColor: "#222",
                      border: "1px solid #333",
                      borderRadius: "4px",
                      color: "var(--cream, #f6efe4)",
                      fontSize: "14px",
                      outline: "none",
                      transition: "border-color 0.2s"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "var(--gold, #c79a4b)"}
                    onBlur={(e) => e.target.style.borderColor = "#333"}
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={rsvpSubmitLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: "100%",
                    backgroundColor: "var(--gold, #c79a4b)",
                    color: "var(--ink, #121212)",
                    border: "none",
                    padding: "14px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "14px",
                    letterSpacing: "0.5px",
                    opacity: rsvpSubmitLoading ? 0.7 : 1
                  }}
                >
                  {rsvpSubmitLoading ? "Submitting..." : "Confirm RSVP"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RSVP Confirmation Modal for Logged In Users */}
      <AnimatePresence>
        {rsvpConfirmOpen && selectedEvent && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(10, 10, 10, 0.85)",
              backdropFilter: "blur(10px)",
              zIndex: 99998,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px"
            }}
            onClick={() => setRsvpConfirmOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              style={{
                backgroundColor: "#1c1c1c",
                border: "1px solid var(--gold, #c79a4b)",
                borderRadius: "8px",
                padding: "36px 32px",
                maxWidth: "480px",
                width: "100%",
                boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6)",
                position: "relative",
                textAlign: "left"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Icon */}
              <div 
                onClick={() => setRsvpConfirmOpen(false)}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "20px",
                  color: "rgba(246, 239, 228, 0.4)",
                  fontSize: "20px",
                  cursor: "pointer",
                  transition: "color 0.2s",
                  userSelect: "none"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "rgba(246, 239, 228, 0.8)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "rgba(246, 239, 228, 0.4)"}
              >
                ✕
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: "20px",
                color: "var(--cream, #f6efe4)",
                marginBottom: "8px",
                fontWeight: "normal",
                letterSpacing: "1px",
              }}>
                Request Event Seat
              </h3>
              <p style={{
                color: "var(--gold, #c79a4b)",
                fontSize: "14px",
                marginBottom: "24px",
                lineHeight: "1.4"
              }}>
                {selectedEvent.title} — {selectedEvent.day} {monthLabels[selectedEvent.month] || selectedEvent.month}
              </p>

              <div style={{ color: "var(--cream)", fontSize: "14px", lineHeight: "1.6", marginBottom: "30px" }}>
                <p>Hi <strong>{user.name}</strong>,</p>
                <p style={{ marginTop: "10px" }}>Would you like to request a seat for this community gathering?</p>
                <p style={{ marginTop: "10px", color: "rgba(246, 239, 228, 0.5)", fontSize: "13px" }}>
                  An email notification will be sent to <strong>{user.email}</strong> once the administrator reviews and approves your request.
                </p>
              </div>

              <form onSubmit={handleRsvpRequestSubmit}>
                {/* Submit Button */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <motion.button
                    type="submit"
                    disabled={rsvpSubmitLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      flex: 1,
                      backgroundColor: "var(--gold, #c79a4b)",
                      color: "var(--ink, #121212)",
                      border: "none",
                      padding: "14px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "14px",
                      letterSpacing: "0.5px",
                      opacity: rsvpSubmitLoading ? 0.7 : 1
                    }}
                  >
                    {rsvpSubmitLoading ? "Submitting..." : "Request Seat"}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setRsvpConfirmOpen(false)}
                    style={{
                      padding: "14px 20px",
                      backgroundColor: "#333",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Submission Popup */}
      <FormPopup
        isOpen={showFormPopup}
        isSuccess={popupSuccess}
        message={popupMessage}
        onClose={() => setShowFormPopup(false)}
      />
    </motion.section>
  );
}
