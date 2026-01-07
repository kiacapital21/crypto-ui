// src/services/binance-ws.ts
import { useEffect, useState } from "react";

export interface BinanceFundingRateItem {
  symbol: string;
  fundingRate: number;
}

const REST_URL = "https://fapi.binance.com/fapi/v1/exchangeInfo";
const WS_BASE = "wss://fstream.binance.com/stream?streams=";
const BINANCE_API = "http://43.204.27.12/binance/";

export function useBinanceFundingRates() {
  const [data, setData] = useState<BinanceFundingRateItem[]>([]);

  useEffect(() => {
    let alive = true;

    const init = async () => {
      const res = await fetch(REST_URL);
      const json = await res.json();

      const symbols = json.symbols
        .filter(
          (s: any) =>
            s.contractType === "PERPETUAL" &&
            s.quoteAsset === "USDT" &&
            s.status === "TRADING"
        )
        .map((s: any) => s.symbol.toLowerCase());

      const streams = symbols.map((s: string) => `${s}@markPrice@1s`).join("/");
      const ws = new WebSocket(WS_BASE + streams);

      ws.onmessage = (e) => {
        if (!alive) return;
        const msg = JSON.parse(e.data);
        const d = msg?.data;
        if (!d?.s) return;

        const symbol = d.s.toLowerCase();
        const fundingRate = Number(d.r) * 100;

        setData((prev) => {
          const existing = prev.find((p) => p.symbol === symbol);
          if (existing) {
            return prev.map((p) =>
              p.symbol === symbol ? { ...p, fundingRate } : p
            );
          }
          return [...prev, { symbol, fundingRate }];
        });
      };
    };

    init();

    return () => {
      alive = false;
    };
  }, []);

  return data;
}

export async function setTradingSymbol(symbol: string): Promise<void> {
  try {
    symbol = symbol.toUpperCase();
    const response = await fetch(BINANCE_API + "set-crypto", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ symbol }),
    });

    if (!response.ok) {
      throw new Error(`Failed to set trading symbol: ${response.statusText}`);
    }

    console.log(`Trading symbol set to: ${symbol}`);
  } catch (error) {
    console.error("Error setting trading symbol:", error);
    throw error;
  }
}

export async function clearTradingSymbol(): Promise<void> {
  try {
    const response = await fetch(BINANCE_API + "clear-crypto", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to clear trading symbol: ${response.statusText}`);
    }

    console.log("Trading symbol cleared");
  } catch (error) {
    console.error("Error clearing trading symbol:", error);
    throw error;
  }
}
