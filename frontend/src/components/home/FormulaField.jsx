import React from 'react';

const FORMULAS = [
  { value: 'F = ma', className: 'formula-field__formula--one' },
  { value: 'E = mc²', className: 'formula-field__formula--two' },
  { value: '∫ v dt = Δs', className: 'formula-field__formula--three' },
  { value: 'pH = −log[H⁺]', className: 'formula-field__formula--four' },
  { value: 'x = (−b ± √Δ) / 2a', className: 'formula-field__formula--five' },
  { value: 'P(A) = n(A) / n(S)', className: 'formula-field__formula--six' },
  { value: 'sin²θ + cos²θ = 1', className: 'formula-field__formula--seven' },
  { value: 'PV = nRT', className: 'formula-field__formula--eight' },
  { value: 'a² + b² = c²', className: 'formula-field__formula--nine' },
  { value: 'v = u + at', className: 'formula-field__formula--ten' },
  { value: 'λ = h / p', className: 'formula-field__formula--eleven' },
  { value: 'remember: units first', className: 'formula-field__formula--twelve' },
  { value: '∑ F = 0', className: 'formula-field__formula--thirteen' },
  { value: 'n = m / M', className: 'formula-field__formula--fourteen' },
];

export default function FormulaField() {
  return (
    <div className="formula-field" aria-hidden="true">
      {FORMULAS.map((formula) => (
        <span key={formula.value} className={`formula-field__formula ${formula.className}`}>
          {formula.value}
        </span>
      ))}
      <span className="formula-field__rule formula-field__rule--one" />
      <span className="formula-field__rule formula-field__rule--two" />
    </div>
  );
}
