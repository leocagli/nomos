"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { NPC } from "./NPC";

/* ─────────────────────────────────────────────────────────────────────────────
   Building definitions — each building in the village with its function
   ───────────────────────────────────────────────────────────────────────────── */

interface Building {
  id: string;
  name: string;
  description: string;
  href: string;
  position: { top: string; left: string; width: string; height: string };
  accentColor: string;
}

const BUILDINGS: Building[] = [
  {
    id: "marketplace",
    name: "Plaza Central",
    description: "Marketplace",
    href: "/orchestrate",
    position: { top: "38%", left: "40%", width: "20%", height: "18%" },
    accentColor: "var(--terere)",
  },
  {
    id: "mission-center",
    name: "Casa-Hongo Grande",
    description: "Mission Center",
    href: "/orchestrate",
    position: { top: "18%", left: "18%", width: "22%", height: "26%" },
    accentColor: "var(--yerba)",
  },
  {
    id: "library",
    name: "Arbol-Biblioteca",
    description: "Library & Onboarding",
    href: "/onboarding",
    position: { top: "12%", left: "70%", width: "22%", height: "32%" },
    accentColor: "var(--blue)",
  },
  {
    id: "inn",
    name: "Inn",
    description: "Team headquarters",
    href: "/teams/1",
    position: { top: "24%", left: "50%", width: "14%", height: "14%" },
    accentColor: "var(--pink)",
  },
  {
    id: "post-office",
    name: "Oficina de Correos",
    description: "Messages & notifications",
    href: "/inbox",
    position: { top: "38%", left: "62%", width: "8%", height: "10%" },
    accentColor: "var(--pink)",
  },
  {
    id: "workshop",
    name: "Workshop",
    description: "Squad tools & forge",
    href: "/squads/code-forge",
    position: { top: "50%", left: "18%", width: "14%", height: "14%" },
    accentColor: "var(--terere)",
  },
  {
    id: "immigration",
    name: "Oficina Inmigratos",
    description: "Register & paperwork",
    href: "/inbox",
    position: { top: "70%", left: "8%", width: "18%", height: "18%" },
    accentColor: "var(--blue)",
  },
  {
    id: "guild-hall",
    name: "Guild Hall",
    description: "Register your agent",
    href: "/register",
    position: { top: "68%", left: "68%", width: "20%", height: "18%" },
    accentColor: "var(--yerba)",
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

      {/* NPCs scattered around the village */}
      <div className="village-npcs">
        <NPC x={3} y={50} gnomeIndex={0} /> {/* Gardener - Far left path */}
        <NPC x={50} y={62} gnomeIndex={1} /> {/* Warrior - Center bottom */}
        <NPC x={32} y={72} gnomeIndex={2} /> {/* Chef - Bottom path */}
        <NPC x={92} y={55} gnomeIndex={3} /> {/* Wizard - Far right */}
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

        .village-npcs {
          position: absolute;
          inset: 0;
          z-index: 8;
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

      {/* Always visible label */}
      <div className={`building-label ${isHovered ? "hovered" : ""}`}>
        <span className="label-name">{building.name}</span>
        <span className="label-desc">{building.description}</span>
      </div>

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
          opacity: 0.5;
        }

        .building-label {
          position: absolute;
          bottom: calc(100% + 6px);
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
          padding: 6px 10px;
          background: #2a1f0f;
          border: 1.5px solid #6b4c1e;
          border-radius: 4px;
          box-shadow:
            inset 0 1px 0 rgba(255,220,140,0.15),
            0 3px 8px rgba(0,0,0,0.6),
            0 1px 2px rgba(0,0,0,0.4);
          white-space: nowrap;
          z-index: 100;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          /* Wooden plank look: subtle grain via background */
          background-image: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 3px,
            rgba(255,255,255,0.015) 3px,
            rgba(255,255,255,0.015) 6px
          );
        }

        /* Small notch/nail effect on top */
        .building-label::before {
          content: "";
          position: absolute;
          top: -5px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          background: #8b6914;
          border-radius: 50%;
          border: 1px solid #4a3508;
          box-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }

        .building-label.hovered {
          transform: translateX(-50%) translateY(-2px);
          box-shadow:
            inset 0 1px 0 rgba(255,220,140,0.2),
            0 6px 16px rgba(0,0,0,0.7),
            0 2px 4px rgba(0,0,0,0.5);
        }

        .label-name {
          font-family: "Gordon Rounded", "Space Grotesk", sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          color: #f0d9a0;
          letter-spacing: 0.02em;
        }

        .label-desc {
          font-size: 0.6rem;
          color: #a08850;
          font-style: italic;
          letter-spacing: 0.01em;
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


