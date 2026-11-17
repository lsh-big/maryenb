"use client";

export function QuantitySelector({ value, onChange, max = 99, disabled = false, label = "상품 수량" }) {
  const limit = Math.max(1, Math.min(99, max));
  return <div className="quantity-control quantity-selector">
    <button type="button" aria-label={`${label} 줄이기`} disabled={disabled || value <= 1} onClick={() => onChange(value - 1)}>−</button>
    <input type="number" aria-label={label} min={1} max={limit} step={1} inputMode="numeric" value={value} disabled={disabled} onChange={(event) => {
      const number = Number(event.target.value);
      if (Number.isInteger(number)) onChange(Math.min(limit, Math.max(1, number)));
    }} />
    <button type="button" aria-label={`${label} 늘리기`} disabled={disabled || value >= limit} onClick={() => onChange(value + 1)}>+</button>
  </div>;
}
