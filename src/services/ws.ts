// src/services/ws.ts
export interface FundingRateEvent {
  type: string;
  symbol: string;
  funding_rate: number;
}

export type FundingRateCallback = (data: FundingRateEvent) => void;

const DELTA_EXCHANGE_API = "http://43.204.27.12/delta-exchange/";

export function createDeltaWebSocket(
  onFundingRate: FundingRateCallback
): WebSocket {
  const url = "wss://socket.india.delta.exchange";
  let reconnectTimeout = 2000;
  let heartbeatInterval: NodeJS.Timeout;

  const ws = new WebSocket(url);

  ws.onopen = () => {
    console.log("Delta WebSocket connected");

    // Subscribe to funding_rate channel
    const payload = {
      type: "subscribe",
      payload: {
        channels: [
          {
            name: "funding_rate",
            symbols: ["perpetual_futures"],
          },
        ],
      },
    };

    ws.send(JSON.stringify(payload));

    // Heartbeat every 15s
    heartbeatInterval = setInterval(() => {
      ws.send(JSON.stringify({ type: "ping" }));
    }, 15000);

    reconnectTimeout = 2000; // reset backoff
  };

  ws.onmessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === "funding_rate") {
        onFundingRate({
          type: data.type,
          symbol: data.symbol,
          funding_rate: data.funding_rate,
        });
      }
    } catch (err) {
      console.error("Invalid WS data:", err);
    }
  };

  ws.onclose = () => {
    console.warn("WebSocket closed. Reconnecting...");

    clearInterval(heartbeatInterval);
    setTimeout(() => createDeltaWebSocket(onFundingRate), reconnectTimeout);
    reconnectTimeout = Math.min(reconnectTimeout * 2, 30000);
  };

  ws.onerror = (err) => {
    console.error("WebSocket error:", err);
  };

  return ws;
}

// API function to set the trading symbol
export async function setTradingSymbol(symbol: string): Promise<void> {
  try {
    const response = await fetch(DELTA_EXCHANGE_API + "set-crypto", {
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
    const response = await fetch(DELTA_EXCHANGE_API + "clear-crypto", {
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
