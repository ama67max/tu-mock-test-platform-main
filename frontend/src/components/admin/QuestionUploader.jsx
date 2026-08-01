import React, { useState } from 'react';

export default function QuestionUploader({ onSubmit, initial = {} }) {
  const [text, setText] = useState(initial.text || '');
  const [options, setOptions] = useState(initial.options || ['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(initial.correctIndex ?? 0);
  const [marks, setMarks] = useState(initial.marks || 1);

  function handleOptionChange(idx, val) {
    const copy = [...options];
    copy[idx] = val;
    setOptions(copy);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!text) return;
    onSubmit && onSubmit({ text, options, correctIndex: Number(correctIndex), marks: Number(marks) });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-white dark:bg-gray-800 rounded p-4">
      <div>
        <label className="block text-sm text-gray-600">Question</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full px-2 py-1 border rounded" />
      </div>
      <div className="grid grid-cols-1 gap-2">
        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input value={opt} onChange={(e) => handleOptionChange(idx, e.target.value)} className="flex-1 px-2 py-1 border rounded" />
            <label className="text-sm">Correct</label>
            <input type="radio" name="correct" checked={correctIndex === idx} onChange={() => setCorrectIndex(idx)} />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <div>
          <label className="block text-sm text-gray-600">Marks</label>
          <input type="number" value={marks} onChange={(e) => setMarks(e.target.value)} className="px-2 py-1 border rounded w-24" />
        </div>
        <div className="flex-1 text-right">
          <button type="submit" className="px-3 py-1 bg-indigo-600 text-white rounded">Add Question</button>
        </div>
      </div>
    </form>
  );
}
