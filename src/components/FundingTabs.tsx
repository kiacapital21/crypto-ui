import React, { useState } from "react";
import styled from "styled-components"; // Your Binance component
import FundingRateTable from "./FundingRateTable"; // Your Delta component
import { FundingRateItem } from "../types/FundingRate"; // Assuming you have this type
import { BinanceFundingRateItem } from "../services/binance-ws";
import BinanceFundingTable from "./BinanceFundingTable";

interface Props {
  deltaData: FundingRateItem[];
  binanceData: BinanceFundingRateItem[];
}

const FundingTabs: React.FC<Props> = ({ deltaData, binanceData }) => {
  const [activeTab, setActiveTab] = useState<"binance" | "delta">("binance");

  return (
    <Container>
      <Header>📊 Live Funding Rates</Header>

      {/* Tabs */}
      <TabBar>
        <TabButton
          active={activeTab === "binance"}
          onClick={() => setActiveTab("binance")}
          color="#f0b90b"
        >
          Binance
        </TabButton>
        <TabButton
          active={activeTab === "delta"}
          onClick={() => setActiveTab("delta")}
          color="#4cc9f0"
        >
          Delta India
        </TabButton>
      </TabBar>

      {/* Content */}
      <Content>
        {activeTab === "binance" && <BinanceFundingTable data={binanceData} />}
        {activeTab === "delta" && <FundingRateTable data={deltaData} />}
      </Content>
    </Container>
  );
};

/* ================== STYLED COMPONENTS ================== */

const Container = styled.div`
  max-width: 1000px;
  margin: auto;
  background: #0b0f1a;
  color: white;
  border-radius: 12px;
  padding: 20px;
`;

const Header = styled.h2`
  text-align: center;
  margin-bottom: 20px;
`;

const TabBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const TabButton = styled.button<{ active: boolean; color: string }>`
  padding: 10px 24px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 30px;
  cursor: pointer;
  border: none;
  background: ${({ active, color }) => (active ? color : "#222")};
  color: ${({ active }) => (active ? "#000" : "#fff")};
  transition: all 0.3s ease;

  &:hover {
    background: ${({ color }) => color};
    color: #000;
  }
`;

const Content = styled.div`
  min-height: 400px;
`;

export default FundingTabs;
