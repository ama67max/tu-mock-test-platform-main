import React, { useEffect, useState } from 'react';
import * as adminApi from '../../api/adminApi';
import LoadingSpinner from '../common/LoadingSpinner';

export default function ExamCreator({ onSubmit, initial = {}, submitting = false }) {
  const [title, setTitle] = useState(initial.title || '');
  const [description, setDescription] = useState(initial.description || '');
  const [categoryId, setCategoryId] = useState(initial.categoryId || '');
  // categories to load questions from (allows selecting questions from multiple categories)
  const [questionSourceCategories, setQuestionSourceCategories] = useState(initial.questionSourceCategories || (initial.categoryId ? [initial.categoryId] : []));
  const [durationMinutes, setDurationMinutes] = useState(initial.durationMinutes || 60);
  const [totalMarks, setTotalMarks] = useState(initial.totalMarks || 100);
  const [passingMarks, setPassingMarks] = useState(initial.passingMarks || 50);
  const [isPublished, setIsPublished] = useState(initial.isPublished || false);
  const [startTime, setStartTime] = useState(initial.startTime ? initial.startTime.split('T')[0] : '');
  const [startTimeHour, setStartTimeHour] = useState(initial.startTime ? new Date(initial.startTime).getHours().toString().padStart(2, '0') : '09');
  const [endTime, setEndTime] = useState(initial.endTime ? initial.endTime.split('T')[0] : '');
  const [endTimeHour, setEndTimeHour] = useState(initial.endTime ? new Date(initial.endTime).getHours().toString().padStart(2, '0') : '17');
  const [questionIds, setQuestionIds] = useState(initial.questionIds || []);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (categoryId) {
      // ensure primary category is included in source categories
      setQuestionSourceCategories((prev) => (prev && prev.length ? (prev.includes(categoryId) ? prev : [categoryId, ...prev]) : [categoryId]));
      setQuestionIds([]);
      // load questions from currently selected source categories (which will include primary)
      loadQuestions(questionSourceCategories.length ? questionSourceCategories : [categoryId]);
    } else {
      setAvailableQuestions([]);
    }
  }, [categoryId]);

  // reload questions whenever the selected source categories change
  useEffect(() => {
    if (!categoryId) return;
    if (!questionSourceCategories || questionSourceCategories.length === 0) {
      setAvailableQuestions([]);
      return;
    }
    loadQuestions(questionSourceCategories);
  }, [questionSourceCategories]);

  async function loadCategories() {
    try {
      const res = await adminApi.getAdminCategories();
      const categoryList = Array.isArray(res) ? res : res?.data || [];
      setCategories(categoryList);
    } catch (e) {
      console.error('Failed to load categories:', e);
    } finally {
      setLoading(false);
    }
  }

  async function loadQuestions(catIds) {
    setQuestionsLoading(true);
    try {
      const ids = Array.isArray(catIds) ? catIds : [catIds];
      // fetch questions for each category and combine
      const combined = [];
      for (const id of ids) {
        try {
          const res = await adminApi.getQuestions({ categoryId: id, limit: 200 });
          const payload = res?.data || res;
          const questionList = Array.isArray(payload)
            ? payload
            : payload?.questions || payload?.data || [];
          combined.push(...questionList);
        } catch (innerErr) {
          console.warn('Failed to load questions for category', id, innerErr);
        }
      }
      // dedupe by id
      const uniq = [];
      const seen = new Set();
      for (const q of combined) {
        if (!q || !q.id) continue;
        if (seen.has(q.id)) continue;
        seen.add(q.id);
        uniq.push(q);
      }
      setAvailableQuestions(uniq);
    } catch (e) {
      console.error('Failed to load questions:', e);
      setAvailableQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  }

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) return;

    try {
      setCreatingCategory(true);
      const slug = newCategoryName.trim().toLowerCase().replace(/\s+/g, '-');
      const res = await adminApi.createAdminCategory({
        name: newCategoryName.trim(),
        slug,
      });
      const newCategory = res?.data || res;
      setCategories((prev) => [...prev, newCategory]);
      setCategoryId(newCategory.id);
      setNewCategoryName('');
      setShowCreateCategory(false);
    } catch (e) {
      console.error('Failed to create category:', e);
      alert('Failed to create category: ' + (e.message || 'Unknown error'));
    } finally {
      setCreatingCategory(false);
    }
  }

  function toggleQuestion(questionId) {
    setQuestionIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!title || !categoryId) {
      alert('Title and Category are required');
      return;
    }

    if (questionIds.length === 0) {
      alert('Please assign at least one question to the exam.');
      return;
    }

    const payload = {
      title,
      description,
      categoryId,
      durationMinutes: Number(durationMinutes),
      totalMarks: Number(totalMarks),
      passingMarks: Number(passingMarks),
      isPublished,
      questionIds,
    };

    if (startTime) {
      payload.startTime = `${startTime}T${startTimeHour}:00:00Z`;
    }

    if (endTime) {
      payload.endTime = `${endTime}T${endTimeHour}:00:00Z`;
    }

    onSubmit && onSubmit(payload);
    
    // Reset form after successful submission (optional - parent can handle this)
    setTitle('');
    setDescription('');
    setQuestionIds([]);
    setIsPublished(false);
    setStartTime('');
    setEndTime('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-surface-container-lowest rounded-xl border border-surface-variant p-6 max-w-4xl">
      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1">Exam Title *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-surface-variant rounded-lg text-on-surface bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary"
          placeholder="Enter exam title"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-surface-variant rounded-lg text-on-surface bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary resize-none"
          placeholder="Describe the exam..."
          rows="3"
        />
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1">Category *</label>
        {showCreateCategory ? (
          <div className="space-y-2 mb-3 p-3 bg-primary/10 rounded-lg border border-primary">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter category name (e.g., Engineering)"
              className="w-full px-3 py-2 border border-surface-variant rounded-lg text-on-surface"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={creatingCategory || !newCategoryName.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {creatingCategory ? 'Creating...' : 'Create Category'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateCategory(false);
                  setNewCategoryName('');
                }}
                className="px-4 py-2 bg-secondary/20 text-on-surface rounded-lg text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
        <div className="grid gap-3 mb-2 sm:grid-cols-[minmax(0,1fr)_minmax(10rem,0.7fr)]">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="input-base h-11 w-full"
            disabled={loading}
            required
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <div className="flex min-w-0 flex-col">
            <label className="text-xs text-secondary">Load questions from</label>
            <select
              multiple
              value={questionSourceCategories}
              onChange={(e) => setQuestionSourceCategories(Array.from(e.target.selectedOptions, (o) => o.value))}
              className="input-base h-11 w-full"
              disabled={loading}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
        {!showCreateCategory && (
          <button
            type="button"
            onClick={() => setShowCreateCategory(true)}
            className="min-h-11 bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary"
          >
            + New Category
          </button>
        )}
        {categories.length === 0 && !showCreateCategory && (
          <p className="text-xs text-warning-700">Create a category first</p>
        )}
      </div>

      {/* Duration & Total Marks */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1">Duration (minutes) *</label>
          <input
            type="number"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            className="w-full px-3 py-2 border border-surface-variant rounded-lg text-on-surface bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary"
            min="1"
            max="300"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1">Total Marks *</label>
          <input
            type="number"
            value={totalMarks}
            onChange={(e) => setTotalMarks(e.target.value)}
            className="w-full px-3 py-2 border border-surface-variant rounded-lg text-on-surface bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary"
            min="1"
            required
          />
        </div>
      </div>

      {/* Passing Marks */}
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1">Passing Marks</label>
        <input
          type="number"
          value={passingMarks}
          onChange={(e) => setPassingMarks(e.target.value)}
          className="w-full px-3 py-2 border border-surface-variant rounded-lg text-on-surface bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary"
          min="0"
          max={totalMarks}
        />
      </div>

      {/* Start Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1">Start Date & Time</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="flex-1 px-3 py-2 border border-surface-variant rounded-lg text-on-surface bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <input
              type="number"
              min="0"
              max="23"
              value={startTimeHour}
              onChange={(e) => setStartTimeHour(e.target.value.padStart(2, '0'))}
              placeholder="HH"
              className="w-16 px-2 py-2 border border-surface-variant rounded-lg text-on-surface bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1">End Date & Time</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="flex-1 px-3 py-2 border border-surface-variant rounded-lg text-on-surface bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <input
              type="number"
              min="0"
              max="23"
              value={endTimeHour}
              onChange={(e) => setEndTimeHour(e.target.value.padStart(2, '0'))}
              placeholder="HH"
              className="w-16 px-2 py-2 border border-surface-variant rounded-lg text-on-surface bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Is Published */}
      <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg border border-primary">
        <input
          type="checkbox"
          id="isPublished"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="w-4 h-4 text-primary border-surface-variant rounded focus:ring-primary cursor-pointer"
        />
        <label htmlFor="isPublished" className="text-sm font-semibold text-on-surface cursor-pointer">
          Publish Exam (make it live for students)
        </label>
      </div>

      {/* Questions Selection */}
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-3">Assign Questions</label>
        {!categoryId ? (
          <div className="p-4 bg-surface-container rounded-lg border border-surface-variant text-secondary text-sm">
            Select a category above to load questions for this exam.
          </div>
        ) : questionsLoading ? (
          <div className="p-4 bg-surface-container rounded-lg border border-surface-variant text-secondary text-sm">
            <LoadingSpinner size="sm" label="Loading questions..." />
          </div>
        ) : availableQuestions.length === 0 ? (
          <div className="p-4 bg-warning-50 border border-warning-600 rounded-lg text-warning-700 text-sm">
            No questions available in this category. Create questions first.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto border border-surface-variant rounded-lg p-3 bg-surface-container-low">
            {availableQuestions.map((question) => (
              <label
                key={question.id}
                className="flex items-start gap-3 p-2 hover:bg-surface-container-highest rounded cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={questionIds.includes(question.id)}
                  onChange={() => toggleQuestion(question.id)}
                  className="mt-1 w-4 h-4 text-primary border-surface-variant rounded focus:ring-primary cursor-pointer"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-on-surface break-words">{question.questionText}</p>
                  <p className="text-xs text-secondary mt-1">
                    Marks: {question.marks} | Difficulty: {question.difficulty}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}
        <p className="text-xs text-secondary mt-2">
          {questionIds.length} question{questionIds.length !== 1 ? 's' : ''} selected
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={!categoryId || loading || submitting}
          className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
        >
          {submitting ? 'Saving...' : 'Save Exam'}
        </button>
        {questionIds.length === 0 && categoryId && (
          <p className="text-xs text-warning-700 self-center">
            Select at least one question to save
          </p>
        )}
      </div>
    </form>
  );
}
