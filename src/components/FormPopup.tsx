"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FormPopupProps {
  isOpen: boolean;
  isSuccess: boolean;
  message: string;
  onClose: () => void;
}

export function FormPopup({ isOpen, isSuccess, message, onClose }: FormPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
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
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 15, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="form-popup-modal"
            style={{
              backgroundColor: "#1c1c1c",
              border: isSuccess ? "1px solid var(--gold, #c79a4b)" : "1px solid #ef4444",
              borderRadius: "8px",
              padding: "40px 32px",
              maxWidth: "480px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6)",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Icon */}
            <div 
              onClick={onClose}
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

            {/* Icon */}
            <div style={{
              fontSize: "56px",
              marginBottom: "16px",
              lineHeight: 1,
              color: isSuccess ? "var(--gold, #c79a4b)" : "#ef4444"
            }}>
              {isSuccess ? "✦" : "✕"}
            </div>
            
            {/* Title */}
            <h3 style={{
              fontSize: "22px",
              color: "var(--cream, #f6efe4)",
              marginBottom: "16px",
              fontWeight: "normal",
              letterSpacing: "1.5px",
            }}>
              {isSuccess ? "Request Received" : "Submission Error"}
            </h3>
            
            {/* Message */}
            <p style={{
              color: "rgba(246, 239, 228, 0.75)",
              fontSize: "14px",
              lineHeight: "1.6",
              marginBottom: "32px"
            }}>
              {message}
            </p>

            {/* Action Button */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              style={{
                backgroundColor: isSuccess ? "var(--gold, #c79a4b)" : "transparent",
                border: isSuccess ? "none" : "1px solid #ef4444",
                color: isSuccess ? "var(--ink, #121212)" : "#ef4444",
                padding: "12px 36px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                letterSpacing: "0.5px"
              }}
            >
              Close
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
