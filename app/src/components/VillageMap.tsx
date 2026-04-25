"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

/* ─────────────────────────────────────────────────────────────────────────────
   Building definitions — each building in the village with its function
   ───────────────────────────────────────────────────────────────────────────── */

interface Building {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  // Position as percentages of the image dimensions
  position: { top: string; left: string; width: string; height: string };
  accentColor: string;
}

const BUILDINGS: Building[] = [
  {
    id: "marketplace",
    name: "Marketplace",
    description: "Browse and hire AI teams for your tasks",
    href: "/orchestrate",
    icon: <ScaleIcon />,
    position: { top: "48%", left: "42%", width: "16%", height: "18%" },
    accentColor: "var(--terere)",
  },
  {
    id: "mission-center",
    name: "Mission Center",
    description: "Create and manage your AI missions",
    href: "/orchestrate",
    icon: <ScrollIcon />,
    position: { top: "28%", left: "8%", width: "18%", height: "28%" },
    accentColor: "var(--yerba)",
  },
  {
    id: "library",
    name: "The Library",
    description: "Learn how to work with AI teams",
    href: "/onboarding",
    icon: <BookIcon />,
    position: { top: "28%", left: "74%", width: "18%", height: "28%" },
    accentColor: "var(--blue)",
  },
  {
    id: "post-office",
    name: "Post Office",
    description: "Check your messages and notifications",
    href: "/inbox",
    icon: <MailIcon />,
    position: { top: "48%", left: "28%", width: "12%", height: "16%" },
    accentColor: "var(--pink)",
  },
  {
    id: "guild-hall",
    name: "Guild Hall",
    description: "Register your agent to join a squad",
    href: "/register",
    icon: <ShieldIcon />,
    position: { top: "48%", left: "60%", width: "12%", height: "16%" },
    accentColor: "var(--yerba)",
  },
  {
    id: "workshop",
    name: "The Workshop",
    description: "Build and customize your AI tools",
    href: "/squads/code-forge",
    icon: <HammerIcon />,
    position: { top: "72%", left: "8%", width: "14%", height: "18%" },
    accentColor: "var(--terere)",
  },
  {
    id: "inn",
    name: "The Inn",
    description: "Rest area for your AI workers",
    href: "/teams/1",
    icon: <HomeIcon />,
    position: { top: "72%", left: "78%", width: "14%", height: "18%" },
    accentColor: "var(--pink)",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   VillageMap Component
   ───────────────────────────────────────────────────────────────────────────── */

export function VillageMap() {
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);

  return (
    <div className="village-map-container">
      {/* Background image */}
      <div className="village-background">
        <Image
          src="/images/village-map.jpg"
          alt="Nomos Village - A magical mushroom forest town"
          fill
          priority
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        
        {/* Ambient overlay for depth */}
        <div className="village-ambient-overlay" />
      </div>

      {/* Building hotspots */}
      <div className="village-hotspots">
        {BUILDINGS.map((building) => (
          <BuildingHotspot
            key={building.id}
            building={building}
            isHovered={hoveredBuilding === building.id}
            onHover={() => setHoveredBuilding(building.id)}
            onLeave={() => setHoveredBuilding(null)}
          />
        ))}
      </div>

      {/* Floating clouds animation */}
      <div className="village-clouds" aria-hidden>
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />
        <div className="cloud cloud-3" />
      </div>

      {/* Bottom HUD with stats */}
      <VillageHUD />

      <style jsx>{`
        .village-map-container {
          position: relative;
          width: 100%;
          height: 100vh;
          min-height: 600px;
          overflow: hidden;
          background: #1a1a1a;
        }

        .village-background {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .village-ambient-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse at center,
            transparent 40%,
            rgba(0, 0, 0, 0.3) 100%
          );
          pointer-events: none;
          z-index: 2;
        }

        .village-hotspots {
          position: absolute;
          inset: 0;
          z-index: 10;
        }

        .village-clouds {
          position: absolute;
          inset: 0;
          z-index: 5;
          pointer-events: none;
          overflow: hidden;
        }

        .cloud {
          position: absolute;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 50%;
          filter: blur(20px);
        }

        .cloud-1 {
          width: 200px;
          height: 60px;
          top: 10%;
          animation: float-cloud 45s linear infinite;
        }

        .cloud-2 {
          width: 150px;
          height: 45px;
          top: 5%;
          animation: float-cloud 60s linear infinite;
          animation-delay: -20s;
        }

        .cloud-3 {
          width: 180px;
          height: 50px;
          top: 15%;
          animation: float-cloud 55s linear infinite;
          animation-delay: -35s;
        }

        @keyframes float-cloud {
          from {
            left: -250px;
          }
          to {
            left: 110%;
          }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   BuildingHotspot Component
   ───────────────────────────────────────────────────────────────────────────── */

interface BuildingHotspotProps {
  building: Building;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}

function BuildingHotspot({
  building,
  isHovered,
  onHover,
  onLeave,
}: BuildingHotspotProps) {
  return (
    <Link
      href={building.href}
      className={`building-hotspot ${isHovered ? "hovered" : ""}`}
      style={{
        position: "absolute",
        top: building.position.top,
        left: building.position.left,
        width: building.position.width,
        height: building.position.height,
        ["--accent" as string]: building.accentColor,
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
      aria-label={`${building.name}: ${building.description}`}
    >
      {/* Hover glow effect */}
      <div className="hotspot-glow" />

      {/* Tooltip */}
      <div className={`building-tooltip ${isHovered ? "visible" : ""}`}>
        <div className="tooltip-icon">{building.icon}</div>
        <div className="tooltip-content">
          <span className="tooltip-name">{building.name}</span>
          <span className="tooltip-desc">{building.description}</span>
        </div>
        <div className="tooltip-arrow" />
      </div>

      {/* Pulse indicator */}
      <div className="hotspot-pulse" />

      <style jsx>{`
        .building-hotspot {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          cursor: pointer;
          border-radius: 16px;
          transition: transform 0.2s ease;
          text-decoration: none;
        }

        .building-hotspot:hover,
        .building-hotspot.hovered {
          transform: scale(1.02);
        }

        .hotspot-glow {
          position: absolute;
          inset: -4px;
          border-radius: 20px;
          background: var(--accent);
          opacity: 0;
          filter: blur(16px);
          transition: opacity 0.3s ease;
          z-index: -1;
        }

        .building-hotspot:hover .hotspot-glow,
        .building-hotspot.hovered .hotspot-glow {
          opacity: 0.4;
        }

        .building-tooltip {
          position: absolute;
          bottom: calc(100% + 12px);
          left: 50%;
          transform: translateX(-50%) translateY(8px);
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: var(--cream);
          border: 2px solid var(--ink);
          border-radius: 14px;
          box-shadow: var(--shadow-neo);
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s ease;
          white-space: nowrap;
          z-index: 100;
        }

        .building-tooltip.visible {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(0);
        }

        .tooltip-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: var(--accent);
          border: 2px solid var(--ink);
          border-radius: 10px;
          color: var(--cream);
          flex-shrink: 0;
        }

        .tooltip-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .tooltip-name {
          font-family: "Gordon Rounded", "Space Grotesk", sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: var(--ink);
        }

        .tooltip-desc {
          font-size: 0.75rem;
          color: var(--text-dim);
        }

        .tooltip-arrow {
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 12px;
          height: 12px;
          background: var(--cream);
          border-right: 2px solid var(--ink);
          border-bottom: 2px solid var(--ink);
        }

        .hotspot-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 20px;
          height: 20px;
          transform: translate(-50%, -50%);
          background: var(--accent);
          border-radius: 50%;
          opacity: 0.6;
          animation: pulse-ring 2.5s ease-out infinite;
        }

        .building-hotspot:hover .hotspot-pulse,
        .building-hotspot.hovered .hotspot-pulse {
          animation: none;
          opacity: 0;
        }

        @keyframes pulse-ring {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0.6;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Village HUD - Bottom status bar
   ───────────────────────────────────────────────────────────────────────────── */

function VillageHUD() {
  return (
    <div className="village-hud">
      <div className="hud-logo">
        <span className="hud-paren">(</span>
        <span className="hud-nomos font-nomos">nomos</span>
        <span className="hud-paren">)</span>
      </div>

      <div className="hud-tagline">
        <span>hire your optimized ai workforce</span>
      </div>

      <div className="hud-actions">
        <Link href="/orchestrate" className="hud-cta">
          Enter Marketplace
        </Link>
      </div>

      <style jsx>{`
        .village-hud {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: linear-gradient(
            to top,
            rgba(31, 31, 30, 0.95) 0%,
            rgba(31, 31, 30, 0.8) 60%,
            transparent 100%
          );
        }

        .hud-logo {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .hud-paren {
          font-family: "Gordon Rounded", "Space Grotesk", sans-serif;
          font-size: 1.5rem;
          color: var(--cream);
          opacity: 0.8;
        }

        .hud-nomos {
          font-size: 2rem;
          color: var(--cream);
        }

        .hud-tagline {
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          color: rgba(255, 246, 237, 0.6);
        }

        .hud-actions {
          display: flex;
          gap: 12px;
        }

        .hud-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: var(--cream);
          color: var(--ink);
          border: 2px solid var(--ink);
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          text-decoration: none;
          box-shadow: var(--shadow-neo-sm);
          transition: transform 0.12s ease, box-shadow 0.12s ease;
        }

        .hud-cta:hover {
          transform: translate(-1px, -1px);
          box-shadow: var(--shadow-neo);
        }

        .hud-cta:active {
          transform: translate(1px, 1px);
          box-shadow: var(--shadow-neo-press);
        }

        @media (max-width: 768px) {
          .village-hud {
            flex-direction: column;
            gap: 12px;
            padding: 20px 16px;
          }

          .hud-tagline {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Icon Components
   ───────────────────────────────────────────────────────────────────────────── */

function ScaleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18" />
      <path d="M4 7l4 6h8l4-6" />
      <path d="M4 7l4-4h8l4 4" />
      <circle cx="4" cy="13" r="2" />
      <circle cx="20" cy="13" r="2" />
    </svg>
  );
}

function ScrollIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
      <path d="M19 17V5a2 2 0 0 0-2-2H4" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <path d="M8 7h6" />
      <path d="M8 11h8" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function HammerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9" />
      <path d="M17.64 15 22 10.64" />
      <path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
