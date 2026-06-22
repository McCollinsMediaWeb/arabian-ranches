"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
  const [passwordInput, setPasswordInput] = useState("");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<"requests" | "calendar" | "gallery" | "recognition" | "snapshots" | "team" | "members">("requests");
  const [requestSubTab, setRequestSubTab] = useState<"general" | "members" | "buddy">("general");
  const [buddySelections, setBuddySelections] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Member states
  const [memberForm, setMemberForm] = useState({
    id: "",
    name: "",
    role: "Member",
    location: "",
    bio: "",
    g1: "#d9a48a",
    g2: "#b8533a"
  });
  const [memberImage, setMemberImage] = useState<string | null>(null);

  // Data states
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [recognition, setRecognition] = useState<any>(null);
  const [snapshots, setSnapshots] = useState<any[]>([]);

  // Forms states
  const [snapshotForm, setSnapshotForm] = useState({
    caption: "",
    p1: "#b8533a",
    p2: "#d9a48a",
    rotation: 0,
    marginTop: "0px"
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // Team states
  const [team, setTeam] = useState<any[]>([]);
  const [adminRsvps, setAdminRsvps] = useState<any[]>([]);
  const [teamForm, setTeamForm] = useState({
    id: "",
    name: "",
    role: "",
    location: "",
    bio: "",
    g1: "#d9a48a",
    g2: "#b8533a"
  });
  const [teamImage, setTeamImage] = useState<string | null>(null);

  // Forms states
  const [eventForm, setEventForm] = useState({
    day: "",
    month: "May",
    monthFull: "May",
    title: "",
    host: "",
    location: "",
    time: "",
    bringOptions: ""
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
  const [galleryCoverPhoto, setGalleryCoverPhoto] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

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
      const [eventsRes, galleryRes, recRes, snapshotsRes, teamRes, rsvpsRes] = await Promise.all([
        fetch("/api/events"),
        fetch("/api/gallery"),
        fetch("/api/recognition"),
        fetch("/api/snapshots"),
        fetch("/api/team"),
        fetch("/api/admin/rsvps", { headers: { "x-admin-password": pass } })
      ]);

      const eventsData = await eventsRes.json();
      const galleryData = await galleryRes.json();
      const recData = await recRes.json();
      const snapshotsData = await snapshotsRes.json();
      const teamData = await teamRes.json();
      const rsvpsData = await rsvpsRes.json();

      setEvents(eventsData);
      setGallery(galleryData);
      setRecognition(recData);
      setSnapshots(snapshotsData);
      setTeam(teamData);
      setAdminRsvps(rsvpsData);

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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAddSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      alert("Please choose at least one photo to upload.");
      return;
    }

    setLoading(true);
    setUploading(true);
    try {
      for (const file of selectedFiles) {
        // 1. Convert file to Base64
        const imageUrl = await fileToBase64(file);

        // 2. Add snapshot details (with Base64 image data) to DB
        const res = await fetch("/api/snapshots", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-password": authToken || ""
          },
          body: JSON.stringify({ imageUrl })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || `Failed to add snapshot record for ${file.name}`);
        }
      }

      // Reset form and reload
      setSelectedFiles([]);
      
      const fileInput = document.getElementById("snapshotFileInput") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      // Reload snapshots list
      const snapshotsRes = await fetch("/api/snapshots");
      const snapshotsData = await snapshotsRes.json();
      setSnapshots(snapshotsData);

      alert("Snapshot uploaded successfully!");
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleDeleteSnapshot = async (id: string) => {
    if (!confirm("Are you sure you want to delete this snapshot?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/snapshots?id=${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-password": authToken || ""
        }
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to delete snapshot");
      }

      // Reload snapshots list
      const snapshotsRes = await fetch("/api/snapshots");
      const snapshotsData = await snapshotsRes.json();
      setSnapshots(snapshotsData);

      alert("Snapshot deleted successfully!");
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Member management handlers
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.name) {
      alert("Name is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": authToken || ""
        },
        body: JSON.stringify({
          id: memberForm.id || `member-${Date.now()}`,
          name: memberForm.name,
          role: memberForm.role,
          location: memberForm.location,
          bio: memberForm.bio,
          image: memberImage,
          g1: memberForm.g1,
          g2: memberForm.g2
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to save member");
      }

      // Reset form
      setMemberForm({
        id: "",
        name: "",
        role: "Member",
        location: "",
        bio: "",
        g1: "#d9a48a",
        g2: "#b8533a"
      });
      setMemberImage(null);
      const fileInput = document.getElementById("memberFileInput") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      // Reload team data
      const teamRes = await fetch("/api/team");
      const teamData = await teamRes.json();
      setTeam(teamData);

      alert("Member saved successfully!");
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleEditMember = (m: any) => {
    setMemberForm({
      id: m.id,
      name: m.name || "",
      role: m.role || "Member",
      location: m.location || "",
      bio: m.bio || "",
      g1: m.g1 || "#d9a48a",
      g2: m.g2 || "#b8533a"
    });
    setMemberImage(m.image || null);
    
    // Smoothly scroll to the form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Team management handlers
  const handleSaveTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamForm.name) {
      alert("Name is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": authToken || ""
        },
        body: JSON.stringify({
          id: teamForm.id || `member-${Date.now()}`,
          name: teamForm.name,
          role: teamForm.role,
          location: teamForm.location,
          bio: teamForm.bio,
          image: teamImage,
          g1: teamForm.g1,
          g2: teamForm.g2
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to save team member");
      }

      // Reset form
      setTeamForm({
        id: "",
        name: "",
        role: "",
        location: "",
        bio: "",
        g1: "#d9a48a",
        g2: "#b8533a"
      });
      setTeamImage(null);
      const fileInput = document.getElementById("teamFileInput") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      // Reload team data
      const teamRes = await fetch("/api/team");
      const teamData = await teamRes.json();
      setTeam(teamData);

      alert("Team member saved successfully!");
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTeamMember = (member: any) => {
    setTeamForm({
      id: member.id,
      name: member.name || "",
      role: member.role || "",
      location: member.location || "",
      bio: member.bio || "",
      g1: member.g1 || "#d9a48a",
      g2: member.g2 || "#b8533a"
    });
    setTeamImage(member.image || null);
    
    // Smoothly scroll to the form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteTeamMember = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/team?id=${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-password": authToken || ""
        }
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to delete team member");
      }

      // Reload team data
      const teamRes = await fetch("/api/team");
      const teamData = await teamRes.json();
      setTeam(teamData);

      alert("Team member deleted successfully!");
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRsvpAction = async (rsvpId: string, action: "approve" | "decline") => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/rsvps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": authToken || ""
        },
        body: JSON.stringify({ rsvpId, action })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || `Failed to ${action} request`);
      }

      // Reload RSVPs list
      const rsvpsRes = await fetch("/api/admin/rsvps", {
        headers: { "x-admin-password": authToken || "" }
      });
      const rsvpsData = await rsvpsRes.json();
      setAdminRsvps(rsvpsData);

      alert(`Request has been successfully ${action === "approve" ? "approved" : "declined"}.`);
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
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
        body: JSON.stringify({
          ...eventForm,
          bringOptions: eventForm.bringOptions.split("\n").map((option) => option.trim()).filter(Boolean)
        })
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
        time: "",
        bringOptions: ""
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

  const handleUpdateBringOptions = async (event: any) => {
    if (!authToken) return;
    const value = prompt(
      "Enter what guests can bring, separated by commas. Leave empty to remove the list.",
      (event.bringOptions || []).join(", ")
    );
    if (value === null) return;

    try {
      const bringOptions = value.split(",").map((option) => option.trim()).filter(Boolean);
      const res = await fetch("/api/events", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": authToken
        },
        body: JSON.stringify({ title: event.title, bringOptions })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update bring list");

      const freshRes = await fetch("/api/events");
      setEvents(await freshRes.json());
    } catch (err: any) {
      alert(err.message);
    }
  };

  // File upload handler for new gallery card creation
  const handleGalleryImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const loadedImages: string[] = [];
    let processedCount = 0;

    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          loadedImages.push(reader.result);
        }
        processedCount++;
        if (processedCount === files.length) {
          setGalleryImages((prev) => [...prev, ...loadedImages]);
        }
      };
      reader.readAsDataURL(files[i]);
    }
  };

  const handleGalleryCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setGalleryCoverPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Add Gallery handler
  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;
    if (!galleryCoverPhoto) {
      alert("Please select a cover photo.");
      return;
    }

    try {
      const payload = {
        ...galleryForm,
        coverPhoto: galleryCoverPhoto,
        images: galleryImages,
        photos: galleryForm.photos || `${galleryImages.length} photo${galleryImages.length !== 1 ? "s" : ""}`
      };

      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": authToken
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add gallery item");
      }

      alert("Gallery item saved successfully!");
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
      setGalleryCoverPhoto(null);
      setGalleryImages([]);
      
      // Refresh list
      const freshRes = await fetch("/api/gallery");
      setGallery(await freshRes.json());
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Remove individual photo from an existing gallery card
  const handleRemoveImageFromGallery = async (galleryItem: any, imageIndexToRemove: number) => {
    if (!authToken) return;
    try {
      const updatedImages = (galleryItem.images || []).filter((_: any, idx: number) => idx !== imageIndexToRemove);
      
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": authToken
        },
        body: JSON.stringify({
          ...galleryItem,
          images: updatedImages,
          photos: `${updatedImages.length} photo${updatedImages.length !== 1 ? "s" : ""}`
        })
      });

      if (!res.ok) {
        throw new Error("Failed to remove image");
      }

      // Reload gallery list
      const freshRes = await fetch("/api/gallery");
      setGallery(await freshRes.json());
    } catch (err: any) {
      alert(err.message || "Failed to update album images");
    }
  };

  // Add multiple photos to an existing gallery card
  const handleAddImagesToExistingGallery = async (galleryItem: any, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !authToken) return;

    try {
      const readFilePromises = Array.from(files).map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === "string") {
              resolve(reader.result);
            }
          };
          reader.readAsDataURL(file);
        });
      });

      const newBase64Images = await Promise.all(readFilePromises);
      const updatedImages = [...(galleryItem.images || []), ...newBase64Images];

      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": authToken
        },
        body: JSON.stringify({
          ...galleryItem,
          images: updatedImages,
          photos: `${updatedImages.length} photo${updatedImages.length !== 1 ? "s" : ""}`
        })
      });

      if (!res.ok) {
        throw new Error("Failed to add images");
      }

      // Reload gallery list
      const freshRes = await fetch("/api/gallery");
      setGallery(await freshRes.json());
    } catch (err: any) {
      alert(err.message || "Failed to add images to album");
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

  // Process Submission Action handler (Approve/Decline)
  const handleSubmissionAction = async (submissionId: string, action: "approve" | "decline") => {
    const actionLabel = action === "approve" ? "approve" : "reject";
    if (!authToken || !confirm(`Are you sure you want to ${actionLabel} this request?`)) return;

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": authToken
        },
        body: JSON.stringify({ submissionId, action })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Failed to ${action} submission`);
      }

      alert(`Request successfully ${action === "approve" ? "approved" : "rejected"}!`);

      // Refresh list
      const freshRes = await fetch("/api/submissions", {
        headers: { "x-admin-password": authToken }
      });
      setSubmissions(await freshRes.json());
      
      // Also refresh team if approved!
      if (action === "approve") {
        const freshTeamRes = await fetch("/api/team");
        setTeam(await freshTeamRes.json());
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAssignBuddy = async (submissionId: string) => {
    const buddySubmissionId = buddySelections[submissionId];
    if (!authToken || !buddySubmissionId) {
      alert("Please select an available buddy.");
      return;
    }
    if (!confirm("Assign this buddy to the request?")) return;

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": authToken
        },
        body: JSON.stringify({ submissionId, action: "assign", buddySubmissionId })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to assign buddy");
      }

      alert("Buddy assigned successfully!");
      const freshRes = await fetch("/api/submissions", {
        headers: { "x-admin-password": authToken }
      });
      setSubmissions(await freshRes.json());
      setBuddySelections((current) => {
        const next = { ...current };
        delete next[submissionId];
        return next;
      });
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

  const requestTabTitle = requestSubTab === "members"
    ? "Member Requests & Logs"
    : requestSubTab === "buddy"
      ? "Buddy Requests"
      : "Requests & Logs";
  const visibleSubmissions = submissions.filter((submission) => {
    if (requestSubTab === "members") return submission.formType === "register";
    if (requestSubTab === "buddy") {
      return submission.formType === "become-buddy" || submission.formType === "request-buddy";
    }
    return !["register", "become-buddy", "request-buddy"].includes(submission.formType);
  });
  const assignedBuddyIds = new Set(
    submissions
      .filter((submission) => submission.formType === "request-buddy" && submission.status === "assigned")
      .map((submission) => submission.assignedBuddyId)
      .filter(Boolean)
  );
  const availableBuddies = submissions.filter(
    (submission) => submission.formType === "become-buddy"
      && submission.status === "approved"
      && !assignedBuddyIds.has(submission.id)
  );

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
      <div className="admin-container">
        
        {/* Navigation Sidebar */}
        <aside className="admin-sidebar">
          <h2 style={{
            fontSize: "11px",
            color: "rgba(246, 239, 228, 0.3)",
            textTransform: "uppercase",
            letterSpacing: "2px",
            marginBottom: "12px",
            paddingLeft: "12px",
            fontWeight: "bold"
          }}>
            Dashboard Menu
          </h2>
          {[
            { id: "requests", label: "Requests", icon: "📥" },
            { id: "calendar", label: "Add New Gatherings", icon: "📅" },
            { id: "gallery", label: "Manage Gallery", icon: "🖼️" },
            { id: "recognition", label: "Buddy Recognitions", icon: "🤝" },
            { id: "snapshots", label: "Gathering Snapshots", icon: "📸" },
            { id: "team", label: "Meet Our Team", icon: "👥" },
            { id: "members", label: "Members", icon: "❤️" }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  backgroundColor: isActive ? "rgba(199, 154, 75, 0.1)" : "transparent",
                  border: "none",
                  borderRadius: "6px",
                  color: isActive ? "var(--gold, #c79a4b)" : "rgba(246, 239, 228, 0.7)",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: isActive ? "500" : "normal",
                  textAlign: "left",
                  transition: "all 0.2s"
                }}
              >
                <span style={{ fontSize: "16px", opacity: isActive ? 1 : 0.6 }}>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </aside>

        {/* Tab Content Panels */}
        <div style={{ minWidth: "0" }}>
          {activeTab === "requests" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
              <div>
                <h2 style={{ fontSize: "22px", fontWeight: "normal", margin: 0 }}>Requests</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "20px", borderBottom: "1px solid #2a2a2a", paddingBottom: "12px" }}>
                  {[
                    { id: "general", label: "Requests & Logs" },
                    { id: "members", label: "Member Requests & Logs" },
                    { id: "buddy", label: "Buddy Requests" }
                  ].map((tab) => {
                    const isActive = requestSubTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setRequestSubTab(tab.id as "general" | "members" | "buddy")}
                        style={{
                          padding: "9px 14px",
                          borderRadius: "4px",
                          border: isActive ? "1px solid var(--gold, #c79a4b)" : "1px solid #333",
                          backgroundColor: isActive ? "rgba(199, 154, 75, 0.12)" : "#1c1c1c",
                          color: isActive ? "var(--gold, #c79a4b)" : "rgba(246, 239, 228, 0.65)",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: isActive ? "bold" : "normal"
                        }}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 1: Gatherings RSVPs (Approvable) */}
              {requestSubTab === "general" && (
                <div style={{ backgroundColor: "#1c1c1c", borderRadius: "8px", padding: "32px", border: "1px solid #333" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "normal", marginBottom: "20px", color: "var(--gold, #c79a4b)" }}>Gatherings Seat Requests & RSVPs ({adminRsvps.length})</h3>
                {adminRsvps.length === 0 ? (
                  <p style={{ color: "rgba(246, 239, 228, 0.4)" }}>No seat requests submitted yet.</p>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #333", color: "rgba(246, 239, 228, 0.6)" }}>
                          <th style={{ padding: "12px 16px" }}>Member</th>
                          <th style={{ padding: "12px 16px" }}>WhatsApp</th>
                          <th style={{ padding: "12px 16px" }}>Event</th>
                          <th style={{ padding: "12px 16px" }}>Bringing</th>
                          <th style={{ padding: "12px 16px" }}>Submitted At</th>
                          <th style={{ padding: "12px 16px" }}>Status</th>
                          <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminRsvps.map((r) => {
                          let statusColor = "rgba(246, 239, 228, 0.6)";
                          if (r.status === "approved") statusColor = "#c79a4b";
                          if (r.status === "declined") statusColor = "#8f3d29";

                          return (
                            <tr key={r.id} style={{ borderBottom: "1px solid #222" }}>
                              <td style={{ padding: "16px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                  <img src={r.userPicture} alt="" style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid #444" }} />
                                  <div>
                                    <div style={{ fontWeight: "500", color: "var(--cream)" }}>{r.userName}</div>
                                    <div style={{ fontSize: "12px", color: "rgba(246, 239, 228, 0.4)" }}>{r.userEmail}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: "16px" }}>
                                {r.whatsapp ? (
                                  <a 
                                    href={`https://wa.me/${(() => {
                                      let clean = r.whatsapp.replace(/\D/g, "");
                                      if (clean.startsWith("05") && clean.length === 10) {
                                        clean = "971" + clean.substring(1);
                                      } else if (clean.startsWith("5") && clean.length === 9) {
                                        clean = "971" + clean;
                                      }
                                      return clean;
                                    })()}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "#4ade80", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
                                  >
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ flexShrink: 0 }}>
                                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.835-4.322c1.644.976 3.254 1.486 4.93 1.487 5.389 0 9.772-4.343 9.776-9.686.002-2.585-1.002-5.016-2.831-6.848C16.938 2.799 14.511 1.794 12.01 1.794 6.617 1.794 2.23 6.136 2.227 11.48c-.001 1.722.463 3.4 1.345 4.9l-.994 3.63 3.734-.972.58.344zm11.237-7.279c-.3-.15-1.772-.875-2.046-.975-.276-.1-.476-.15-.676.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-.3-.15-1.265-.467-2.41-1.485-.89-.792-1.492-1.77-1.667-2.07-.175-.3-.018-.462.13-.61.135-.133.3-.35.45-.525.15-.175.2-.3.3-.5s.05-.375-.025-.525-.675-1.625-.925-2.225c-.244-.589-.491-.51-.676-.51-.175-.008-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.115 3.23 5.125 4.53.716.31 1.273.494 1.708.633.72.228 1.375.196 1.892.118.577-.087 1.772-.725 2.022-1.425.25-.7.25-1.3 0-1.425-.075-.125-.275-.2-.575-.35z" />
                                    </svg>
                                    <span style={{ borderBottom: "1px solid transparent" }} onMouseEnter={(e) => e.currentTarget.style.borderBottom = "1px solid #4ade80"} onMouseLeave={(e) => e.currentTarget.style.borderBottom = "1px solid transparent"}>{r.whatsapp}</span>
                                  </a>
                                ) : (
                                  <span style={{ color: "rgba(246, 239, 228, 0.3)" }}>—</span>
                                )}
                              </td>
                              <td style={{ padding: "16px" }}>
                                <div style={{ fontWeight: "500", color: "var(--cream)", marginBottom: "4px" }}>{r.eventTitle}</div>
                                {(r.eventHost || r.eventLocation || r.eventTime) && (
                                  <div style={{ fontSize: "11px", color: "rgba(246, 239, 228, 0.45)", display: "flex", flexDirection: "column", gap: "2px" }}>
                                    {r.eventHost && <span>Host: {r.eventHost}</span>}
                                    {r.eventLocation && <span>Loc: {r.eventLocation}</span>}
                                    {(r.eventMonthFull || r.eventTime) && (
                                      <span style={{ color: "var(--gold, #c79a4b)" }}>
                                        {r.eventMonthFull} {r.eventDay} {r.eventTime ? `· ${r.eventTime}` : ""}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: "16px", color: "rgba(246, 239, 228, 0.7)", fontSize: "12px" }}>
                                {r.bringItems?.length ? r.bringItems.join(", ") : "—"}
                              </td>
                              <td style={{ padding: "16px", color: "rgba(246, 239, 228, 0.6)" }}>{new Date(r.submittedAt).toLocaleDateString()}</td>
                              <td style={{ padding: "16px", color: statusColor, textTransform: "capitalize", fontWeight: "bold" }}>{r.status}</td>
                              <td style={{ padding: "16px", textAlign: "right" }}>
                                {r.status === "pending" ? (
                                  <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                    <button
                                      onClick={() => handleRsvpAction(r.id, "approve")}
                                      style={{
                                        padding: "6px 12px",
                                        backgroundColor: "var(--gold, #c79a4b)",
                                        color: "#121212",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                        fontWeight: "bold"
                                      }}
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleRsvpAction(r.id, "decline")}
                                      style={{
                                        padding: "6px 12px",
                                        backgroundColor: "#8f3d29",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        fontSize: "12px"
                                      }}
                                    >
                                      Decline
                                    </button>
                                  </div>
                                ) : (
                                  <span style={{
                                    fontSize: "11px",
                                    color: r.status === "approved" ? "var(--gold, #c79a4b)" : "#8f3d29",
                                    fontWeight: "bold",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    border: `1px solid ${r.status === "approved" ? "var(--gold, #c79a4b)" : "#8f3d29"}`,
                                    padding: "4px 10px",
                                    borderRadius: "4px",
                                    backgroundColor: r.status === "approved" ? "rgba(199, 154, 75, 0.05)" : "rgba(143, 61, 41, 0.05)"
                                  }}>
                                    ✓ {r.status === "approved" ? "Approved" : "Declined"}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                </div>
              )}

              {/* Section 2: Form Requests & Logs */}
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "normal", marginBottom: "20px", color: "var(--gold, #c79a4b)" }}>{requestTabTitle} ({visibleSubmissions.length})</h3>
                {visibleSubmissions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px", border: "1px dashed #333", borderRadius: "8px" }}>
                    <p style={{ color: "rgba(246, 239, 228, 0.4)" }}>No {requestTabTitle.toLowerCase()} have been recorded yet.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {visibleSubmissions.map((sub) => {
                      const isRegister = sub.formType === "register";
                      const isVolunteer = sub.formType === "become-buddy";
                      const isBuddyRequest = sub.formType === "request-buddy";
                      const isRsvp = sub.formType === "rsvp";
                      const canReview = isRegister || isVolunteer;
                      
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
                            border: canReview || isBuddyRequest
                              ? (sub.status === "approved" || sub.status === "assigned"
                                ? "1px solid rgba(199, 154, 75, 0.8)" 
                                : sub.status === "declined" 
                                  ? "1px solid rgba(143, 61, 41, 0.6)" 
                                  : "1px solid rgba(199, 154, 75, 0.4)")
                              : isRsvp 
                                ? "1px solid rgba(59, 130, 246, 0.4)" 
                                : "1px solid #333",
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
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
                              <a 
                                href={waUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{
                                  backgroundColor: "#25D366",
                                  color: "white",
                                  textDecoration: "none",
                                  padding: "8px 16px",
                                  borderRadius: "4px",
                                  fontSize: "13px",
                                  fontWeight: "bold",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "8px"
                                }}
                              >
                                WhatsApp Admin Connect
                              </a>
                              {isBuddyRequest && (
                                sub.status === "pending" ? (
                                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: "8px", marginTop: "4px" }}>
                                    <select
                                      aria-label={`Select buddy for ${sub.name}`}
                                      value={buddySelections[sub.id] || ""}
                                      onChange={(e) => setBuddySelections((current) => ({ ...current, [sub.id]: e.target.value }))}
                                      style={{ padding: "7px 10px", minWidth: "190px", backgroundColor: "#222", border: "1px solid #444", borderRadius: "4px", color: "white", fontSize: "12px" }}
                                    >
                                      <option value="">Select available buddy…</option>
                                      {availableBuddies.map((buddy) => (
                                        <option key={buddy.id} value={buddy.id}>
                                          {buddy.name} · {buddy.free || "Flexible"}
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      type="button"
                                      disabled={!buddySelections[sub.id]}
                                      onClick={() => handleAssignBuddy(sub.id)}
                                      style={{ padding: "7px 12px", backgroundColor: "var(--gold, #c79a4b)", color: "#121212", border: "none", borderRadius: "4px", cursor: buddySelections[sub.id] ? "pointer" : "not-allowed", opacity: buddySelections[sub.id] ? 1 : 0.5, fontSize: "12px", fontWeight: "bold" }}
                                    >
                                      Assign Buddy
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSubmissionAction(sub.id, "decline")}
                                      style={{ padding: "7px 12px", backgroundColor: "#8f3d29", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                                    >
                                      Reject
                                    </button>
                                    {availableBuddies.length === 0 && (
                                      <span style={{ width: "100%", color: "rgba(246, 239, 228, 0.45)", fontSize: "11px", textAlign: "right" }}>
                                        No approved buddies are currently available.
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span style={{
                                    fontSize: "11px",
                                    color: sub.status === "assigned" ? "var(--gold, #c79a4b)" : "#8f3d29",
                                    fontWeight: "bold",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    border: `1px solid ${sub.status === "assigned" ? "var(--gold, #c79a4b)" : "#8f3d29"}`,
                                    padding: "4px 10px",
                                    borderRadius: "4px"
                                  }}>
                                    {sub.status === "assigned" ? `✓ Assigned to ${sub.assignedBuddyName}` : "✗ Rejected"}
                                  </span>
                                )
                              )}
                              {canReview && (
                                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                                  {sub.status === "pending" ? (
                                    <>
                                      <button
                                        onClick={() => handleSubmissionAction(sub.id, "approve")}
                                        style={{
                                          padding: "6px 12px",
                                          backgroundColor: "var(--gold, #c79a4b)",
                                          color: "#121212",
                                          border: "none",
                                          borderRadius: "4px",
                                          cursor: "pointer",
                                          fontSize: "12px",
                                          fontWeight: "bold"
                                        }}
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => handleSubmissionAction(sub.id, "decline")}
                                        style={{
                                          padding: "6px 12px",
                                          backgroundColor: "#8f3d29",
                                          color: "white",
                                          border: "none",
                                          borderRadius: "4px",
                                          cursor: "pointer",
                                          fontSize: "12px"
                                        }}
                                      >
                                        Reject
                                      </button>
                                    </>
                                  ) : (
                                    <span style={{
                                      fontSize: "11px",
                                      color: sub.status === "approved" ? "var(--gold, #c79a4b)" : "#8f3d29",
                                      fontWeight: "bold",
                                      textTransform: "uppercase",
                                      letterSpacing: "0.5px",
                                      border: `1px solid ${sub.status === "approved" ? "var(--gold, #c79a4b)" : "#8f3d29"}`,
                                      padding: "4px 10px",
                                      borderRadius: "4px",
                                      backgroundColor: sub.status === "approved" ? "rgba(199, 154, 75, 0.05)" : "rgba(143, 61, 41, 0.05)"
                                    }}>
                                      {sub.status === "approved"
                                        ? (isRegister
                                            ? "✓ Approved & Team Registered"
                                            : assignedBuddyIds.has(sub.id)
                                              ? "✓ Buddy Assigned"
                                              : "✓ Available Buddy")
                                        : "✗ Rejected"}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
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
                            {sub.assignedBuddyName && (
                              <div>
                                <p style={{ margin: "0 0 4px 0", color: "rgba(246, 239, 228, 0.4)" }}>Assigned Buddy</p>
                                <p style={{ margin: 0, fontWeight: "500", color: "var(--gold, #c79a4b)" }}>{sub.assignedBuddyName}</p>
                                {sub.assignedBuddyPhone && <p style={{ margin: "4px 0 0", fontSize: "12px" }}>{sub.assignedBuddyPhone}</p>}
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

                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>
                      What can guests bring? <span style={{ opacity: 0.6 }}>(Optional)</span>
                    </label>
                    <textarea
                      rows={5}
                      placeholder={"Enter one option per line, for example:\nMains & Mezze\nSides & Salads\nDesserts & Sweets\nDrinks"}
                      value={eventForm.bringOptions}
                      onChange={(e) => setEventForm({ ...eventForm, bringOptions: e.target.value })}
                      style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white", resize: "vertical", fontFamily: "inherit", lineHeight: "1.5" }}
                    />
                    <p style={{ margin: "7px 0 0", color: "rgba(246, 239, 228, 0.4)", fontSize: "11px" }}>
                      Guests will select one or more of these options while requesting a seat.
                    </p>
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
                        {event.bringOptions?.length > 0 && (
                          <div style={{ marginTop: "8px", fontSize: "11px", color: "var(--gold, #c79a4b)" }}>
                            Bring options: {event.bringOptions.join(" · ")}
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          onClick={() => handleUpdateBringOptions(event)}
                          style={{ backgroundColor: "transparent", border: "1px solid var(--gold, #c79a4b)", color: "var(--gold, #c79a4b)", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                        >
                          Manage bring list
                        </button>
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
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Photo Count Tag (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 24 photos (auto-generated if empty)"
                      value={galleryForm.photos}
                      onChange={(e) => setGalleryForm({ ...galleryForm, photos: e.target.value })}
                      style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                    />
                  </div>

                  {/* Photo Upload Input */}
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>
                      Cover Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={handleGalleryCoverUpload}
                      style={{ width: "100%", color: "rgba(246, 239, 228, 0.6)", fontSize: "13px" }}
                    />
                    {galleryCoverPhoto && (
                      <div style={{ position: "relative", marginTop: "12px", width: "180px", aspectRatio: "4 / 5" }}>
                        <img
                          src={galleryCoverPhoto}
                          alt="Gallery card cover preview"
                          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "6px", border: "1px solid #444" }}
                        />
                        <button
                          type="button"
                          onClick={() => setGalleryCoverPhoto(null)}
                          aria-label="Remove cover photo"
                          style={{ position: "absolute", top: "8px", right: "8px", backgroundColor: "rgba(0, 0, 0, 0.75)", color: "white", border: "none", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer" }}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>
                      Upload Album Photos
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleGalleryImagesUpload}
                      style={{ width: "100%", color: "rgba(246, 239, 228, 0.6)", fontSize: "13px" }}
                    />
                  </div>

                  {galleryImages.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                      <span style={{ display: "block", fontSize: "12px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "8px" }}>
                        Selected Photos ({galleryImages.length})
                      </span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {galleryImages.map((img, idx) => (
                          <div key={idx} style={{ position: "relative", width: "50px", height: "50px" }}>
                            <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "4px", border: "1px solid #444" }} />
                            <button
                              type="button"
                              onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== idx))}
                              style={{
                                position: "absolute",
                                top: "-4px",
                                right: "-4px",
                                backgroundColor: "#ef4444",
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: "16px",
                                height: "16px",
                                fontSize: "9px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: 0
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {gallery.map((item) => (
                    <div 
                      key={item.title}
                      style={{
                        backgroundColor: "#1c1c1c",
                        border: "1px solid #282828",
                        borderRadius: "8px",
                        padding: "24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                          Delete Album
                        </button>
                      </div>

                      {/* Photo Gallery Grid */}
                      <div style={{ borderTop: "1px solid #222", paddingTop: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <span style={{ fontSize: "12px", color: "rgba(246, 239, 228, 0.6)" }}>
                            Photos ({item.images ? item.images.length : 0})
                          </span>
                          <label style={{
                            padding: "6px 12px",
                            backgroundColor: "#2a2a2a",
                            color: "var(--gold, #c79a4b)",
                            border: "1px solid rgba(199, 154, 75, 0.3)",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px"
                          }}>
                            + Add Photos
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={(e) => handleAddImagesToExistingGallery(item, e)}
                            />
                          </label>
                        </div>

                        {(!item.images || item.images.length === 0) ? (
                          <p style={{ color: "rgba(246, 239, 228, 0.3)", fontSize: "12px", margin: "10px 0" }}>No photos uploaded yet.</p>
                        ) : (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {item.images.map((img: string, imgIdx: number) => (
                              <div key={imgIdx} style={{ position: "relative", width: "60px", height: "60px" }}>
                                <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "4px", border: "1px solid #333" }} />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImageFromGallery(item, imgIdx)}
                                  style={{
                                    position: "absolute",
                                    top: "-4px",
                                    right: "-4px",
                                    backgroundColor: "rgba(0,0,0,0.8)",
                                    color: "#ef4444",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: "16px",
                                    height: "16px",
                                    fontSize: "8px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                  }}
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
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

          {/* 5. Snapshots Tab */}
          {activeTab === "snapshots" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "40px", marginBottom: "40px" }}>
              
              {/* Add Snapshot Form */}
              <div style={{ backgroundColor: "#1c1c1c", borderRadius: "8px", padding: "32px", border: "1px solid #333" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "normal", marginBottom: "20px", color: "var(--gold, #c79a4b)" }}>Upload Gathering Snapshot</h3>
                <form onSubmit={handleAddSnapshot}>
                  
                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Select Photo</label>
                    <input
                      id="snapshotFileInput"
                      type="file"
                      accept="image/*"
                      multiple
                      required
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setSelectedFiles(Array.from(e.target.files));
                        }
                      }}
                      style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                    />
                    <span style={{ display: "block", fontSize: "11px", color: "rgba(246, 239, 228, 0.4)", marginTop: "6px" }}>Choose a snapshot from your gatherings to display on the homepage strip.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={uploading}
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
                    {uploading ? "Uploading Image..." : "Upload Snapshot"}
                  </button>
                </form>
              </div>

              {/* Manage Snapshots List */}
              <div style={{ backgroundColor: "#1c1c1c", borderRadius: "8px", padding: "32px", border: "1px solid #333" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "normal", marginBottom: "20px", color: "var(--gold, #c79a4b)" }}>Current Snapshots ({snapshots.filter(s => s.imageUrl).length})</h3>
                {snapshots.filter(s => s.imageUrl).length === 0 ? (
                  <p style={{ color: "rgba(246, 239, 228, 0.4)" }}>No snapshots uploaded yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "600px", overflowY: "auto", paddingRight: "8px" }}>
                    {snapshots
                      .filter(s => s.imageUrl)
                      .map((s) => (
                        <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <img src={s.imageUrl} alt="" style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px", border: "1px solid #444" }} />
                            <div>
                              <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "normal" }}>{s.imageUrl.split("/").pop()}</h4>
                              <span style={{ fontSize: "11px", color: "rgba(246, 239, 228, 0.4)" }}>Uploaded snapshot</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteSnapshot(s.id)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#8f3d29",
                              color: "white",
                              border: "none",
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
                )}
              </div>

            </div>
          )}

          {/* 6. Meet Our Team Tab */}
          {activeTab === "team" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "40px", marginBottom: "40px" }}>
              
              {/* Add/Edit Team Member Form */}
              <div style={{ backgroundColor: "#1c1c1c", borderRadius: "8px", padding: "32px", border: "1px solid #333" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "normal", marginBottom: "20px", color: "var(--gold, #c79a4b)" }}>
                  {teamForm.id ? "Edit Team Member" : "Add Team Member"}
                </h3>
                <form onSubmit={handleSaveTeamMember}>
                  
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Name</label>
                    <input
                      type="text"
                      required
                      value={teamForm.name}
                      onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                      style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                      placeholder="e.g. Linda"
                    />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Role</label>
                    <input
                      type="text"
                      value={teamForm.role}
                      onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value })}
                      style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                      placeholder="e.g. ~ Book Club Host ~"
                    />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Location</label>
                    <input
                      type="text"
                      value={teamForm.location}
                      onChange={(e) => setTeamForm({ ...teamForm, location: e.target.value })}
                      style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                      placeholder="e.g. Mirador · 42"
                    />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Bio</label>
                    <textarea
                      rows={3}
                      value={teamForm.bio}
                      onChange={(e) => setTeamForm({ ...teamForm, bio: e.target.value })}
                      style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white", resize: "vertical" }}
                      placeholder="Avid reader who loves sharing stories..."
                    />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Profile Photo</label>
                    <input
                      id="teamFileInput"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.readAsDataURL(file);
                          reader.onload = () => {
                            setTeamImage(reader.result as string);
                          };
                        }
                      }}
                      style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                    />
                    {teamImage && (
                      <div style={{ marginTop: "10px", position: "relative", width: "80px", height: "80px" }}>
                        <img src={teamImage} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", border: "2px solid var(--gold)" }} />
                        <button
                          type="button"
                          onClick={() => {
                            setTeamImage(null);
                            const fileInput = document.getElementById("teamFileInput") as HTMLInputElement;
                            if (fileInput) fileInput.value = "";
                          }}
                          style={{ position: "absolute", top: "-5px", right: "-5px", backgroundColor: "#8f3d29", color: "white", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          &times;
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Border Color 1</label>
                      <select
                        value={teamForm.g1}
                        onChange={(e) => setTeamForm({ ...teamForm, g1: e.target.value })}
                        style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                      >
                        <option value="#d9a48a">Terracotta Light (#d9a48a)</option>
                        <option value="#b8533a">Terracotta (#b8533a)</option>
                        <option value="#8f3d29">Terracotta Deep (#8f3d29)</option>
                        <option value="#c79a4b">Gold (#c79a4b)</option>
                        <option value="#6b6b3a">Olive Green (#6b6b3a)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Border Color 2</label>
                      <select
                        value={teamForm.g2}
                        onChange={(e) => setTeamForm({ ...teamForm, g2: e.target.value })}
                        style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                      >
                        <option value="#b8533a">Terracotta (#b8533a)</option>
                        <option value="#d9a48a">Terracotta Light (#d9a48a)</option>
                        <option value="#8f3d29">Terracotta Deep (#8f3d29)</option>
                        <option value="#c79a4b">Gold (#c79a4b)</option>
                        <option value="#6b6b3a">Olive Green (#6b6b3a)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="submit"
                      style={{
                        flex: 1,
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
                      {teamForm.id ? "Update Member" : "Add Member"}
                    </button>
                    {teamForm.id && (
                      <button
                        type="button"
                        onClick={() => {
                          setTeamForm({
                            id: "",
                            name: "",
                            role: "",
                            location: "",
                            bio: "",
                            g1: "#d9a48a",
                            g2: "#b8533a"
                          });
                          setTeamImage(null);
                          const fileInput = document.getElementById("teamFileInput") as HTMLInputElement;
                          if (fileInput) fileInput.value = "";
                        }}
                        style={{
                          padding: "12px 20px",
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
                    )}
                  </div>
                </form>
              </div>

              {/* Manage Team Members Grid */}
              <div style={{ backgroundColor: "#1c1c1c", borderRadius: "8px", padding: "32px", border: "1px solid #333" }}>
                {(() => {
                  const teamHosts = team.filter((m) => m.role !== "Member");
                  return (
                    <>
                      <h3 style={{ fontSize: "18px", fontWeight: "normal", marginBottom: "20px", color: "var(--gold, #c79a4b)" }}>Current Team Members ({teamHosts.length})</h3>
                      {teamHosts.length === 0 ? (
                        <p style={{ color: "rgba(246, 239, 228, 0.4)" }}>No team members found.</p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "600px", overflowY: "auto", paddingRight: "8px" }}>
                          {teamHosts.map((m) => (
                            <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                {m.image ? (
                                  <img src={m.image} alt={m.name} style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "50%", border: "2px solid var(--gold)" }} />
                                ) : (
                                  <div style={{ width: "50px", height: "50px", borderRadius: "50%", backgroundColor: "var(--gold)", color: "black", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                                    {m.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "normal" }}>{m.name}</h4>
                                  <span style={{ fontSize: "11px", color: "rgba(246, 239, 228, 0.4)" }}>{m.role || "Volunteer"} · {m.location}</span>
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                  onClick={() => handleEditTeamMember(m)}
                                  style={{
                                    padding: "6px 12px",
                                    backgroundColor: "#333",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "12px"
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteTeamMember(m.id)}
                                  style={{
                                    padding: "6px 12px",
                                    backgroundColor: "#8f3d29",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "12px"
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

            </div>
          )}

          {/* Members Tab */}
          {activeTab === "members" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "40px", marginBottom: "40px" }}>
              
              {/* Add/Edit Member Form */}
              <div style={{ backgroundColor: "#1c1c1c", borderRadius: "8px", padding: "32px", border: "1px solid #333" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "normal", marginBottom: "20px", color: "var(--gold, #c79a4b)" }}>
                  {memberForm.id ? "Edit Member" : "Add Member"}
                </h3>
                <form onSubmit={handleSaveMember}>
                  
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Name</label>
                    <input
                      type="text"
                      required
                      value={memberForm.name}
                      onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                      style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                      placeholder="e.g. Layla Hassan"
                    />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Role</label>
                    <input
                      type="text"
                      value={memberForm.role}
                      onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                      style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                      placeholder="e.g. Member"
                    />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Location</label>
                    <input
                      type="text"
                      value={memberForm.location}
                      onChange={(e) => setMemberForm({ ...memberForm, location: e.target.value })}
                      style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                      placeholder="e.g. Palmera"
                    />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Bio</label>
                    <textarea
                      rows={3}
                      value={memberForm.bio}
                      onChange={(e) => setMemberForm({ ...memberForm, bio: e.target.value })}
                      style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white", resize: "vertical" }}
                      placeholder="Layla is a member of the community..."
                    />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Profile Photo</label>
                    <input
                      id="memberFileInput"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.readAsDataURL(file);
                          reader.onload = () => {
                            setMemberImage(reader.result as string);
                          };
                        }
                      }}
                      style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                    />
                    {memberImage && (
                      <div style={{ marginTop: "10px", position: "relative", width: "80px", height: "80px" }}>
                        <img src={memberImage} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", border: "2px solid var(--gold)" }} />
                        <button
                          type="button"
                          onClick={() => {
                            setMemberImage(null);
                            const fileInput = document.getElementById("memberFileInput") as HTMLInputElement;
                            if (fileInput) fileInput.value = "";
                          }}
                          style={{ position: "absolute", top: "-5px", right: "-5px", backgroundColor: "#8f3d29", color: "white", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          &times;
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Border Color 1</label>
                      <select
                        value={memberForm.g1}
                        onChange={(e) => setMemberForm({ ...memberForm, g1: e.target.value })}
                        style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                      >
                        <option value="#d9a48a">Terracotta Light (#d9a48a)</option>
                        <option value="#b8533a">Terracotta (#b8533a)</option>
                        <option value="#8f3d29">Terracotta Deep (#8f3d29)</option>
                        <option value="#c79a4b">Gold (#c79a4b)</option>
                        <option value="#6b6b3a">Olive Green (#6b6b3a)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "rgba(246, 239, 228, 0.6)", marginBottom: "6px" }}>Border Color 2</label>
                      <select
                        value={memberForm.g2}
                        onChange={(e) => setMemberForm({ ...memberForm, g2: e.target.value })}
                        style={{ width: "100%", padding: "10px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px", color: "white" }}
                      >
                        <option value="#b8533a">Terracotta (#b8533a)</option>
                        <option value="#d9a48a">Terracotta Light (#d9a48a)</option>
                        <option value="#8f3d29">Terracotta Deep (#8f3d29)</option>
                        <option value="#c79a4b">Gold (#c79a4b)</option>
                        <option value="#6b6b3a">Olive Green (#6b6b3a)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="submit"
                      style={{
                        flex: 1,
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
                      {memberForm.id ? "Update Member" : "Add Member"}
                    </button>
                    {memberForm.id && (
                      <button
                        type="button"
                        onClick={() => {
                          setMemberForm({
                            id: "",
                            name: "",
                            role: "Member",
                            location: "",
                            bio: "",
                            g1: "#d9a48a",
                            g2: "#b8533a"
                          });
                          setMemberImage(null);
                          const fileInput = document.getElementById("memberFileInput") as HTMLInputElement;
                          if (fileInput) fileInput.value = "";
                        }}
                        style={{
                          padding: "12px 20px",
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
                    )}
                  </div>
                </form>
              </div>

              {/* Manage Members Grid */}
              <div style={{ backgroundColor: "#1c1c1c", borderRadius: "8px", padding: "32px", border: "1px solid #333" }}>
                {(() => {
                  const membersList = team.filter((m) => m.role === "Member");
                  return (
                    <>
                      <h3 style={{ fontSize: "18px", fontWeight: "normal", marginBottom: "20px", color: "var(--gold, #c79a4b)" }}>Current Members ({membersList.length})</h3>
                      {membersList.length === 0 ? (
                        <p style={{ color: "rgba(246, 239, 228, 0.4)" }}>No members found.</p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "600px", overflowY: "auto", paddingRight: "8px" }}>
                          {membersList.map((m) => (
                            <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", backgroundColor: "#222", border: "1px solid #333", borderRadius: "4px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                {m.image ? (
                                  <img src={m.image} alt={m.name} style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "50%", border: "2px solid var(--gold)" }} />
                                ) : (
                                  <div style={{ width: "50px", height: "50px", borderRadius: "50%", backgroundColor: "var(--gold)", color: "black", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                                    {m.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "normal" }}>{m.name}</h4>
                                  <span style={{ fontSize: "11px", color: "rgba(246, 239, 228, 0.4)" }}>{m.role} · {m.location}</span>
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                  onClick={() => handleEditMember(m)}
                                  style={{
                                    padding: "6px 12px",
                                    backgroundColor: "#333",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "12px"
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteTeamMember(m.id)}
                                  style={{
                                    padding: "6px 12px",
                                    backgroundColor: "#8f3d29",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "12px"
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

            </div>
          )}



        </div>
      </div>
    </div>
  );
}
