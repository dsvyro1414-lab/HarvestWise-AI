import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { parseLocaleNumber } from "@/utils/numericNormalization";

interface NumberFieldProps {
  label: string;
  value: number;
  helper?: string;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
  placeholder?: string;
  emptyWhenZero?: boolean;
  onChange: (value: number) => void;
}

export function parseNumberFieldInput(raw: string): number | null {
  return raw.trim() === "" ? 0 : parseLocaleNumber(raw);
}

interface NumberFieldValidationResult {
  value: number | null;
  error: string | null;
}

export function validateNumberFieldInput(
  raw: string,
  min = 0,
  max?: number,
): NumberFieldValidationResult {
  if (raw.trim() === "") return { value: 0, error: null };

  const value = parseLocaleNumber(raw);
  if (value === null) {
    return {
      value: null,
      error: "Enter one complete number using a period or comma for decimals.",
    };
  }
  if (value < min) return { value: null, error: `Enter ${min} or more.` };
  if (max !== undefined && value > max) return { value: null, error: `Enter ${max} or less.` };

  return { value, error: null };
}

export function getNumberFieldAriaValue(raw: string, min = 0, max?: number): number | undefined {
  if (raw.trim() === "") return undefined;
  return validateNumberFieldInput(raw, min, max).value ?? undefined;
}

export function NumberField({
  label,
  value,
  helper,
  unit,
  step = 1,
  min = 0,
  max,
  placeholder,
  emptyWhenZero = false,
  onChange,
}: NumberFieldProps) {
  const displayValue = emptyWhenZero && value === 0 ? "" : Number.isFinite(value) ? String(value) : "0";
  const [draft, setDraft] = useState(displayValue);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorId = useId();
  const helperId = useId();
  const previousDisplayValue = useRef(displayValue);

  useEffect(() => {
    const displayChanged = previousDisplayValue.current !== displayValue;
    previousDisplayValue.current = displayValue;

    if (!isEditing) {
      setDraft(displayValue);
      if (displayChanged) setError(null);
    }
  }, [displayValue, isEditing]);

  function handleChange(raw: string) {
    setDraft(raw);
    const result = validateNumberFieldInput(raw, min, max);

    if (result.value !== null) {
      setError(null);
      onChange(result.value);
      return;
    }

    setError(isIncompleteNumericDraft(raw) ? null : result.error);
  }

  function handleBlur() {
    const result = validateNumberFieldInput(draft, min, max);
    setIsEditing(false);

    if (result.value === null) {
      setDraft(displayValue);
      setError(result.error ? `${result.error} The previous value was kept.` : null);
      return;
    }

    setError(null);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;

    event.preventDefault();
    const parsed = parseLocaleNumber(draft);
    const base = parsed ?? (Number.isFinite(value) ? value : min);
    const direction = event.key === "ArrowUp" ? 1 : -1;
    const next = roundForStep(clamp(base + direction * step, min, max), step, base);

    setDraft(String(next));
    setError(null);
    onChange(next);
  }

  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <span className="field__control">
        <input
          aria-describedby={[helper ? helperId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined}
          aria-errormessage={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          aria-label={`${label}${unit ? ` ${unit}` : ""}`}
          aria-valuemax={max}
          aria-valuemin={min}
          aria-valuenow={getNumberFieldAriaValue(draft, min, max)}
          inputMode="decimal"
          role="spinbutton"
          type="text"
          placeholder={placeholder}
          value={draft}
          onBlur={handleBlur}
          onChange={(event) => handleChange(event.target.value)}
          onFocus={() => setIsEditing(true)}
          onKeyDown={handleKeyDown}
        />
        {unit ? <span className="field__unit">{unit}</span> : null}
      </span>
      {helper ? <span className="field__helper" id={helperId}>{helper}</span> : null}
      {error ? (
        <span className="inline-error" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function isIncompleteNumericDraft(raw: string): boolean {
  return /^[+-]?(?:\d+[.,]?|[.,]?)$/.test(raw.trim());
}

function clamp(value: number, min: number, max?: number): number {
  return Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min, value));
}

function roundForStep(value: number, step: number, base: number): number {
  const decimalPlaces = Math.max(fractionDigits(step), fractionDigits(base));
  return Number(value.toFixed(decimalPlaces));
}

function fractionDigits(value: number): number {
  return String(value).split(".")[1]?.length ?? 0;
}
