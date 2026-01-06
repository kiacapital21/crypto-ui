import React, { useEffect, useMemo, useState } from "react";

interface FundingRateUpdateItem {
  s: string; // Symbol
  r: string; // Funding rate
  T: number;
}

const BinanceAllFundingRates: React.FC = () => {
  const [fundingRates, setFundingRates] = useState<Record<string, number>>({});
  const [status, setStatus] = useState("Connecting...");

  const streamUrl = "wss://fstream.binance.com/ws/!fundingRate@arr";

  useEffect(() => {
    const ws = new WebSocket(streamUrl);

    ws.onopen = () => setStatus("Connected");

    ws.onmessage = (event) => {
      const updates: FundingRateUpdateItem[] = JSON.parse(event.data);

      if (Array.isArray(updates)) {
        setFundingRates((prev) => {
          const next = { ...prev };
          updates.forEach((u) => {
            next[u.s] = parseFloat(u.r) * 100; // store %
          });
          return next;
        });
      }
    };

    ws.onclose = () => setStatus("Disconnected");
    ws.onerror = () => setStatus("Error");

    return () => ws.close();
  }, []);

  // 🔥 Find extremes
  const { highestPositive, lowestNegative } = useMemo(() => {
    let max = -Infinity;
    let min = Infinity;

    Object.values(fundingRates).forEach((rate) => {
      if (rate > max) max = rate;
      if (rate < min) min = rate;
    });

    return {
      highestPositive: max > 0 ? max : null,
      lowestNegative: min < 0 ? min : null,
    };
  }, [fundingRates]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Binance Funding Rates</h2>
      <p>
        Status: <strong>{status}</strong>
      </p>

      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Funding Rate</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(fundingRates).map(([symbol, rate]) => {
            const isMax = rate === highestPositive;
            const isMin = rate === lowestNegative;

            return (
              <tr
                key={symbol}
                style={{
                  backgroundColor: isMax
                    ? "#d4f8d4" // green
                    : isMin
                    ? "#ffd6d6" // red
                    : "transparent",
                  fontWeight: isMax || isMin ? "bold" : "normal",
                }}
              >
                <td>{symbol}</td>
                <td style={{ color: rate >= 0 ? "green" : "red" }}>
                  {rate.toFixed(4)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p style={{ marginTop: 10 }}>
        🟢 Highest Positive:{" "}
        {highestPositive !== null ? highestPositive.toFixed(4) + "%" : "N/A"} |
        🔴 Highest Negative:{" "}
        {lowestNegative !== null ? lowestNegative.toFixed(4) + "%" : "N/A"}
      </p>
    </div>
  );
};

export default BinanceAllFundingRates;
