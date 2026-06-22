"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    }
  };

  useEffect(() => {
    checkAuth();
    
    // Listen for global auth state changes
    window.addEventListener("auth-state-change", checkAuth);
    
    // Listen for open-login-modal trigger
    const handleOpenLogin = () => setIsLoginOpen(true);
    window.addEventListener("open-login-modal", handleOpenLogin);
    
    return () => {
      window.removeEventListener("auth-state-change", checkAuth);
      window.removeEventListener("open-login-modal", handleOpenLogin);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setShowDropdown(false);
      window.dispatchEvent(new Event("auth-state-change"));
      alert("Logged out successfully!");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        setIsLoginOpen(false);
        window.dispatchEvent(new Event("auth-state-change"));
        alert(`Welcome back, ${data.user.name}!`);
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Auth failed:", err);
    }
  };

  // Google button initialization inside the modal when it opens
  useEffect(() => {
    if (!isLoginOpen) return;
    
    const initGoogleBtn = () => {
      const google = (window as any).google;
      if (google && document.getElementById("google-signin-btn")) {
        google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "889286813342-64qcmcdh7rhe4pjfi0tglalh058s0oi5.apps.googleusercontent.com",
          callback: (response: any) => {
            if (response.credential) {
              handleGoogleSuccess(response.credential);
            }
          },
        });
        google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { 
            theme: "filled_blue", 
            size: "large",
            text: "signin_with",
            shape: "pill",
            width: 280
          }
        );
      }
    };

    // Delay a bit to ensure element is in DOM
    const timer = setTimeout(() => {
      if ((window as any).google) {
        initGoogleBtn();
      } else {
        const checkInterval = setInterval(() => {
          if ((window as any).google) {
            initGoogleBtn();
            clearInterval(checkInterval);
          }
        }, 200);
        return () => clearInterval(checkInterval);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoginOpen]);

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
      <div className="container nav-inner" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="logo" style={{ cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <span>♡</span> Connecting Hearts
        </div>

        {/* Desktop Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }} className="nav-menu-desktop">
          <ul className="nav-links" style={{ display: "flex", alignItems: "center", gap: "24px", listStyle: "none", margin: 0, padding: 0 }}>
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>

          {/* User Auth Info (Desktop) */}
          <div className="nav-auth-desktop" style={{ display: "flex", alignItems: "center" }}>
            {user ? (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 8px",
                    borderRadius: "20px",
                    transition: "background 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(246, 239, 228, 0.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <img
                    src={user.picture}
                    alt={user.name}
                    style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid var(--gold)" }}
                  />
                  <span style={{ color: "var(--cream)", fontSize: "14px" }} className="nav-username-desktop">
                    {user.name.split(" ")[0]}
                  </span>
                </button>
                
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      style={{
                        position: "absolute",
                        top: "45px",
                        right: 0,
                        backgroundColor: "#1c1c1c",
                        border: "1px solid var(--gold)",
                        borderRadius: "6px",
                        padding: "16px",
                        width: "220px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                        zIndex: 100
                      }}
                    >
                      <p style={{ margin: 0, fontSize: "14px", color: "var(--cream)", fontWeight: "bold" }}>{user.name}</p>
                      <p style={{ margin: "4px 0 12px 0", fontSize: "11px", color: "rgba(246, 239, 228, 0.4)", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</p>
                      <button
                        onClick={handleLogout}
                        style={{
                          width: "100%",
                          padding: "8px",
                          backgroundColor: "#8f3d29",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "13px"
                        }}
                      >
                        Log Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                style={{
                  padding: "8px 18px",
                  backgroundColor: "transparent",
                  border: "1px solid var(--gold, #c79a4b)",
                  color: "var(--gold, #c79a4b)",
                  borderRadius: "20px",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--gold, #c79a4b)";
                  e.currentTarget.style.color = "#121212";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--gold, #c79a4b)";
                }}
              >
                Sign In
              </button>
            )}
          </div>
        </div>

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
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, ease: "easeOut" }}
                    style={{
                      borderBottom: "1px dashed rgba(43, 36, 25, 0.08)",
                      paddingBottom: "12px",
                      listStyle: "none"
                    }}
                  >
                    <a 
                      href={link.href} 
                      onClick={() => setIsOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px"
                      }}
                    >
                      <span style={{ 
                        fontFamily: "var(--font-caveat), cursive", 
                        color: "var(--gold)", 
                        fontSize: "20px" 
                      }}>
                        0{idx + 1}.
                      </span>
                      <span className="mobile-link-text">{link.label}</span>
                    </a>
                  </motion.li>
                ))}

                {/* Mobile Auth options card */}
                <motion.li
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: links.length * 0.05 + 0.1 }}
                  style={{ listStyle: "none", marginTop: "24px" }}
                >
                  {user ? (
                    <div style={{
                      backgroundColor: "rgba(43, 36, 25, 0.03)",
                      border: "1px solid var(--line)",
                      borderRadius: "6px",
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "12px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <img 
                          src={user.picture} 
                          alt="" 
                          style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid var(--gold)" }} 
                        />
                        <div style={{ textAlign: "left" }}>
                          <div style={{ fontWeight: "bold", color: "var(--ink)", fontSize: "15px" }}>{user.name}</div>
                          <div style={{ fontSize: "11px", color: "var(--ink-soft)" }}>{user.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "10px",
                          backgroundColor: "#8f3d29",
                          color: "white",
                          border: "none",
                          borderRadius: "20px",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: "500",
                          transition: "background 0.2s"
                        }}
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      backgroundColor: "rgba(199, 154, 75, 0.05)",
                      border: "1px dashed var(--gold)",
                      borderRadius: "6px",
                      padding: "24px 20px",
                      textAlign: "center"
                    }}>
                      <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "var(--ink-soft)" }}>
                        Join us to request seats and connect with neighbours!
                      </p>
                      <button
                        onClick={() => {
                          setIsLoginOpen(true);
                          setIsOpen(false);
                        }}
                        style={{
                          padding: "12px 28px",
                          backgroundColor: "var(--terracotta)",
                          color: "var(--cream)",
                          border: "none",
                          borderRadius: "20px",
                          cursor: "pointer",
                          fontWeight: "500",
                          fontSize: "14px",
                          width: "100%",
                          boxShadow: "0 4px 15px rgba(184, 83, 58, 0.15)"
                        }}
                      >
                        Sign In with Google
                      </button>
                    </div>
                  )}
                </motion.li>
              </ul>

              {/* Botanical watermark element at the bottom of mobile menu */}
              <div style={{
                marginTop: "auto",
                paddingTop: "40px",
                display: "flex",
                justifyContent: "center",
                opacity: 0.08,
                pointerEvents: "none"
              }}>
                <svg width="80" height="80" viewBox="0 0 400 400" fill="none" stroke="var(--ink)">
                  <path d="M200 186 Q190 170 200 160 Q210 170 200 186" fill="currentColor" strokeWidth="2" />
                  <path d="M200 214 Q190 230 200 240 Q210 230 200 214" fill="currentColor" strokeWidth="2" />
                  <path d="M186 200 Q170 190 160 200 Q170 210 186 200" fill="currentColor" strokeWidth="2" />
                  <path d="M214 200 Q230 190 240 200 Q230 210 214 200" fill="currentColor" strokeWidth="2" />
                </svg>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Login Modal Overlay */}
      <AnimatePresence>
        {isLoginOpen && (
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
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px"
            }}
            onClick={() => setIsLoginOpen(false)}
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
                maxWidth: "400px",
                width: "100%",
                boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6)",
                position: "relative",
                textAlign: "center"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                onClick={() => setIsLoginOpen(false)}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "20px",
                  color: "rgba(246, 239, 228, 0.4)",
                  fontSize: "20px",
                  cursor: "pointer",
                  userSelect: "none"
                }}
              >
                ✕
              </div>

              <span style={{ fontSize: "36px", color: "var(--gold)" }}>♡</span>
              <h3 style={{
                fontSize: "20px",
                color: "var(--cream, #f6efe4)",
                marginTop: "12px",
                marginBottom: "8px",
                fontWeight: "normal",
                letterSpacing: "1px"
              }}>
                Welcome to the Circle
              </h3>
              <p style={{
                color: "rgba(246, 239, 228, 0.6)",
                fontSize: "14px",
                marginBottom: "28px",
                lineHeight: "1.4"
              }}>
                Sign in with Google to request seats and RSVP for upcoming gatherings.
              </p>

              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                <div id="google-signin-btn"></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
