"use client";

import { useState } from "react";
import { MAX_ORDER_QUANTITY } from "../lib/product-price";

export function QuantitySelector({ value, onChange, max = MAX_ORDER_QUANTITY, disabled = false, label = "상품 수량" }) {
  const [empty, setEmpty] = useState(false);
  const limit = Math.max(1, Math.min(MAX_ORDER_QUANTITY, max));
  return <div className="quantity-control quantity-selector">
    <button type="button" aria-label={`${label} 줄이기`} disabled={disabled || value <= 1} onClick={() => onChange(Math.min(limit, value - 1))}>−</button>
    <input type="number" aria-label={label} min={1} max={limit} step={1} inputMode="numeric" value={empty ? "" : value} disabled={disabled} onBlur={() => setEmpty(false)} onChange={(event) => {
      const input = event.target.value;
      setEmpty(input === "");
      if (input === "") return;
      const number = Number(input);
      if (Number.isInteger(number)) onChange(Math.min(limit, Math.max(1, number)));
    }} />
    <button type="button" aria-label={`${label} 늘리기`} disabled={disabled || value >= limit} onClick={() => onChange(value + 1)}>+</button>
  </div>;
}
