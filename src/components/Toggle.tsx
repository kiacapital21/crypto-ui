import React from "react";
import styled from "styled-components";

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <Switch disabled={disabled}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <Slider checked={checked} />
    </Switch>
  );
};

export default Toggle;

/* ================= styles ================= */

const Switch = styled.label<{ disabled?: boolean }>`
  position: relative;
  display: inline-block; /* ✅ IMPORTANT */
  width: 46px;
  height: 26px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};

  input {
    display: none;
  }
`;

const Slider = styled.span<{ checked: boolean }>`
  position: absolute;
  inset: 0;
  background: ${({ checked }) => (checked ? "#4cc9f0" : "#555")};
  border-radius: 20px;
  transition: 0.25s;

  &::before {
    content: "";
    position: absolute;
    height: 18px;
    width: 18px;
    top: 4px;
    left: ${({ checked }) => (checked ? "24px" : "4px")};
    background: white;
    border-radius: 50%;
    transition: 0.25s;
  }
`;
