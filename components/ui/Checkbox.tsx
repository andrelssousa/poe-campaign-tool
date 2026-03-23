// src/components/ui/Checkbox.tsx
"use client";

type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
};

export function Checkbox({ checked, onChange, label }: Props) {
  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
      />
      {label ? <span className="text-sm text-zinc-200">{label}</span> : null}
    </label>
  );
}
