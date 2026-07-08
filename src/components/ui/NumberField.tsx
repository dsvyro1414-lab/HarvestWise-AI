interface NumberFieldProps {
  label: string;
  value: number;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function NumberField({
  label,
  value,
  unit,
  step = 1,
  min = 0,
  max,
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
          value={Number.isFinite(value) ? value : 0}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        {unit ? <span className="field__unit">{unit}</span> : null}
      </span>
    </label>
  );
}
