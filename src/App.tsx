// src/App.tsx
import React, { useState } from "react";
import "./App.css";
import { FundingRateItem } from "./types/FundingRate";
import FundingTabs from "./components/FundingTabs";
import { useBinanceFundingRates } from "./services/binance-ws";
import { createDeltaWebSocket, FundingRateEvent } from "./services/ws";

function App() {
  const [deltaData, setDeltaData] = useState<FundingRateItem[]>([]);
  const binanceData = useBinanceFundingRates();

  React.useEffect(() => {
    const ws = createDeltaWebSocket((incoming: FundingRateEvent) => {
      setDeltaData((prev) => {
        const found = prev.find((p) => p.symbol === incoming.symbol);
        const fundingRate = incoming.funding_rate;

        if (found) {
          return prev.map((p) =>
            p.symbol === incoming.symbol
              ? {
                  symbol: incoming.symbol,
                  fundingRate,
                  highlight: p.fundingRate !== fundingRate,
                }
              : p
          );
        }

        return [
          ...prev,
          { symbol: incoming.symbol, fundingRate, highlight: true },
        ];
      });
    });

    return () => ws.close();
  }, []);

  return <FundingTabs deltaData={deltaData} binanceData={binanceData} />;
}

export default App;
