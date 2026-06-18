"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
  const [passwordInput, setPasswordInput] = useState("");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<"submissions" | "calendar" | "gallery" | "recognition">("submissions");
  const [loading, setLoading] = useState(false);

  // Data states
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [recognition, setRecognition] = useState<any>(null);

  // Forms states
  const [eventForm, setEventForm] = useState({
    day: "",
    month: "May",
    monthFull: "May",
    title: "",
    host: "",
    location: "",
    time: ""
  });

  const [galleryForm, setGalleryForm] = useState({
    month: "",
    title: "",
    meta: "",
    photos: "",
    g1: "#b8533a",
    g2: "#d9a48a",
    deco: "mezze"
  });

  const [weeklyForm, setWeeklyForm] = useState({
    name: "",
    role: "",
    avatar: "",
    story: "",
    attribution: ""
  });

  // Load auth state from session
  useEffect(() => {
    const savedToken = sessionStorage.getItem("adminPassword");
    if (savedToken) {
      verifyAndLoad(savedToken);
    }
  }, []);

  const verifyAndLoad = async (pass: string) => {
    setLoading(true);
    setAuthError("");
    try {
      // Test the password by requesting submissions which require auth
      const res = await fetch("/api/submissions", {
        headers: { "x-admin-password": pass }
      });

      if (!res.ok) {
        throw new Error("Invalid password");
      }

      const subsData = await res.json();
      setSubmissions(subsData);
      setAuthToken(pass);
      sessionStorage.setItem("adminPassword", pass);
      setIsAuthenticated(true);

      // Load other data
      await loadAllData(pass);
    } catch (err: any) {
      setAuthError(err.message || "Failed to log in.");
      sessionStorage.removeItem("adminPassword");
    } finally {
      setLoading(false);
    }
  };

  const loadAllData = async (pass: string) => {
    try {
      const [eventsRes, galleryRes, recRes] = await Promise.all([
        fetch("/api/events"),
        fetch("/api/gallery"),
        fetch("/api/recognition")
      ]);

      const eventsData = await eventsRes.json();
      const galleryData = await galleryRes.json();
      const recData = await recRes.json();

      setEvents(eventsData);
      setGallery(galleryData);
      setRecognition(recData);

      if (recData?.buddyOfWeek) {
        setWeeklyForm({
          name: recData.buddyOfWeek.name || "",
          role: recData.buddyOfWeek.role || "",
          avatar: recData.buddyOfWeek.avatar || "",
          story: recData.buddyOfWeek.story || "",
          attribution: recData.buddyOfWeek.attribution || ""
        });
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyAndLoad(passwordInput);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminPassword");
    setAuthToken(null);
    setIsAuthenticated(false);
    setPasswordInput("");
  };

  // Add Event handler
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": authToken
        },
        body: JSON.stringify(eventForm)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add gathering");
      }

      alert("Gathering added successfully!");
      // Reset form
      setEventForm({
        day: "",
        month: "May",
        monthFull: "May",
        title: "",
        host: "",
        location: "",
        time: ""
      });
      // Refresh list
      const freshRes = await fetch("/api/events");
      setEvents(await freshRes.json());
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Delete Event handler
  const handleDeleteEvent = async (title: string) => {
    if (!authToken || !confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/events?title=${encodeURIComponent(title)}`, {
        method: "DELETE",
        headers: { "x-admin-password": authToken }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete gathering");
      }

      // Refresh list
      const freshRes = await fetch("/api/events");
      setEvents(await freshRes.json());
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Add Gallery handler
  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;

    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": authToken
        },
        body: JSON.stringify(galleryForm)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add gallery item");
      }

      alert("Gallery item added successfully!");
      // Reset form
      setGalleryForm({
        month: "",
        title: "",
        meta: "",
        photos: "",
        g1: "#b8533a",
        g2: "#d9a48a",
        deco: "mezze"
      });
      // Refresh list
      const freshRes = await fetch("/api/gallery");
      setGallery(await freshRes.json());
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Delete Gallery handler
  const handleDeleteGallery = async (title: string) => {
    if (!authToken || !confirm(`Are you sure you want to delete gallery item "${title}"?`)) return;

    try {
      const res = await fetch(`/api/gallery?title=${encodeURIComponent(title)}`, {
        method: "DELETE",
        headers: { "x-admin-password": authToken }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete gallery item");
      }

      // Refresh list
      const freshRes = await fetch("/api/gallery");
      setGallery(await freshRes.json());
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Update Buddy of the Week handler
  const handleUpdateWeekly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;

    try {
      const res = await fetch("/api/recognition", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": authToken
        },
        body: JSON.stringify({
          type: "weekly",
          data: weeklyForm
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update Buddy of the Week");
      }

      alert("Buddy of the Week updated successfully!");
      // Refresh data
      const freshRes = await fetch("/api/recognition");
      const recData = await freshRes.json();
      setRecognition(recData);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Reset Nominee Votes handler
  const handleResetVotes = async () => {
    if (!authToken || !confirm("Are you sure you want to reset all vote counts for the Star Buddy poll?")) return;

    try {
      const updatedNominees = recognition.buddyOfMonth.nominees.map((n: any) => ({
        ...n,
        votes: 0
      }));

      const res = await fetch("/api/recognition", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": authToken
        },
        body: JSON.stringify({
          type: "monthly",
          data: {
            ...recognition.buddyOfMonth,
            nominees: updatedNominees
          }
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reset poll votes");
      }

      alert("Poll votes reset successfully!");
      // Refresh data
      const freshRes = await fetch("/api/recognition");
      const recData = await freshRes.json();
      setRecognition(recData);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Helper to format timestamps
  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  // Render Login Panel
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#121212",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-sans), Arial, sans-serif",
        padding: "20px"
      }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            maxWidth: "400px",
            width: "100%",
            backgroundColor: "#1c1c1c",
            border: "1px solid var(--gold, #c79a4b)",
            borderRadius: "8px",
            padding: "40px 32px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: "40px", color: "var(--gold, #c79a4b)", marginBottom: "16px" }}>✦</div>
          <h2 style={{ color: "var(--cream, #f6efe4)", fontWeight: "normal", letterSpacing: "1px", marginBottom: "8px", fontSize: "22px" }}>Arabian Ranches Admin</h2>
          <p style={{ color: "rgba(246, 239, 228, 0.5)", fontSize: "14px", marginBottom: "28px" }}>Enter password to access dashboard</p>
          
          <form onSubmit={handleLoginSubmit}>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                backgroundColor: "#222",
                border: "1px solid #333",
                borderRadius: "4px",
                color: "var(--cream, #f6efe4)",
                fontSize: "16px",
                textAlign: "center",
                outline: "none",
                marginBottom: "20px"
              }}
            />
            {authError && <p style={{ color: "#ef4444", fontSize: "14px", marginTop: "-12px", marginBottom: "16px" }}>✕ {authError}</p>}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "var(--gold, #c79a4b)",
                color: "#121212",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "15px",
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? "Authenticating..." : "Login"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#121212",
      color: "var(--cream, #f6efe4)",
      fontFamily: "var(--font-sans), Arial, sans-serif",
      paddingBottom: "80px"
    }}>
      {/* Header bar */}
      <header style={{
        borderBottom: "1px solid rgba(246, 239, 228, 0.1)",
        backgroundColor: "#161616",
        padding: "20px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "var(--gold, #c79a4b)", fontSize: "20px" }}>✦</span>
          <h1 style={{ fontSize: "20px", fontWeight: "normal", letterSpacing: "1px", margin: 0 }}>Circle Admin Dashboard</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <a href="/" target="_blank" style={{ color: "var(--gold, #c79a4b)", textDecoration: "none", fontSize: "14px" }}>View Live Site ↗</a>
          <button 
            onClick={handleLogout}
            style={{
              background: "transparent",
              border: "1px solid rgba(246, 239, 228, 0.3)",
              color: "rgba(246, 239, 228, 0.7)",
              padding: "6px 16px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px"
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div style={{ maxWidth: "1200px", margin: "40px auto 0 auto", padding: "0 20px" }}>
        
        {/* Navigation Tabs */}
        <div style={{
          display: "flex",
          borderBottom: "1px solid rgba(246, 239, 228, 0.1)",
          marginBottom: "32px",
          gap: "8px"
        }}>
          {[
            { id: "submissions", label: "Form Submissions" },
            { id: "calendar", label: "Manage Calendar" },
            { id: "gallery", label: "Manage Gallery" },
            { id: "recognition", label: "Buddy Recognitions" }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "transparent",
                  border: "none",
                  color: isActive ? "var(--gold, #c79a4b)" : "rgba(246, 239, 228, 0.5)",
                  cursor: "pointer",
                  fontSize: "15px",
                  borderBottom: isActive ? "2px solid var(--gold, #c79a4b)" : "2px solid transparent",
                  marginBottom: "-1px",
                  transition: "all 0.2s"
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div>

          {/* 1. Submissions Tab */}
          {activeTab === "submissions" && (
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: "normal", marginBottom: "20px" }}>Member Submissions & Request Logs</h2>
              {submissions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px", border: "1px dashed #333", borderRadius: "8px" }}>
                  <p style={{ color: "rgba(246, 239, 228, 0.4)" }}>No submissions have been recorded yet.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {submissions.map((sub) => {
                    const isRegister = sub.formType === "register";
                    const isVolunteer = sub.formType === "become-buddy";
                    const isRsvp = sub.formType === "rsvp";
                    
                    // Format WhatsApp link message
                    let customMsg = "";
                    if (isRegister) {
                      customMsg = `Hello ${sub.name}, 😊 \n\nthank you for your request to join the Arabian Ranches Circle! We have received your details and are excited to welcome you. \n\nOne of our community hosts will share further details shortly. \n\nPlease let us know if you have any questions!`;
                    } else if (isVolunteer) {
                      customMsg = `Hello ${sub.name}, thank you so much for volunteering as a Buddy! We'll match you shortly.`;
                    } else if (isRsvp) {
                      customMsg = `Hello ${sub.name}, 😊 \n\nthank you for RSVPing to our gathering "${sub.note}"! We have received your RSVP and look forward to seeing you. \n\nPlease let us know if you have any questions!`;
                    } else {
                      customMsg = `Hello ${sub.name}, we received your request for a Buddy matching. We are reviewing options.`;
                    }

                    // Format phone for wa.me link
                    let cleanPhone = sub.phone?.replace(/\D/g, "") || "";
                    if (cleanPhone.startsWith("05") && cleanPhone.length === 10) {
                      cleanPhone = "971" + cleanPhone.substring(1);
                    } else if (cleanPhone.startsWith("5") && cleanPhone.length === 9) {
                      cleanPhone = "971" + cleanPhone;
                    }
                    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customMsg)}`;

                    return (
                      <div 
                        key={sub.id} 
                        style={{
                          backgroundColor: "#1c1c1c",
                          border: isRegister ? "1px solid rgba(199, 154, 75, 0.4)" : isRsvp ? "1px solid rgba(59, 130, 246, 0.4)" : "1px solid #333",
                          borderRadius: "8px",
                          padding: "24px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                          <div>
                            <span style={{
                              fontSize: "12px",
                              backgroundColor: isRegister ? "rgba(199, 154, 75, 0.15)" : isVolunteer ? "rgba(37, 211, 102, 0.1)" : isRsvp ? "rgba(59, 130, 246, 0.1)" : "rgba(239, 68, 68, 0.1)",
                              color: isRegister ? "var(--gold, #c79a4b)" : isVolunteer ? "#4ade80" : isRsvp ? "#60a5fa" : "#fca5a5",
                              border: `1px solid ${isRegister ? "var(--gold, #c79a4b)" : isVolunteer ? "#22c55e" : isRsvp ? "#3b82f6" : "#ef4444"}`,
                              padding: "4px 8px",
                              borderRadius: "4px",
                              textTransform: "uppercase",
                              fontWeight: "bold",
                              letterSpacing: "0.5px"
                            }}>
                              {sub.formType === "register" ? "Seat Request" : sub.formType === "become-buddy" ? "Buddy Volunteer" : sub.formType === "rsvp" ? "Gathering RSVP" : "Buddy Request"}
                            </span>
                            <h3 style={{ fontSize: "18px", margin: "12px 0 4px 0", fontWeight: "normal", color: "white" }}>{sub.name}</h3>
                            <span style={{ fontSize: "13px", color: "rgba(246, 239, 228, 0.4)" }}>Submitted on {formatTime(sub.submittedAt)}</span>
                          </div>
                          <a 
                            href={waUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                              backgroundColor: "#25D366",
                              color: "white",
                              textDecoration: "none",
                              padding: "10px 20px",
                              borderRadius: "4px",
                              fontSize: "14px",
                              fontWeight: "bold",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px"
                            }}
                          >
                            WhatsApp Admin Connect
                          </a>
                        </div>

                        {/* Details Grid */}
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: "16px",
                          marginTop: "20px",
                          borderTop: "1px solid #282828",
                          paddingTop: "20px",
                          fontSize: "14px"
                        }}>
                          <div>
                            <p style={{ margin: "0 0 4px 0", color: "rgba(246, 239, 228, 0.4)" }}>WhatsApp Number</p>
                            <p style={{ margin: 0, fontWeight: "500" }}>{sub.phone}</p>
                          </div>
                          {sub.email && (
                            <div>
                              <p style={{ margin: "0 0 4px 0", color: "rgba(246, 239, 228, 0.4)" }}>Email Address</p>
                              <p style={{ margin: 0, fontWeight: "500" }}>{sub.email}</p>
                            </div>
                          )}
                          {sub.address && (
                            <div>
                              <p style={{ margin: "0 0 4px 0", color: "rgba(246, 239, 228, 0.4)" }}>Sub-community</p>
                              <p style={{ margin: 0, fontWeight: "500" }}>{sub.address}</p>
                            </div>
                          )}
                          {sub.age && (
                            <div>
                              <p style={{ margin: "0 0 4px 0", color: "rgba(246, 239, 228, 0.4)" }}>Age Group</p>
                              <p style={{ margin: 0, fontWeight: "500" }}>{sub.age}</p>
                            </div>
                          )}
                          {sub.registering && (
                            <div>
                              <p style={{ margin: "0 0 4px 0", color: "rgba(246, 239, 228, 0.4)" }}>Registering For</p>
                              <p style={{ margin: 0, fontWeight: "500" }}>{sub.registering}</p>
                            </div>
                          )}
                          {sub.free && (
                            <div>
                              <p style={{ margin: "0 0 4px 0", color: "rgba(246, 239, 228, 0.4)" }}>Availability</p>
                              <p style={{ margin: 0, fontWeight: "500" }}>{sub.free}</p>
                            </div>
                          )}
                          {sub.often && (
                            <div>
                              <p style={{ margin: "0 0 4px 0", color: "rgba(246, 239, 228, 0.4)" }}>Frequency</p>
                              <p style={{ margin: 0, fontWeight: "500" }}>{sub.often}</p>
                            </div>
                          )}
                        </div>

                        {/* Lists display (Share/Learn/Help/Need) */}
                        <div style={{ fontSize: "14px", marginTop: "16px" }}>
                          {sub.shareList && sub.shareList.length > 0 && (
                            <div style={{ marginTop: "10px" }}>
                              <span style={{ color: "rgba(246, 239, 228, 0.4)" }}>Expertise to Share: </span>
                              <span>{sub.shareList.join(", ")}</span>
                            </div>
                          )}
                          {sub.learnList && sub.learnList.length > 0 && (
                            <div style={{ marginTop: "10px" }}>
                              <span style={{ color: "rgba(246, 239, 228, 0.4)" }}>Interests to Learn: </span>
                              <span>{sub.learnList.join(", ")}</span>
                            </div>
                          )}
                          {sub.helpList && sub.helpList.length > 0 && (
                            <div style={{ marginTop: "10px" }}>
                              <span style={{ color: "rgba(246, 239, 228, 0.4)" }}>Volunteering Tasks: </span>
                              <span>{sub.helpList.join(", ")}</span>
                            </div>
                          )}
                          {sub.needList && sub.needList.length > 0 && (
                            <div style={{ marginTop: "10px" }}>
                              <span style={{ color: "rgba(246, 239, 228, 0.4)" }}>Requested Help Tasks: </span>
                              <span>{sub.needList.join(", ")}</span>
                            </div>
                          )}
                          {sub.note && (
                            <div style={{ marginTop: "16px", backgroundColor: "#222", padding: "12px 16px", borderRadius: "4px", fontStyle: "italic", color: "rgba(246, 239, 228, 0.8)" }}>
                              "{sub.note}"
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 2. Calendar Manager Tab */}
          {activeTab === "calendar" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "40px" }}>
              
              {/* Add Gathering Form */}
              <div style={{ backgroundColor: "#1c1c1c", borderRadius: "8px", padding: "32px", border: "1px solid #333" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "normal", marginBottom: "20px", color: "var(--gold, #c79a4b)" }}>Add New Gathering</h3>
                <form onSubmit={handleAddEvent}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px", marginBottom: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Day (DD)</label>
                      <input
                        type="text"
                        placeholder="e.g. 18"
                        required
                        value={eventForm.day}
                        onChange={(e) => setEventForm({ ...eventForm, day: e.target.value })}
                        style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Month Tab Selection</label>
                      <select
                        value={eventForm.month}
                        onChange={(e) => {
                          const m = e.target.value;
                          setEventForm({ 
                            ...eventForm, 
                            month: m,
                            monthFull: m === "Jun" ? "June" : m === "Jul" ? "July" : "May" 
                          });
                        }}
                        style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                      >
                        <option value="May">May</option>
                        <option value="Jun">June (Jun)</option>
                        <option value="Jul">July (Jul)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Gathering Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Sourdough Workshop"
                      required
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                    />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Host Detail</label>
                    <input
                      type="text"
                      placeholder="e.g. Hosted by Helen"
                      required
                      value={eventForm.host}
                      onChange={(e) => setEventForm({ ...eventForm, host: e.target.value })}
                      style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                    />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Hattan — Helen's kitchen"
                      required
                      value={eventForm.location}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                    />
                  </div>

                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Time Slot</label>
                    <input
                      type="text"
                      placeholder="e.g. 10:00 AM – 12:30 PM"
                      required
                      value={eventForm.time}
                      onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                      style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: "100%",
                      padding: "12px",
                      backgroundColor: "var(--gold, #c79a4b)",
                      color: "#121212",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "14px"
                    }}
                  >
                    Add Gathering to Calendar
                  </button>
                </form>
              </div>

              {/* List Gatherings */}
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "normal", marginBottom: "20px" }}>Current Gathering Schedule ({events.length})</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {events.map((event) => (
                    <div 
                      key={event.title}
                      style={{
                        backgroundColor: "#1c1c1c",
                        border: "1px solid #282828",
                        borderRadius: "6px",
                        padding: "16px 20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <span style={{ fontSize: "11px", color: "var(--gold, #c79a4b)", textTransform: "uppercase" }}>{event.monthFull} {event.day}</span>
                        <h4 style={{ margin: "4px 0", fontSize: "16px", fontWeight: "normal" }}>{event.title}</h4>
                        <span style={{ fontSize: "13px", color: "rgba(246, 239, 228, 0.5)" }}>{event.host} · {event.location}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteEvent(event.title)}
                        style={{
                          backgroundColor: "transparent",
                          border: "1px solid #ef4444",
                          color: "#ef4444",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px"
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* 3. Gallery Manager Tab */}
          {activeTab === "gallery" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "40px" }}>
              
              {/* Add Gallery Item Form */}
              <div style={{ backgroundColor: "#1c1c1c", borderRadius: "8px", padding: "32px", border: "1px solid #333" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "normal", marginBottom: "20px", color: "var(--gold, #c79a4b)" }}>Add Gallery Card</h3>
                <form onSubmit={handleAddGallery}>
                  
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Month & Year</label>
                    <input
                      type="text"
                      placeholder="e.g. April 2026"
                      required
                      value={galleryForm.month}
                      onChange={(e) => setGalleryForm({ ...galleryForm, month: e.target.value })}
                      style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                    />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Gallery Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Rose Garden Walk"
                      required
                      value={galleryForm.title}
                      onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                      style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                    />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Meta details</label>
                    <input
                      type="text"
                      placeholder="e.g. 22 ladies · At Roya's home"
                      required
                      value={galleryForm.meta}
                      onChange={(e) => setGalleryForm({ ...galleryForm, meta: e.target.value })}
                      style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                    />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Photo Count Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. 24 photos"
                      required
                      value={galleryForm.photos}
                      onChange={(e) => setGalleryForm({ ...galleryForm, photos: e.target.value })}
                      style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                    />
                  </div>

                  {/* Gradient & Decoration Picker */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Gradient Start (g1)</label>
                      <select
                        value={galleryForm.g1}
                        onChange={(e) => setGalleryForm({ ...galleryForm, g1: e.target.value })}
                        style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                      >
                        <option value="#b8533a">Terracotta (#b8533a)</option>
                        <option value="#8f3d29">Deep Red (#8f3d29)</option>
                        <option value="#6b6b3a">Olive Green (#6b6b3a)</option>
                        <option value="#d9a48a">Peach (#d9a48a)</option>
                        <option value="#c79a4b">Gold (#c79a4b)</option>
                        <option value="#1c1c1c">Dark Gray (#1c1c1c)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Gradient End (g2)</label>
                      <select
                        value={galleryForm.g2}
                        onChange={(e) => setGalleryForm({ ...galleryForm, g2: e.target.value })}
                        style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                      >
                        <option value="#d9a48a">Peach (#d9a48a)</option>
                        <option value="#c79a4b">Gold (#c79a4b)</option>
                        <option value="#b8533a">Terracotta (#b8533a)</option>
                        <option value="#8f3d29">Deep Red (#8f3d29)</option>
                        <option value="#6b6b3a">Olive Green (#6b6b3a)</option>
                        <option value="#1c1c1c">Dark Gray (#1c1c1c)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>SVG Overlay Decoration</label>
                    <select
                      value={galleryForm.deco}
                      onChange={(e) => setGalleryForm({ ...galleryForm, deco: e.target.value })}
                      style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                    >
                      <option value="mezze">Mezze (Circles)</option>
                      <option value="yarn">Yarn (Wavy lines)</option>
                      <option value="leaves">Leaves (Ellipses)</option>
                      <option value="flower">Flower (Drawn blossoms)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: "100%",
                      padding: "12px",
                      backgroundColor: "var(--gold, #c79a4b)",
                      color: "#121212",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "14px"
                    }}
                  >
                    Create Gallery Card
                  </button>
                </form>
              </div>

              {/* List Gallery Items */}
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "normal", marginBottom: "20px" }}>Current Gallery Albums ({gallery.length})</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {gallery.map((item) => (
                    <div 
                      key={item.title}
                      style={{
                        backgroundColor: "#1c1c1c",
                        border: "1px solid #282828",
                        borderRadius: "6px",
                        padding: "16px 20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "4px",
                          background: `linear-gradient(135deg, ${item.g1}, ${item.g2})`
                        }}></div>
                        <div>
                          <span style={{ fontSize: "11px", color: "rgba(246, 239, 228, 0.5)" }}>{item.month}</span>
                          <h4 style={{ margin: "2px 0 0 0", fontSize: "15px", fontWeight: "normal" }}>{item.title}</h4>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteGallery(item.title)}
                        style={{
                          backgroundColor: "transparent",
                          border: "1px solid #ef4444",
                          color: "#ef4444",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px"
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* 4. Buddy Recognition Tab */}
          {activeTab === "recognition" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "40px" }}>
              
              {/* Manage Buddy of the Week */}
              <div style={{ backgroundColor: "#1c1c1c", borderRadius: "8px", padding: "32px", border: "1px solid #333" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "normal", marginBottom: "20px", color: "var(--gold, #c79a4b)" }}>Manage Buddy of the Week</h3>
                <form onSubmit={handleUpdateWeekly}>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Buddy Name</label>
                      <input
                        type="text"
                        placeholder="Leila Khoury"
                        required
                        value={weeklyForm.name}
                        onChange={(e) => setWeeklyForm({ ...weeklyForm, name: e.target.value })}
                        style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Avatar Initial</label>
                      <input
                        type="text"
                        maxLength={1}
                        placeholder="L"
                        required
                        value={weeklyForm.avatar}
                        onChange={(e) => setWeeklyForm({ ...weeklyForm, avatar: e.target.value })}
                        style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white", textAlign: "center" }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Role / Community details</label>
                    <input
                      type="text"
                      placeholder="Saheel, 62"
                      required
                      value={weeklyForm.role}
                      onChange={(e) => setWeeklyForm({ ...weeklyForm, role: e.target.value })}
                      style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                    />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Nomination Story</label>
                    <textarea
                      rows={4}
                      placeholder="Describe the kind gestures they did..."
                      required
                      value={weeklyForm.story}
                      onChange={(e) => setWeeklyForm({ ...weeklyForm, story: e.target.value })}
                      style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white", resize: "vertical", fontFamily: "sans-serif" }}
                    />
                  </div>

                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Attribution</label>
                    <input
                      type="text"
                      placeholder="— nominated by Margaret & the founding hosts"
                      required
                      value={weeklyForm.attribution}
                      onChange={(e) => setWeeklyForm({ ...weeklyForm, attribution: e.target.value })}
                      style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: "100%",
                      padding: "12px",
                      backgroundColor: "var(--gold, #c79a4b)",
                      color: "#121212",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "14px"
                    }}
                  >
                    Save Buddy of the Week
                  </button>
                </form>
              </div>

              {/* Manage Buddy of the Month Poll */}
              {recognition?.buddyOfMonth && (
                <div style={{ backgroundColor: "#1c1c1c", borderRadius: "8px", padding: "32px", border: "1px solid #333", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: "normal", marginBottom: "8px", color: "var(--gold, #c79a4b)" }}>Buddy of the Month Poll</h3>
                    <p style={{ color: "rgba(246, 239, 228, 0.5)", fontSize: "13px", marginBottom: "24px" }}>Current nominees and real-time community vote counts</p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {recognition.buddyOfMonth.nominees.map((nominee: any) => (
                        <div 
                          key={nominee.id}
                          style={{
                            backgroundColor: "#222",
                            borderRadius: "6px",
                            padding: "14px 18px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}
                        >
                          <div>
                            <span style={{ fontSize: "14px", fontWeight: "500", color: "white" }}>{nominee.name}</span>
                            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "rgba(246, 239, 228, 0.4)" }}>{nominee.reason}</p>
                          </div>
                          <span style={{
                            backgroundColor: "rgba(199, 154, 75, 0.15)",
                            color: "var(--gold, #c79a4b)",
                            border: "1px solid var(--gold, #c79a4b)",
                            padding: "4px 10px",
                            borderRadius: "4px",
                            fontSize: "13px",
                            fontWeight: "bold"
                          }}>
                            {nominee.votes || 0} votes
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: "40px" }}>
                    <button
                      onClick={handleResetVotes}
                      style={{
                        width: "100%",
                        padding: "12px",
                        backgroundColor: "transparent",
                        border: "1px solid #ef4444",
                        color: "#ef4444",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "14px"
                      }}
                    >
                      Reset Voting Poll (0 votes)
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
