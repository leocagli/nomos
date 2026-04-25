"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { NPC } from "./NPC";

/* ─────────────────────────────────────────────────────────────────────────────
   Building definitions — each building in the village with its function
   ───────────────────────────────────────────────────────────────────────────── */

interface BuildingOption {
  id: string;
  name: string;
  description: string;
  href: string;
}

interface BuildingZone {
  id: string;
  label: string;
  position: { top: string; left: string; width: string; height: string };
  accentColor: string;
  options: BuildingOption[];
}

const BUILDING_ZONES: BuildingZone[] = [
  {
    // Hongo grande izquierda - agrupa 3 edificios
    id: "left-mushroom",
    label: "Hongo Grande",
    position: { top: "25%", left: "5%", width: "28%", height: "55%" },
    accentColor: "var(--yerba)",
    options: [
      { id: "mission-center", name: "Casa-Hongo Grande", description: "Mission Center", href: "/orchestrate" },
      { id: "workshop", name: "Workshop", description: "Squad tools & forge", href: "/squads/code-forge" },
      { id: "immigration", name: "Oficina Inmigratos", description: "Register & paperwork", href: "/inbox" },
    ],
  },
  {
    // Balanza central - solo marketplace
    id: "marketplace",
    label: "Plaza Central",
    position: { top: "45%", left: "38%", width: "18%", height: "18%" },
    accentColor: "var(--terere)",
    options: [
      { id: "marketplace", name: "Plaza Central", description: "Marketplace", href: "/orchestrate" },
    ],
  },
  {
    // Hongo/arbol atras - Inn solo
    id: "back-inn",
    label: "Inn",
    position: { top: "20%", left: "45%", width: "16%", height: "20%" },
    accentColor: "var(--pink)",
    options: [
      { id: "inn", name: "Inn", description: "Team headquarters", href: "/teams/1" },
    ],
  },
  {
    // Edificio pequeno - Correos solo
    id: "post-office",
    label: "Correos",
    position: { top: "38%", left: "60%", width: "10%", height: "12%" },
    accentColor: "var(--pink)",
    options: [
      { id: "correos", name: "Oficina de Correos", description: "Messages & notifications", href: "/inbox" },
    ],
  },
  {
    // Arbol biblioteca derecha - agrupa 2 edificios
    id: "right-tree",
    label: "Arbol Biblioteca",
    position: { top: "15%", left: "70%", width: "25%", height: "45%" },
    accentColor: "var(--blue)",
    options: [
      { id: "library", name: "Arbol-Biblioteca", description: "Library & Onboarding", href: "/onboarding" },
      { id: "guild-hall", name: "Guild Hall", description: "Register your agent", href: "/register" },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   VillageMap Component
   ───────────────────────────────────────────────────────────────────────────── */

export function VillageMap() {
  const [activeZone, setActiveZone] = useState<string | null>(null);

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

      {/* Building zone hotspots with dropdowns */}
      <div className="village-hotspots">
        {BUILDING_ZONES.map((zone) => (
          <BuildingZoneHotspot
            key={zone.id}
            zone={zone}
            isActive={activeZone === zone.id}
            onActivate={() => setActiveZone(activeZone === zone.id ? null : zone.id)}
            onClose={() => setActiveZone(null)}
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
   BuildingZoneHotspot Component - With dropdown for multiple options
   ───────────────────────────────────────────────────────────────────────────── */

interface BuildingZoneHotspotProps {
  zone: BuildingZone;
  isActive: boolean;
  onActivate: () => void;
  onClose: () => void;
}

function BuildingZoneHotspot({
  zone,
  isActive,
  onActivate,
  onClose,
}: BuildingZoneHotspotProps) {
  const hasMultipleOptions = zone.options.length > 1;
  const singleOption = zone.options[0];

  // Si solo hay una opcion, es un link directo
  if (!hasMultipleOptions) {
    return (
      <Link
        href={singleOption.href}
        className="building-zone"
        style={{
          position: "absolute",
          top: zone.position.top,
          left: zone.position.left,
          width: zone.position.width,
          height: zone.position.height,
          ["--accent" as string]: zone.accentColor,
        }}
        aria-label={`${singleOption.name}: ${singleOption.description}`}
      >
        <div className="zone-glow" />
        <div className="zone-label">
          <span className="label-name">{singleOption.name}</span>
          <span className="label-desc">{singleOption.description}</span>
        </div>
        <style jsx>{`
          .building-zone {
            display: flex;
            align-items: flex-start;
            justify-content: center;
            cursor: pointer;
            border-radius: 16px;
            transition: transform 0.2s ease;
            text-decoration: none;
          }
          .building-zone:hover {
            transform: scale(1.02);
          }
          .zone-glow {
            position: absolute;
            inset: -4px;
            border-radius: 20px;
            background: var(--accent);
            opacity: 0;
            filter: blur(16px);
            transition: opacity 0.3s ease;
            z-index: -1;
          }
          .building-zone:hover .zone-glow {
            opacity: 0.4;
          }
          .zone-label {
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
            box-shadow: inset 0 1px 0 rgba(255,220,140,0.15), 0 3px 8px rgba(0,0,0,0.6);
            white-space: nowrap;
            z-index: 100;
          }
          .zone-label::before {
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
          }
          .label-name {
            font-family: "Gordon Rounded", "Space Grotesk", sans-serif;
            font-size: 0.7rem;
            font-weight: 700;
            color: #f0d9a0;
          }
          .label-desc {
            font-size: 0.6rem;
            color: #a08850;
            font-style: italic;
          }
        `}</style>
      </Link>
    );
  }

  // Si hay multiples opciones, muestra dropdown
  return (
    <div
      className={`building-zone-multi ${isActive ? "active" : ""}`}
      style={{
        position: "absolute",
        top: zone.position.top,
        left: zone.position.left,
        width: zone.position.width,
        height: zone.position.height,
        ["--accent" as string]: zone.accentColor,
      }}
    >
      <button
        className="zone-trigger"
        onClick={onActivate}
        aria-expanded={isActive}
        aria-label={`${zone.label} - Click to see options`}
      >
        <div className="zone-glow" />
        <div className="zone-label">
          <span className="label-name">{zone.label}</span>
          <span className="label-desc">{zone.options.length} lugares</span>
          <span className="label-arrow">{isActive ? "^" : "v"}</span>
        </div>
      </button>

      {/* Dropdown menu */}
      {isActive && (
        <>
          <div className="dropdown-backdrop" onClick={onClose} />
          <div className="dropdown-menu">
            {zone.options.map((option) => (
              <Link
                key={option.id}
                href={option.href}
                className="dropdown-item"
                onClick={onClose}
              >
                <span className="item-name">{option.name}</span>
                <span className="item-desc">{option.description}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      <style jsx>{`
        .building-zone-multi {
          z-index: 10;
        }
        .building-zone-multi.active {
          z-index: 200;
        }
        .zone-trigger {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          cursor: pointer;
          border-radius: 16px;
          background: transparent;
          border: none;
          transition: transform 0.2s ease;
        }
        .zone-trigger:hover {
          transform: scale(1.02);
        }
        .zone-glow {
          position: absolute;
          inset: -4px;
          border-radius: 20px;
          background: var(--accent);
          opacity: 0;
          filter: blur(16px);
          transition: opacity 0.3s ease;
          z-index: -1;
        }
        .zone-trigger:hover .zone-glow,
        .building-zone-multi.active .zone-glow {
          opacity: 0.5;
        }
        .zone-label {
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
          box-shadow: inset 0 1px 0 rgba(255,220,140,0.15), 0 3px 8px rgba(0,0,0,0.6);
          white-space: nowrap;
          z-index: 100;
        }
        .zone-label::before {
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
        }
        .label-name {
          font-family: "Gordon Rounded", "Space Grotesk", sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          color: #f0d9a0;
        }
        .label-desc {
          font-size: 0.6rem;
          color: #a08850;
          font-style: italic;
        }
        .label-arrow {
          font-size: 0.6rem;
          color: #f0d9a0;
          margin-top: 2px;
        }
        .dropdown-backdrop {
          position: fixed;
          inset: 0;
          z-index: 150;
        }
        .dropdown-menu {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 8px;
          background: #1f1a0f;
          border: 2px solid #6b4c1e;
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.8), 0 0 20px rgba(107,76,30,0.3);
          z-index: 200;
          min-width: 180px;
          animation: dropdown-in 0.15s ease-out;
        }
        @keyframes dropdown-in {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        .dropdown-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 10px 12px;
          background: #2a1f0f;
          border: 1px solid #4a3508;
          border-radius: 4px;
          text-decoration: none;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .dropdown-item:hover {
          background: #3a2f1a;
          border-color: #8b6914;
        }
        .item-name {
          font-family: "Gordon Rounded", "Space Grotesk", sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          color: #f0d9a0;
        }
        .item-desc {
          font-size: 0.65rem;
          color: #a08850;
          font-style: italic;
        }
      `}</style>
    </div>
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


