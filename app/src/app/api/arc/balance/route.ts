import { NextResponse } from "next/server";
import { getArcWalletBalance, isMockMode } from "@/lib/x402";

export const runtime = "nodejs";

export async function GET() {
  const mock = isMockMode();
  const wallet = mock ? null : await getArcWalletBalance();
  return NextResponse.json({
    success: true,
    data: {
      mock,
      wallet,
      network: "arc-testnet",
      chain_id: Number(process.env.ARC_CHAIN_ID ?? "5042002"),
      faucet_url: "https://faucet.circle.com/",
      explorer_url: "https://testnet.arcscan.app/",
    },
  });
}
