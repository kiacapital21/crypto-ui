import React, { useState } from "react";
import { FundingRateItem } from "../types/FundingRate";
import { clearTradingSymbol, setTradingSymbol } from "../services/ws";
import "./FundingRateTable.css";

interface Props {
  data: FundingRateItem[];
}

const FundingRateTable: React.FC<Props> = ({ data }) => {
  const [search, setSearch] = useState("");
  const [posSort, setPosSort] = useState<"none" | "high" | "low">("high");
  const [negSort, setNegSort] = useState<"none" | "high" | "low">("low");
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const filtered = data.filter((item) =>
    item.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const positive = filtered.filter((item) => item.fundingRate >= 0);
  const negative = filtered.filter((item) => item.fundingRate < 0);

  const sortData = (
    items: FundingRateItem[],
    sortType: "none" | "high" | "low"
  ) => {
    return [...items].sort((a, b) => {
      if (sortType === "high") return b.fundingRate - a.fundingRate;
      if (sortType === "low") return a.fundingRate - b.fundingRate;
      return 0;
    });
  };

  const sortedPositive = sortData(positive, posSort);
  const sortedNegative = sortData(negative, negSort);

  // Get the selected symbol's current funding rate
  const selectedData = data.find((item) => item.symbol === selectedSymbol);

  return (
    <div className="card">
      <h2>📊 Live Funding Rates</h2>

      {/* Selected Symbol Section */}
      {selectedSymbol && selectedData && (
        <div className="selected-symbol-section">
          <div className="selected-symbol-header">
            📍 Selected Symbol for Trading
          </div>
          <div className="selected-symbol-content">
            <div className="selected-symbol-name">{selectedSymbol}</div>
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
        Displaying: {filtered.length}
      </div>

      <div className="controls">
        <input
          type="text"
          placeholder="Search symbol..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div
        className="funding-rates-section"
        style={{ display: "flex", gap: "20px", marginTop: "20px" }}
      >
        {/* Positive Funding Rates Section */}
        <div style={{ flex: 1 }}>
          <h3 style={{ color: "limegreen" }}>
            ✅ Positive Funding Rates ({sortedPositive.length})
          </h3>

          <select
            value={posSort}
            onChange={(e) => setPosSort(e.target.value as any)}
            style={{ marginBottom: "10px", width: "100%" }}
          >
            <option value="none">Sort</option>
            <option value="high">Highest Rate</option>
            <option value="low">Lowest Rate</option>
          </select>

          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Funding Rate</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedPositive.map((item) => (
                <tr
                  key={item.symbol}
                  className={item.highlight ? "highlight" : ""}
                >
                  <td>{item.symbol}</td>
                  <td style={{ color: "limegreen" }}>
                    {item.fundingRate.toFixed(4)}%
                  </td>
                  <td>
                    <button
                      className={`select-btn ${
                        selectedSymbol === item.symbol ? "selected" : ""
                      }`}
                      onClick={() => handleSelectSymbol(item.symbol)}
                      disabled={isLoading}
                      title="Select symbol for trading"
                    >
                      {isLoading && selectedSymbol === item.symbol
                        ? "⏳"
                        : "📤"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sortedPositive.length === 0 && (
            <p style={{ textAlign: "center", color: "#999" }}>
              No positive funding rates
            </p>
          )}
        </div>

        {/* Negative Funding Rates Section */}
        <div style={{ flex: 1 }}>
          <h3 style={{ color: "red" }}>
            ❌ Negative Funding Rates ({sortedNegative.length})
          </h3>

          <select
            value={negSort}
            onChange={(e) => setNegSort(e.target.value as any)}
            style={{ marginBottom: "10px", width: "100%" }}
          >
            <option value="none">Sort</option>
            <option value="high">Highest Rate</option>
            <option value="low">Lowest Rate</option>
          </select>

          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Funding Rate</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedNegative.map((item) => (
                <tr
                  key={item.symbol}
                  className={item.highlight ? "highlight" : ""}
                >
                  <td>{item.symbol}</td>
                  <td style={{ color: "red" }}>
                    {item.fundingRate.toFixed(4)}%
                  </td>
                  <td>
                    <button
                      className={`select-btn ${
                        selectedSymbol === item.symbol ? "selected" : ""
                      }`}
                      onClick={() => handleSelectSymbol(item.symbol)}
                      disabled={isLoading}
                      title="Select symbol for trading"
                    >
                      {isLoading && selectedSymbol === item.symbol
                        ? "⏳"
                        : "📤"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sortedNegative.length === 0 && (
            <p style={{ textAlign: "center", color: "#999" }}>
              No negative funding rates
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FundingRateTable;
