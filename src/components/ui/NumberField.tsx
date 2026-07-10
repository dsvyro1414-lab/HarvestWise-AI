interface NumberFieldProps {
  label: string;
  value: number;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
  placeholder?: string;
  emptyWhenZero?: boolean;
  onChange: (value: number) => void;
}

export function NumberField({
  label,
  value,
  unit,
  step = 1,
  min = 0,
  max,
  placeholder,
  emptyWhenZero = false,
  onChange,
}: NumberFieldProps) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <span className="field__control">
        <input
          min={min}
          max={max}
          step={step}
          type="number"
          placeholder={placeholder}
          value={emptyWhenZero && value === 0 ? "" : Number.isFinite(value) ? value : 0}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        {unit ? <span className="field__unit">{unit}</span> : null}
      </span>
    </label>
  );
}
