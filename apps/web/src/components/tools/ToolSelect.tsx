'use client';

import { Dropdown, DropdownOption } from '@/components/ui/Dropdown';

type Option = {
  value: string;
  label: string;
};

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
};

export default function ToolSelect({ label, value, onChange, options }: Props) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-fg">{label}</label>
      <Dropdown value={value} onChange={onChange}>
        {options.map((opt) => (
          <DropdownOption key={opt.value} value={opt.value}>{opt.label}</DropdownOption>
        ))}
      </Dropdown>
    </div>
  );
}
