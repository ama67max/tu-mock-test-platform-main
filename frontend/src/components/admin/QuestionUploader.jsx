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
    <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 rounded p-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700">Category</label>
        <select
          value={selectedCategoryId || ''}
          onChange={(e) => onCategoryChange?.(e.target.value)}
          className="w-full px-2 py-2 border rounded"
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
        <label className="block text-sm font-semibold text-gray-700">Question</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full px-2 py-2 border rounded" rows={4} />
      </div>

      <div className="grid grid-cols-1 gap-2">
        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="w-6 text-sm font-semibold">{String.fromCharCode(65 + idx)}</span>
            <input
              value={opt}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              className="flex-1 px-2 py-1 border rounded"
            />
            <label className="text-sm whitespace-nowrap">Correct</label>
            <input type="radio" name="correct" checked={correctIndex === idx} onChange={() => setCorrectIndex(idx)} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700">Difficulty</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full px-2 py-2 border rounded">
            <option value="EASY">EASY</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HARD">HARD</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Marks</label>
          <input type="number" min="1" value={marks} onChange={(e) => setMarks(e.target.value)} className="w-full px-2 py-2 border rounded" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700">Explanation (optional)</label>
        <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} className="w-full px-2 py-2 border rounded" rows={3} />
      </div>

      <div className="text-right">
        <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded font-semibold">
          Add Question
        </button>
      </div>
    </form>
  );
}
