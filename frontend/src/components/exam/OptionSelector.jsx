function OptionSelector({ value, label, checked = false, onChange }) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-all duration-200 ${
        checked
          ? 'border-primary bg-primary text-white'
          : 'border-surface-variant bg-surface-container-low hover:border-outline hover:bg-surface-container'
      }`}
    >
      <div className="relative mt-0.5 flex items-center justify-center">
        <input
          type="radio"
          name={value}
          value={value}
          checked={checked}
          onChange={onChange}
          className="peer h-5 w-5 appearance-none rounded-full border-2 border-surface-variant bg-surface-container-lowest checked:border-primary checked:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
        />
        <div className="pointer-events-none absolute h-2 w-2 rounded-full bg-surface opacity-0 peer-checked:opacity-100" />
      </div>
      <span className={`text-base font-normal leading-relaxed ${checked ? 'font-semibold text-white' : 'text-on-surface'}`}>
        {label}
      </span>
    </label>
  );
}

export default OptionSelector;

