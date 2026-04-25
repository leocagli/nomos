"use client";

import React, { useState } from "react";
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
    position: { top: "12%", left: "8%", width: "22%", height: "16%" },
    accentColor: "var(--yerba)",
    options: [
      { id: "mission-center", name: "MISIONES", description: "Mission Center", href: "/orchestrate" },
      { id: "workshop", name: "Workshop", description: "Squad tools & forge", href: "/squads/code-forge" },
      { id: "immigration", name: "REGISTRO", description: "Register & paperwork", href: "/inbox" },
    ],
  },
  {
    // Balanza central
    id: "marketplace",
    label: "Plaza Central",
    position: { top: "52%", left: "42%", width: "16%", height: "14%" },
    accentColor: "var(--terere)",
    options: [
      { id: "marketplace", name: "Plaza Central", description: "Marketplace", href: "/orchestrate" },
    ],
  },
  {
    // Edificio pequeno - Correos
    id: "post-office",
    label: "Correos",
    position: { top: "48%", left: "62%", width: "10%", height: "12%" },
    accentColor: "var(--pink)",
    options: [
      { id: "correos", name: "CORREOS", description: "Messages & notifications", href: "/inbox" },
    ],
  },
  {
    // Inn - al costado del hongo central
    id: "back-inn",
    label: "Inn",
    position: { top: "22%", left: "50%", width: "12%", height: "14%" },
    accentColor: "var(--pink)",
    options: [
      { id: "inn", name: "Inn", description: "Team headquarters", href: "/orchestrate" },
    ],
  },
  {
    // Arbol biblioteca derecha - agrupa 2 edificios
    id: "right-tree",
    label: "Arbol Biblioteca",
    position: { top: "14%", left: "76%", width: "20%", height: "18%" },
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
   ─────����─────────────────────────────────────────────────────────────────────── */

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

  // Margin adjustments for each zone's sign-board
  const signBoardMargins: { [key: string]: { marginTop: string; marginLeft: string; paddingTop?: string } } = {
    "left-mushroom": { marginTop: "1px", marginLeft: "70px" },                        // Hongo Grande
    "marketplace": { marginTop: "115px", marginLeft: "23px" },                        // Plaza Central
    "post-office": { marginTop: "165px", marginLeft: "571px", paddingTop: "12px" },  // Correos
    "back-inn": { marginTop: "-13px", marginLeft: "18px" },                           // Inn
    "right-tree": { marginTop: "-19px", marginLeft: "-93px" },                        // Arbol Biblioteca
  };

  const boardStyle = signBoardMargins[zone.id] || { marginTop: "0", marginLeft: "0" };

  const sharedStyles = `
    /* ── Wrapper posicionado sobre el mapa ── */
    .zone-anchor {
      position: absolute;
      top: zone.position.top;
      left: zone.position.left;
      width: zone.position.width;
      height: zone.position.height;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      pointer-events: none;
    }

    /* ── Cartel colgante — el cartel ES el boton ── */
    .sign-link,
    .sign-button {
      position: relative;
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      text-decoration: none;
      background: none;
      border: none;
      padding: 0;
      pointer-events: all;
      transition: transform 0.15s ease;
    }
    .sign-link:hover,
    .sign-button:hover {
      transform: translateY(-2px);
    }
    .sign-link:active,
    .sign-button:active {
      transform: translateY(1px);
    }

    /* Cuerda */
    .sign-rope {
      width: 2px;
      height: 10px;
      background: #5c3d11;
      border-radius: 1px;
    }

    /* Tabla de madera */
    .sign-board {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      padding: 8px 14px;
      background: #3b2710;
      border: 2px solid #7a541e;
      border-radius: 5px;
      box-shadow:
        inset 0 1px 0 rgba(255,220,140,0.12),
        inset 0 -1px 0 rgba(0,0,0,0.3),
        0 3px 0 #1a0f04,
        0 6px 16px rgba(0,0,0,0.6);
      background-image: repeating-linear-gradient(
        92deg,
        transparent,
        transparent 4px,
        rgba(255,255,255,0.018) 4px,
        rgba(255,255,255,0.018) 8px
      );
      white-space: nowrap;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .sign-link:hover .sign-board,
    .sign-button:hover .sign-board,
    .zone-active .sign-board {
      border-color: #c8953a;
      box-shadow:
        inset 0 1px 0 rgba(255,220,140,0.25),
        inset 0 -1px 0 rgba(0,0,0,0.3),
        0 3px 0 #1a0f04,
        0 8px 24px rgba(0,0,0,0.7),
        0 0 14px rgba(200,149,58,0.3);
    }

    .sign-title {
      font-family: "Gordon Rounded", "Space Grotesk", sans-serif;
      font-size: 0.72rem;
      font-weight: 700;
      color: #f5e0a8;
      letter-spacing: 0.03em;
      line-height: 1.3;
      text-align: center;
    }
    .sign-sub {
      font-size: 0.58rem;
      color: #9a7840;
      font-style: italic;
      text-align: center;
      line-height: 1.2;
    }
    .sign-chevron {
      display: inline-block;
      margin-left: 5px;
      font-size: 0.5rem;
      color: #c8a55a;
      vertical-align: middle;
      transition: transform 0.2s ease;
    }
    .sign-chevron.open {
      transform: rotate(180deg);
    }

    /* ── Dropdown panel ── */
    .dropdown-backdrop {
      position: fixed;
      inset: 0;
      z-index: 150;
    }
    .dropdown-panel {
      position: absolute;
      top: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%);
      z-index: 300;
      display: flex;
      flex-direction: column;
      background: #1c1008;
      border: 2px solid #7a541e;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 12px 40px rgba(0,0,0,0.9), 0 0 20px rgba(120,80,20,0.15);
      animation: panel-in 0.15s ease-out;
      min-width: 190px;
    }
    .panel-header {
      padding: 7px 14px 5px;
      background: #2a1a08;
      border-bottom: 1px solid #3a2410;
    }
    .panel-header-text {
      font-family: "Gordon Rounded", "Space Grotesk", sans-serif;
      font-size: 0.6rem;
      font-weight: 700;
      color: #7a5820;
      text-transform: uppercase;
      letter-spacing: 0.14em;
    }
    @keyframes panel-in {
      from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    .panel-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 11px 14px;
      text-decoration: none;
      border-bottom: 1px solid #2a1a08;
      background: #221508;
      transition: background 0.1s ease;
    }
    .panel-item:last-child { border-bottom: none; }
    .panel-item:hover { background: #331f0d; }
    .panel-item-bar {
      width: 3px;
      height: 28px;
      border-radius: 2px;
      background: #4a3010;
      flex-shrink: 0;
      transition: background 0.1s ease;
    }
    .panel-item:hover .panel-item-bar {
      background: #c8953a;
    }
    .panel-item-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .item-name {
      font-family: "Gordon Rounded", "Space Grotesk", sans-serif;
      font-size: 0.78rem;
      font-weight: 600;
      color: #f0d9a0;
      line-height: 1.2;
    }
    .item-desc {
      font-size: 0.62rem;
      color: #7a5820;
      line-height: 1.2;
    }
  `;

  // Zona con UNA sola opcion: el cartel es un <Link> directo
  if (!hasMultipleOptions) {
    return (
      <div
        style={{
          position: "absolute",
          top: zone.position.top,
          left: zone.position.left,
          width: zone.position.width,
          height: zone.position.height,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          zIndex: 10,
          ["--accent" as string]: zone.accentColor,
        }}
      >
        <Link
          href={singleOption.href}
          className="sign-link"
          aria-label={`${singleOption.name}: ${singleOption.description}`}
        >
          <div className="sign-rope" />
          <div className="sign-board" style={boardStyle}>
            <span className="sign-title">{singleOption.name}</span>
            <span className="sign-sub">{singleOption.description}</span>
          </div>
        </Link>
        <style jsx>{sharedStyles}</style>
      </div>
    );
  }

  // Zona con MULTIPLES opciones: el cartel es un <button> que abre dropdown
  return (
    <div
      className={isActive ? "zone-active" : ""}
      style={{
        position: "absolute",
        top: zone.position.top,
        left: zone.position.left,
        width: zone.position.width,
        height: zone.position.height,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        zIndex: isActive ? 200 : 10,
        ["--accent" as string]: zone.accentColor,
      }}
    >
      <button
        className="sign-button"
        onClick={onActivate}
        aria-expanded={isActive}
        aria-label={`${zone.label} - ver lugares`}
      >
        <div className="sign-rope" />
        <div className="sign-board" style={boardStyle}>
          <span className="sign-title">
            {zone.label}
            <span className={`sign-chevron ${isActive ? "open" : ""}`}>&#9660;</span>
          </span>
          <span className="sign-sub">{zone.options.length} lugares</span>
        </div>

        {isActive && (
          <>
            <div className="dropdown-backdrop" onClick={(e) => { e.stopPropagation(); onClose(); }} />
            <div className="dropdown-panel">
              <div className="panel-header">
                <span className="panel-header-text">{zone.label}</span>
              </div>
              {zone.options.map((option) => (
                <Link
                  key={option.id}
                  href={option.href}
                  className="panel-item"
                  onClick={onClose}
                >
                  <div className="panel-item-bar" />
                  <div className="panel-item-text">
                    <span className="item-name">{option.name}</span>
                    <span className="item-desc">{option.description}</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </button>

      <style jsx>{sharedStyles}</style>
    </div>
  );
}

/* ────────────────────────────────��────────────────────────────────────────────
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


