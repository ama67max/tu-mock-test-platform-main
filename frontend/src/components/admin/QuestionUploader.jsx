import React, { useEffect, useState } from 'react';

export default function QuestionUploader({
  onSubmit,
  initial = {},
  categories = [],
  selectedCategoryId,
  onCategoryChange,
}) {
  const [text, setText] = useState(initial.questionText || initial.text || '');
  const [options, setOptions] = useState(initial.options || ['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(initial.correctIndex ?? 0);
  const [marks, setMarks] = useState(initial.marks || 1);
  const [difficulty, setDifficulty] = useState(initial.difficulty || 'MEDIUM');
  const [explanation, setExplanation] = useState(initial.explanation || '');

  useEffect(() => {
    if (!selectedCategoryId && categories[0]?.id) {
      onCategoryChange?.(categories[0].id);
    }
  }, [categories, selectedCategoryId, onCategoryChange]);

  function handleOptionChange(idx, val) {
    const copy = [...options];
    copy[idx] = val;
    setOptions(copy);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    if (!selectedCategoryId || !categories.some((category) => category.id === selectedCategoryId)) {
      alert('Please select a valid category before creating the question.');
      return;
    }

    const cleanOptions = options.map((opt) => opt.trim()).filter(Boolean);
    if (cleanOptions.length < 2) return;

    const safeCorrectIndex = Number.isInteger(Number(correctIndex)) ? Number(correctIndex) : 0;
    const correctAnswer = cleanOptions[safeCorrectIndex] || options[safeCorrectIndex]?.trim();

    if (!correctAnswer) {
      alert('Please choose a valid correct answer option.');
      return;
    }

    onSubmit &&
      onSubmit({
        categoryId: selectedCategoryId,
        questionText: text.trim(),
        options: cleanOptions,
        correctAnswer,
        difficulty,
        explanation: explanation.trim(),
        marks: Number(marks),
      });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-surface-container p-4">
      <div>
        <label className="mb-1 block text-sm font-semibold text-primary">Category</label>
        <select
          value={selectedCategoryId || ''}
          onChange={(e) => onCategoryChange?.(e.target.value)}
          className="input-base h-11 w-full"
        >
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-primary">Question</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} className="input-base min-h-28 w-full resize-y" rows={4} />
      </div>

      <div className="grid grid-cols-1 gap-2">
        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="w-6 text-sm font-semibold">{String.fromCharCode(65 + idx)}</span>
            <input
              value={opt}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              className="input-base h-11 min-w-0 flex-1"
            />
            <label className="flex min-h-11 shrink-0 items-center gap-2 text-sm text-primary"><span>Correct</span>
            <input type="radio" name="correct" checked={correctIndex === idx} onChange={() => setCorrectIndex(idx)} />
            </label>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-sm font-semibold text-primary">Difficulty</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input-base h-11 w-full">
            <option value="EASY">EASY</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HARD">HARD</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-primary">Marks</label>
          <input type="number" min="1" value={marks} onChange={(e) => setMarks(e.target.value)} className="input-base h-11 w-full" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-primary">Explanation (optional)</label>
        <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} className="input-base min-h-24 w-full resize-y" rows={3} />
      </div>

      <div className="text-right">
        <button type="submit" className="min-h-11 bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary">
          Add Question
        </button>
      </div>
    </form>
  );
}
