import { Check } from 'lucide-react';

function OptionSelector({ value, label, checked = false, onChange, groupName = 'question-option', optionLetter = 'A' }) {
  return (
    <label
      className={`group relative flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-colors transition-shadow duration-150 ease-out ${
        checked
          ? 'border-primary bg-primary text-on-primary shadow-sm'
          : 'border-surface-variant bg-surface-container-low hover:border-outline hover:bg-surface-container'
      }`}
    >
      <input
        type="radio"
        name={groupName}
        value={value}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />

      {/* Option letter badge doubles as the selection indicator: a filled check replaces
          the letter once chosen, so the selected answer is unmistakable at a glance. */}
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 text-body font-bold transition-colors duration-150 ${
          checked
            ? 'border-white bg-white text-primary'
            : 'border-surface-variant bg-surface-container-highest text-secondary group-hover:border-outline'
        }`}
      >
        {checked ? <Check size={18} strokeWidth={3} /> : optionLetter}
      </span>

      <span
        className={`min-w-0 flex-1 text-body leading-6 ${
          checked ? 'font-bold text-on-primary' : 'font-normal text-on-surface'
        }`}
      >
        {label ?? value ?? 'Option'}
      </span>

      {/* Focus ring for keyboard navigation, since the native radio is visually hidden */}
      <span className="pointer-events-none absolute inset-0 rounded-xl ring-primary ring-offset-2 ring-offset-surface-container-lowest peer-focus-visible:ring-2" />
    </label>
  );
}

export default OptionSelector;