/**
 * Server-side x402 paying client for Arc testnet.
 *
 * Wraps `@x402/fetch` + `@x402/evm` + `viem` with a Circle-Gateway-aware
 * EIP-712 scheme so every call to a paid AIsa `/apis/v2/` endpoint settles in
 * USDC on Arc via Circle Gateway. Each `payAndCall` returns a `NanoPayment`
 * record (cost, latency, payer address) that is streamed to the client over
 * SSE and aggregated into the run totals.
 *
 * Env:
 *   ARC_MNEMONIC      BIP-39 mnemonic for the paying wallet (server-only).
 *   OWS_MNEMONIC      Legacy fallback supported by the nanopayment-x402 skill.
 *   ARC_RPC_URL       Default https://rpc.testnet.arc.network.
 *   ARC_CHAIN_ID      Default 5042002.
 *   X402_MOCK         Set to "1" to skip real signing and emit synthetic
 *                     nanopayments — useful for local demos before the wallet
 *                     is funded via the Circle faucet.
 */
import { v4 as uuid } from "uuid";
import type { NanoPayment, ToolCallSpec } from "./types";

const ARC_RPC_URL = process.env.ARC_RPC_URL ?? "https://rpc.testnet.arc.network";
const ARC_CHAIN_ID = process.env.ARC_CHAIN_ID ?? "5042002";
const PREFERRED_CHAIN = `eip155:${ARC_CHAIN_ID}`;

const SUPPORTED_NETWORKS = [
  "eip155:5042002", "eip155:11155111", "eip155:84532", "eip155:43113",
  "eip155:421614", "eip155:14601", "eip155:4801", "eip155:1328",
  "eip155:998", "eip155:11155420", "eip155:80002", "eip155:1301",
];

function getMnemonic(): string | null {
  return process.env.ARC_MNEMONIC ?? process.env.OWS_MNEMONIC ?? null;
}

export function isMockMode(): boolean {
  if (process.env.X402_MOCK === "1") return true;
  return !getMnemonic();
}

interface PayingClient {
  fetch: typeof fetch;
  address: string;
}

let cachedClient: PayingClient | null = null;
let cachedClientError: Error | null = null;

async function buildPayingClient(): Promise<PayingClient> {
  if (cachedClient) return cachedClient;
  if (cachedClientError) throw cachedClientError;

  const mnemonic = getMnemonic();
  if (!mnemonic) {
    const err = new Error("ARC_MNEMONIC or OWS_MNEMONIC not configured");
    cachedClientError = err;
    throw err;
  }

  try {
    const [{ wrapFetchWithPayment, x402Client }, { toClientEvmSigner }, viem, accounts] =
      await Promise.all([
        import("@x402/fetch"),
        import("@x402/evm"),
        import("viem"),
        import("viem/accounts"),
      ]);

    const arcTestnet = {
      id: parseInt(ARC_CHAIN_ID, 10),
      name: "Arc Testnet",
      nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
      rpcUrls: { default: { http: [ARC_RPC_URL] } },
    } as const;

    const account = accounts.mnemonicToAccount(mnemonic);
    const walletClient = viem.createWalletClient({
      account,
      chain: arcTestnet,
      transport: viem.http(ARC_RPC_URL),
    }) as ReturnType<typeof viem.createWalletClient> & { address?: string };
    walletClient.address = account.address;

    const publicClient = viem.createPublicClient({
      chain: arcTestnet,
      transport: viem.http(ARC_RPC_URL),
    });

    const evmSigner = toClientEvmSigner(walletClient as never, publicClient as never);
    const scheme = new GatewayEvmScheme(evmSigner as unknown as GatewaySigner, viem);

    const selector = ((_: unknown, accepts: Array<{ network: string }>) =>
      accepts.find((a) => a.network === PREFERRED_CHAIN) ?? accepts[0]) as never;
    const client = new x402Client(selector);

    SUPPORTED_NETWORKS.forEach((n) => client.register(n as `${string}:${string}`, scheme as never));

    const wrapped = wrapFetchWithPayment(fetch, client) as typeof fetch;
    cachedClient = { fetch: wrapped, address: account.address };
    return cachedClient;
  } catch (err) {
    cachedClientError = err as Error;
    throw err;
  }
}

interface GatewaySigner {
  address: string;
  signTypedData: (args: unknown) => Promise<string>;
}

/**
 * Custom EIP-712 scheme matching Circle Gateway's TransferWithAuthorization
 * domain. The standard `@x402/evm` ExactEvmScheme uses the asset address as
 * `verifyingContract`; AIsa proxies through Circle Gateway, so we read
 * `extra.verifyingContract` from the 402 response instead.
 */
class GatewayEvmScheme {
  scheme = "exact" as const;
  private signer: GatewaySigner;
  private viem: typeof import("viem");

  constructor(signer: GatewaySigner, viem: typeof import("viem")) {
    this.signer = signer;
    this.viem = viem;
  }

  async createPaymentPayload(
    x402Version: number,
    paymentRequirements: {
      amount: string;
      payTo: string;
      asset: string;
      network: string;
      maxTimeoutSeconds: number;
      extra?: { name?: string; version?: string; verifyingContract?: string };
    },
  ) {
    const random = new Uint8Array(32);
    crypto.getRandomValues(random);
    const nonce =
      "0x" + Array.from(random, (b) => b.toString(16).padStart(2, "0")).join("");
    const now = Math.floor(Date.now() / 1000);

    const authorization = {
      from: this.signer.address,
      to: this.viem.getAddress(paymentRequirements.payTo),
      value: paymentRequirements.amount,
      validAfter: (now - 600).toString(),
      validBefore: (now + paymentRequirements.maxTimeoutSeconds).toString(),
      nonce,
    };

    const chainIdMatch = paymentRequirements.network.match(/eip155:(\d+)/);
    const chainId = chainIdMatch ? parseInt(chainIdMatch[1], 10) : 5042002;

    const domain = {
      name: paymentRequirements.extra?.name ?? "GatewayWalletBatched",
      version: paymentRequirements.extra?.version ?? "1",
      chainId,
      verifyingContract: this.viem.getAddress(
        paymentRequirements.extra?.verifyingContract ?? paymentRequirements.asset,
      ),
    };

    const types = {
      TransferWithAuthorization: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "validAfter", type: "uint256" },
        { name: "validBefore", type: "uint256" },
        { name: "nonce", type: "bytes32" },
      ],
    };

    const message = {
      from: this.viem.getAddress(authorization.from),
      to: this.viem.getAddress(authorization.to),
      value: BigInt(authorization.value),
      validAfter: BigInt(authorization.validAfter),
      validBefore: BigInt(authorization.validBefore),
      nonce: authorization.nonce,
    };

    const signature = await this.signer.signTypedData({
      domain,
      types,
      primaryType: "TransferWithAuthorization",
      message,
    });

    return { x402Version, payload: { authorization, signature } };
  }
}

export interface PayAndCallResult {
  payment: NanoPayment;
  body: string;
  status: number;
  ok: boolean;
}

/**
 * Make a paid call to a `/apis/v2/` AIsa endpoint via x402, settling on Arc.
 * Returns the nanopayment record + the response body. If the wallet is not
 * configured (or `X402_MOCK=1`), emits a synthetic settled nanopayment so the
 * UX still demonstrates the flow during a hackathon demo.
 */
export async function payAndCall(
  spec: ToolCallSpec,
  request: { url: string; body?: string },
  subtaskId: string,
): Promise<PayAndCallResult> {
  const startedAt = Date.now();

  if (isMockMode()) {
    const latency = randomLatencyMs();
    await sleep(latency);
    const payment: NanoPayment = {
      id: uuid(),
      subtask_id: subtaskId,
      endpoint: spec.endpoint,
      endpoint_label: spec.endpoint_label,
      cost_usdc: spec.price_usdc,
      latency_ms: latency,
      tx_hash: mockTxHash(),
      payer_address: "0xMOCK0000000000000000000000000000000DEM01",
      network: "arc-testnet",
      settled_at: new Date().toISOString(),
      status: "mocked",
    };
    return {
      payment,
      body: JSON.stringify({
        mocked: true,
        note: "Set ARC_MNEMONIC and run the nanopayment-x402 setup to issue real x402 calls.",
      }),
      status: 200,
      ok: true,
    };
  }

  try {
    const client = await buildPayingClient();
    const headers: Record<string, string> = {
      "content-type": "application/json",
    };
    const init: RequestInit = { method: spec.method, headers };
    if (spec.method === "POST") init.body = request.body ?? "{}";

    const res = await client.fetch(request.url, init);
    const text = await res.text();
    const latency = Date.now() - startedAt;

    const payment: NanoPayment = {
      id: uuid(),
      subtask_id: subtaskId,
      endpoint: spec.endpoint,
      endpoint_label: spec.endpoint_label,
      cost_usdc: spec.price_usdc,
      latency_ms: latency,
      tx_hash: extractTxHash(res, text),
      payer_address: client.address,
      network: "arc-testnet",
      settled_at: new Date().toISOString(),
      status: res.ok ? "settled" : "failed",
    };

    return { payment, body: text, status: res.status, ok: res.ok };
  } catch (err) {
    const latency = Date.now() - startedAt;
    const payment: NanoPayment = {
      id: uuid(),
      subtask_id: subtaskId,
      endpoint: spec.endpoint,
      endpoint_label: spec.endpoint_label,
      cost_usdc: 0,
      latency_ms: latency,
      payer_address: "0xUNAVAILABLE",
      network: "arc-testnet",
      settled_at: new Date().toISOString(),
      status: "failed",
    };
    return {
      payment,
      body: JSON.stringify({ error: err instanceof Error ? err.message : "x402 call failed" }),
      status: 500,
      ok: false,
    };
  }
}

/**
 * Read the wallet's USDC balance on Arc. Returns null in mock mode.
 * Lazy import — keeps the build green when @x402 / viem are absent.
 */
export async function getArcWalletBalance(): Promise<{
  address: string;
  usdc_wallet: number;
  network: string;
} | null> {
  if (isMockMode()) return null;
  try {
    const client = await buildPayingClient();
    const viem = await import("viem");
    const publicClient = viem.createPublicClient({
      chain: {
        id: parseInt(ARC_CHAIN_ID, 10),
        name: "Arc Testnet",
        nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
        rpcUrls: { default: { http: [ARC_RPC_URL] } },
      },
      transport: viem.http(ARC_RPC_URL),
    });
    const usdcAddress = "0x3600000000000000000000000000000000000000" as const;
    const balance = (await publicClient.readContract({
      address: usdcAddress,
      abi: [
        {
          name: "balanceOf",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "account", type: "address" }],
          outputs: [{ name: "", type: "uint256" }],
        },
      ] as const,
      functionName: "balanceOf",
      args: [client.address as `0x${string}`],
    })) as bigint;
    return {
      address: client.address,
      usdc_wallet: Number(balance) / 1_000_000,
      network: "arc-testnet",
    };
  } catch {
    return null;
  }
}

function randomLatencyMs(): number {
  return 480 + Math.floor(Math.random() * 520);
}

function mockTxHash(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return "0x" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function extractTxHash(res: Response, body: string): string | undefined {
  const headerHash =
    res.headers.get("x-payment-tx") ??
    res.headers.get("x-tx-hash") ??
    res.headers.get("x-settlement-tx");
  if (headerHash && headerHash.startsWith("0x")) return headerHash;
  try {
    const parsed = JSON.parse(body) as { tx_hash?: string; transaction_hash?: string };
    return parsed.tx_hash ?? parsed.transaction_hash;
  } catch {
    return undefined;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
