import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { createDeltaWebSocket, FundingRateEvent } from "./services/ws";
import { FundingRateItem } from "./types/FundingRate";
import FundingRateTable from "./components/FundingRateTable";
import BinanceFundingRate from "./services/binance-ws";

function App() {
  const [data, setData] = useState<FundingRateItem[]>([]);

  useEffect(() => {
    const ws = createDeltaWebSocket((incoming: FundingRateEvent) => {
      setData((prev) => {
        const found = prev.find((p) => p.symbol === incoming.symbol);
        const fundingRate = incoming.funding_rate;

        if (found) {
          // update existing
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

        // new symbol
        return [
          ...prev,
          {
            symbol: incoming.symbol,
            fundingRate,
            highlight: true,
          },
        ];
      });
    });

    return () => ws.close();
  }, []);
  return (
    <div>
      <BinanceFundingRate />
      <FundingRateTable data={data} />
    </div>
  );
}

export default App;
