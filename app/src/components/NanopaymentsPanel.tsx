import { formatUsdc } from "@/lib/pricing";
import type { NanoPayment } from "@/lib/types";

const ARC_EXPLORER = "https://testnet.arcscan.app/tx/";

function shortHash(hash: string | undefined): string {
  if (!hash) return "—";
  if (hash.length < 14) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

export function NanopaymentsPanel({
  payments,
  totalUsdc,
  live,
  walletAddress,
  mockMode,
}: {
  payments: NanoPayment[];
  totalUsdc: number;
  live: boolean;
  walletAddress?: string | null;
  mockMode?: boolean;
}) {
  const settled = payments.filter((p) => p.status !== "failed");
  const avgLatency = settled.length > 0
    ? Math.round(settled.reduce((s, p) => s + p.latency_ms, 0) / settled.length)
    : 0;

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div style={{ height: "3px", background: "linear-gradient(90deg, #2b8eff, #7c4dff)" }} />

      <div
        style={{
          padding: "12px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontSize: "0.625rem",
              textTransform: "uppercase",
              letterSpacing: "0.22em",
              color: "var(--ink)",
              fontWeight: 600,
              background: "var(--blue-soft, #E0EBFF)",
              border: "1.5px solid var(--ink)",
              padding: "3px 9px",
              borderRadius: "999px",
            }}
          >
            ◆ Arc Testnet
          </span>
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)" }}>
            Nanopayments · settled in USDC via Circle Gateway
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {live && (
            <>
              <span
                className="pulse-dot"
                style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2b8eff" }}
              />
              <span
                style={{
                  fontSize: "0.6875rem",
                  color: "#2b8eff",
                  fontFamily: "JetBrains Mono, monospace",
                  fontWeight: 600,
                }}
              >
                streaming
              </span>
            </>
          )}
          {mockMode && (
            <span
              style={{
                fontSize: "0.625rem",
                fontFamily: "JetBrains Mono, monospace",
                fontWeight: 600,
                background: "#F4E0A1",
                color: "var(--ink)",
                padding: "3px 9px",
                borderRadius: "999px",
                border: "1.5px solid var(--ink)",
              }}
              title="ARC_MNEMONIC not configured — emitting synthetic settled payments. Set the env var to issue real x402 calls."
            >
              demo · mocked
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "18px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "12px",
          }}
        >
          <Stat label="Settled" value={`${formatUsdc(totalUsdc)} USDC`} accent="#2b8eff" />
          <Stat label="Calls" value={`${payments.length}`} accent="var(--ink)" />
          <Stat
            label="Avg finality"
            value={avgLatency > 0 ? `${avgLatency} ms` : "—"}
            accent="var(--savings)"
          />
          <Stat
            label="Wallet"
            value={walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : "—"}
            accent="var(--text)"
          />
        </div>

        {payments.length === 0 ? (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              fontSize: "0.8125rem",
              color: "var(--text-muted)",
              border: "1.5px dashed var(--border)",
              borderRadius: "10px",
            }}
          >
            No paid tools needed yet. Subtasks like research, financials, or social signals will trigger an Arc-settled USDC nanopayment automatically.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {payments.map((p) => (
              <div
                key={p.id}
                style={{
                  border: "1.5px solid var(--ink)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  display: "grid",
                  gridTemplateColumns: "minmax(120px, 1.4fr) minmax(80px, 0.7fr) minmax(80px, 0.7fr) minmax(140px, 1fr)",
                  gap: "10px",
                  alignItems: "center",
                  background: p.status === "failed" ? "#FFE2E2" : "var(--cream)",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.endpoint_label}
                  </span>
                  <span style={{ fontSize: "0.625rem", fontFamily: "JetBrains Mono, monospace", color: "var(--text-muted)" }}>
                    /{p.endpoint}
                  </span>
                </div>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.8125rem", color: "var(--ink)", fontWeight: 700 }}>
                  ${formatUsdc(p.cost_usdc)}
                </div>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.75rem", color: "var(--savings)" }}>
                  {p.latency_ms}ms
                </div>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.6875rem", color: "var(--text-muted)", textAlign: "right" }}>
                  {p.tx_hash ? (
                    <a
                      href={`${ARC_EXPLORER}${p.tx_hash}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      style={{ color: "var(--ink)", textDecoration: "underline" }}
                    >
                      {shortHash(p.tx_hash)}
                    </a>
                  ) : (
                    <span>{p.status === "failed" ? "failed" : "settling…"}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: "12px",
        background: "var(--bg-elev2)",
        border: "1.5px solid var(--ink)",
      }}
    >
      <div
        style={{
          fontSize: "0.625rem",
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: "var(--text-muted)",
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div
        className="font-display"
        style={{ fontSize: "1.25rem", color: accent, marginTop: "3px", lineHeight: 1 }}
      >
        {value}
      </div>
    </div>
  );
}
