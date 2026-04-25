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
    // Balanza central - solo marketplace — bajada a la altura de la balanza
    id: "marketplace",
    label: "Plaza Central",
    position: { top: "52%", left: "38%", width: "18%", height: "14%" },
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

  const sharedStyles = `
    /* ── Cartel de madera colgante ── */
    .zone-sign {
      position: absolute;
      top: 6px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: stretch;
      min-width: 130px;
      white-space: nowrap;
      z-index: 100;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.7));
      transition: filter 0.2s ease, transform 0.2s ease;
    }
    /* Cuerda del cartel */
    .zone-sign::before {
      content: "";
      display: block;
      width: 2px;
      height: 10px;
      background: #5c3d11;
      margin: 0 auto;
      border-radius: 1px;
    }
    /* Tabla del cartel */
    .sign-board {
      background: #3b2710;
      border: 2px solid #7a541e;
      border-radius: 5px;
      padding: 7px 12px 6px;
      box-shadow:
        inset 0 1px 0 rgba(255,220,140,0.12),
        inset 0 -1px 0 rgba(0,0,0,0.3),
        0 2px 0 #1a0f04;
      /* Veta de madera */
      background-image: repeating-linear-gradient(
        92deg,
        transparent,
        transparent 4px,
        rgba(255,255,255,0.018) 4px,
        rgba(255,255,255,0.018) 8px
      );
    }
    .sign-title {
      font-family: "Gordon Rounded", "Space Grotesk", sans-serif;
      font-size: 0.72rem;
      font-weight: 700;
      color: #f5e0a8;
      letter-spacing: 0.03em;
      line-height: 1.2;
      text-align: center;
    }
    .sign-sub {
      font-size: 0.58rem;
      color: #9a7840;
      font-style: italic;
      text-align: center;
      margin-top: 2px;
    }
    /* Flecha del dropdown */
    .sign-chevron {
      display: inline-block;
      margin-left: 5px;
      font-size: 0.55rem;
      color: #c8a55a;
      vertical-align: middle;
      transition: transform 0.2s ease;
    }
    .sign-chevron.open {
      transform: rotate(180deg);
    }

    /* ── Zona invisible clicable ── */
    .zone-hit {
      position: absolute;
      inset: 0;
      cursor: pointer;
      border-radius: 12px;
      background: transparent;
      border: none;
      transition: none;
    }
    .zone-glow {
      position: absolute;
      inset: -6px;
      border-radius: 18px;
      background: var(--accent);
      opacity: 0;
      filter: blur(18px);
      transition: opacity 0.25s ease;
      z-index: -1;
      pointer-events: none;
    }
    .zone-hit:hover ~ .zone-sign .sign-board,
    .zone-active .sign-board {
      border-color: #c8953a;
      box-shadow:
        inset 0 1px 0 rgba(255,220,140,0.22),
        inset 0 -1px 0 rgba(0,0,0,0.3),
        0 2px 0 #1a0f04,
        0 0 12px rgba(200,149,58,0.25);
    }
    .zone-hit:hover ~ .zone-glow,
    .zone-active .zone-glow {
      opacity: 0.35;
    }

    /* ── Dropdown panel ── */
    .dropdown-backdrop {
      position: fixed;
      inset: 0;
      z-index: 150;
    }
    .dropdown-panel {
      position: absolute;
      top: calc(100% + 4px);
      left: 50%;
      transform: translateX(-50%);
      z-index: 300;
      display: flex;
      flex-direction: column;
      gap: 0;
      background: #221508;
      border: 2px solid #7a541e;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 12px 40px rgba(0,0,0,0.85), 0 0 24px rgba(120,80,20,0.2);
      animation: panel-in 0.15s ease-out;
      min-width: 180px;
    }
    /* Header del panel */
    .panel-header {
      padding: 8px 14px 6px;
      background: #2e1c0a;
      border-bottom: 1px solid #4a3010;
    }
    .panel-header-text {
      font-family: "Gordon Rounded", "Space Grotesk", sans-serif;
      font-size: 0.65rem;
      font-weight: 700;
      color: #9a7840;
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }
    @keyframes panel-in {
      from { opacity: 0; transform: translateX(-50%) translateY(-4px); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    /* Items del dropdown */
    .panel-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      text-decoration: none;
      border-bottom: 1px solid #2e1c0a;
      transition: background 0.12s ease;
    }
    .panel-item:last-child {
      border-bottom: none;
    }
    .panel-item:hover {
      background: #3a2010;
    }
    .panel-item-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #7a541e;
      flex-shrink: 0;
      transition: background 0.12s ease;
    }
    .panel-item:hover .panel-item-dot {
      background: #c8953a;
    }
    .panel-item-text {
      display: flex;
      flex-direction: column;
      gap: 1px;
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
      color: #9a7840;
    }
  `;

  // Zona con UNA sola opcion: link directo
  if (!hasMultipleOptions) {
    return (
      <div
        className="zone-wrapper"
        style={{
          position: "absolute",
          top: zone.position.top,
          left: zone.position.left,
          width: zone.position.width,
          height: zone.position.height,
          ["--accent" as string]: zone.accentColor,
          zIndex: 10,
        }}
      >
        <Link
          href={singleOption.href}
          className="zone-hit"
          aria-label={`${singleOption.name}: ${singleOption.description}`}
        />
        <div className="zone-glow" />
        <div className="zone-sign">
          <div className="sign-board">
            <span className="sign-title">{singleOption.name}</span>
            <span className="sign-sub">{singleOption.description}</span>
          </div>
        </div>
        <style jsx>{sharedStyles}</style>
      </div>
    );
  }

  // Zona con MULTIPLES opciones: dropdown
  return (
    <div
      className={`zone-wrapper ${isActive ? "zone-active" : ""}`}
      style={{
        position: "absolute",
        top: zone.position.top,
        left: zone.position.left,
        width: zone.position.width,
        height: zone.position.height,
        ["--accent" as string]: zone.accentColor,
        zIndex: isActive ? 200 : 10,
      }}
    >
      <button
        className="zone-hit"
        onClick={onActivate}
        aria-expanded={isActive}
        aria-label={`${zone.label} - ver lugares`}
      />
      <div className="zone-glow" />
      <div className="zone-sign">
        <div className="sign-board">
          <span className="sign-title">
            {zone.label}
            <span className={`sign-chevron ${isActive ? "open" : ""}`}>&#9660;</span>
          </span>
          <span className="sign-sub">{zone.options.length} lugares</span>
        </div>

        {isActive && (
          <>
            <div className="dropdown-backdrop" onClick={onClose} />
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
                  <div className="panel-item-dot" />
                  <div className="panel-item-text">
                    <span className="item-name">{option.name}</span>
                    <span className="item-desc">{option.description}</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      <style jsx>{sharedStyles}</style>
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


