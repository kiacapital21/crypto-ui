// src/components/BinanceFundingTable.tsx
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
  BinanceFundingRateItem,
  clearTradingSymbol,
  setTradingSymbol,
} from "../services/binance-ws";

const Card = styled.div`
  background: #0b0f1a;
  color: white;
  border-radius: 12px;
  padding: 20px;
  max-width: 900px;
  margin: auto;
`;
const Tabs = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
`;
const Tab = styled.button<{ active: boolean; color: string }>`
  padding: 10px 20px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  background: ${({ active }) => (active ? "#1c2333" : "transparent")};
  color: ${({ color }) => color};
  font-size: 18px;
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;
const Th = styled.th`
  text-align: left;
  padding: 10px;
  border-bottom: 1px solid #222;
`;
const Td = styled.td<{ color?: string }>`
  padding: 10px;
  color: ${({ color }) => color || "white"};
`;

interface Props {
  data: BinanceFundingRateItem[];
}

const BinanceFundingTable: React.FC<Props> = ({ data }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tab, setTab] = useState<"positive" | "negative">("negative");
  const [sort, setSort] = useState<"none" | "high" | "low">("none");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const handleSelectSymbol = async (symbol: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await setTradingSymbol(symbol);
      setSelectedSymbol(symbol);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to set trading symbol"
      );
      console.error("Error selecting symbol:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSelection = async () => {
    try {
      // Call API to clear trading symbol
      // Assuming clearTradingSymbol is defined in services/ws.ts
      await clearTradingSymbol();
      setSelectedSymbol(null);
    } catch (err) {
      console.error("Error clearing trading symbol:", err);
    }
  };
  const filteredData = useMemo(
    () =>
      data.filter((r) => r.symbol.toLowerCase().includes(search.toLowerCase())),
    [data, search]
  );

  useEffect(() => {
    if (tab === "positive") setSort("high"); // default: highest first
    else setSort("low"); // default: lowest first for negative
  }, [tab]);
  // Default sort based on tab
  const rows = useMemo(() => {
    let list = filteredData
      .filter((r) => r.symbol.toLowerCase().includes(search.toLowerCase()))
      .filter((r) =>
        tab === "positive" ? r.fundingRate >= 0 : r.fundingRate < 0
      );

    if (sort === "none") {
      list.sort((a, b) =>
        tab === "positive"
          ? b.fundingRate - a.fundingRate
          : a.fundingRate - b.fundingRate
      );
    } else if (sort === "high") {
      list.sort((a, b) => b.fundingRate - a.fundingRate);
    } else if (sort === "low") {
      list.sort((a, b) => a.fundingRate - b.fundingRate);
    }

    return list;
  }, [filteredData, tab, sort, search]);

  const negativeCount = filteredData.filter((r) => r.fundingRate < 0).length;
  const positiveCount = filteredData.filter((r) => r.fundingRate >= 0).length;
  const selectedData = data.find((item) => item.symbol === selectedSymbol);
  return (
    <div className="card">
      {/* Selected Symbol Section */}
      {selectedSymbol && selectedData && (
        <div className="selected-symbol-section">
          <div className="selected-symbol-header">
            📍 Selected Symbol for Trading
          </div>
          <div className="selected-symbol-name">
            {selectedSymbol.toUpperCase()}
          </div>
          <div className="selected-symbol-content">
            <div
              className={`selected-symbol-rate ${
                selectedData.fundingRate >= 0 ? "positive" : "negative"
              }`}
            >
              {selectedData.fundingRate.toFixed(4)}%
            </div>
            <button
              className="clear-selection-btn"
              onClick={() => handleClearSelection()}
              disabled={isLoading}
            >
              ✕ Clear
            </button>
          </div>
        </div>
      )}
      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        Displaying: {filteredData.length}
      </div>
      <input
        placeholder="Search symbol..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
      />

      <Tabs>
        <Tab
          active={tab === "negative"}
          color="red"
          onClick={() => setTab("negative")}
        >
          Negative ({negativeCount})
        </Tab>
        <Tab
          active={tab === "positive"}
          color="limegreen"
          onClick={() => setTab("positive")}
        >
          Positive ({positiveCount})
        </Tab>
      </Tabs>

      <select
        value={sort}
        onChange={(e) => setSort(e.target.value as any)}
        style={{ width: "100%", marginBottom: 12 }}
      >
        <option value="none">Sort</option>
        <option value="high">Highest</option>
        <option value="low">Lowest</option>
      </select>

      <Table>
        <thead>
          <tr>
            <Th>Symbol</Th>
            <Th>Funding %</Th>
            <Th>Action</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.symbol}>
              <Td>{r.symbol.toUpperCase()}</Td>
              <Td color={r.fundingRate >= 0 ? "limegreen" : "red"}>
                {r.fundingRate.toFixed(4)}%
              </Td>
              <Td>
                <button
                  className={`select-btn ${
                    selected === r.symbol ? "selected" : ""
                  }`}
                  onClick={() => handleSelectSymbol(r.symbol)}
                  disabled={isLoading}
                  title="Select symbol for trading"
                >
                  {isLoading && selected === r.symbol ? "⏳" : "📤"}
                </button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      {rows.length === 0 && (
        <p style={{ textAlign: "center", opacity: 0.5 }}>No data available</p>
      )}
    </div>
  );
};

export default BinanceFundingTable;
