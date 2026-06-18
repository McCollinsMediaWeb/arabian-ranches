import React from "react";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { SnapshotStrip } from "@/components/SnapshotStrip";
import { About } from "@/components/About";
import { Team } from "@/components/Team";
import { Register } from "@/components/Register";
import { Events } from "@/components/Events";
import { Gallery } from "@/components/Gallery";
import { Buddy } from "@/components/Buddy";
import { Recognition } from "@/components/Recognition";
import { Rules } from "@/components/Rules";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <SnapshotStrip />
        <About />
        <Team />
        <Register />
        <Events />
        <Gallery />
        <Buddy />
        <Recognition />
        <Rules />
      </main>
      <Footer />
    </>
  );
}
