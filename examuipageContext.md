This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
ExamCard_spec.md
ExamCard.jsx
ExamNavigation_spec.md
ExamNavigation.jsx
ExamTimer_spec.md
ExamTimer.jsx
OptionSelector_spec.md
OptionSelector.jsx
QuestionPanel_spec.md
QuestionPanel.jsx
```

# Files

## File: ExamCard_spec.md
```markdown
# ExamCard Component Specification

| Field | Value |
| --- | --- |
| File Path | frontend/src/components/exam/ExamCard.jsx |
| Purpose | Reusable card component for displaying an exam summary and launch action. |

## Dependencies

- React
- lucide-react icons
- Button component

## Logic Steps

1. Display exam title, category, duration, and total marks.
2. Show a status badge for published or draft exams.
3. Render a call-to-action button to start or view the exam.
4. Support an optional custom action slot.

## Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| exam | object | yes | Exam data from the API |
| onStart | function | no | Called when the user starts the exam |
| actionLabel | string | no | Button label |
| children | node | no | Optional custom action content |
```

## File: ExamCard.jsx
```javascript
import { Clock3, BookOpen, BadgeCheck, ArrowRight, Download, CheckCircle2, WifiOff } from 'lucide-react';
import Button from '../common/Button';

function ExamCard({
  exam,
  onStart,
  onPrefetch,
  isCached = false,
  isCaching = false,
  actionLabel = 'Start Exam',
  children,
}) {
  if (!exam) return null;

  const duration = exam.durationMinutes || exam.duration || 0;
  const totalMarks = exam.totalMarks || exam.marks || 0;
  const isPublished = exam.isPublished ?? true;

  return (
    <div className="group relative rounded-lg border border-surface-variant bg-surface-container-lowest p-6 shadow-sm transition-all duration-300 hover:border-outline hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                isPublished
                  ? 'bg-success-50 text-success-700 border border-success-600'
                  : 'bg-surface-container-low text-secondary border border-surface-variant'
              }`}
            >
              {isPublished ? 'Published' : 'Draft'}
            </span>

            {isCached ? (
              <span className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-white border border-primary">
                <CheckCircle2 size={12} />
                <span>Offline Ready</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-lg bg-surface-container-low px-2.5 py-1 text-xs font-medium text-secondary border border-surface-variant">
                <WifiOff size={12} />
                <span>Online Only</span>
              </span>
            )}
          </div>

          <h3 className="text-lg font-semibold text-on-surface group-hover:text-primary transition-colors mt-2">
            {exam.title}
          </h3>
          <p className="text-sm text-secondary line-clamp-2 leading-relaxed">{exam.description || 'Practice exam'}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div className="flex items-center gap-2 rounded-lg bg-surface-container-low p-3 border border-surface-variant">
          <BookOpen className="h-4 w-4 text-primary shrink-0" />
          <span className="truncate text-on-surface">{exam.category?.name || exam.category || 'General'}</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-surface-container-low p-3 border border-surface-variant">
          <Clock3 className="h-4 w-4 text-primary shrink-0" />
          <span className="text-on-surface">{duration} mins</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-surface-container-low p-3 border border-surface-variant">
          <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
          <span className="text-on-surface">{totalMarks} marks</span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-surface-variant">
        <div>
          <p className="text-xs text-secondary">
            {exam.passingMarks ? `Passing Mark: ${exam.passingMarks}` : 'Ready to begin'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onPrefetch && !isCached && (
            <button
              type="button"
              onClick={onPrefetch}
              disabled={isCaching}
              className="flex items-center gap-1.5 rounded-lg border border-surface-variant bg-surface-container-low px-3 py-2 text-xs font-semibold text-on-surface transition-all hover:border-outline hover:bg-surface-container disabled:opacity-50"
              title="Download exam for offline access"
            >
              <Download size={14} className={isCaching ? 'animate-bounce' : ''} />
              <span>{isCaching ? 'Saving...' : 'Save Offline'}</span>
            </button>
          )}

          {children || (
            <Button size="sm" onClick={onStart}>
              {actionLabel}
              <ArrowRight size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExamCard;
```

## File: ExamNavigation_spec.md
```markdown
# ExamNavigation Component Specification

| Field | Value |
| --- | --- |
| File Path | frontend/src/components/exam/ExamNavigation.jsx |
| Purpose | Grid-based question navigator for the exam interface. |

## Dependencies

- React

## Logic Steps

1. Render a button for each question in the current exam.
2. Show distinct styles for current, answered, marked, and unanswered questions.
3. Call `onSelect` when a question button is pressed.

## Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| questions | array | yes | List of questions |
| currentIndex | number | yes | Current active question index |
| answers | object | no | Map of selected answers |
| markedForReview | object | no | Map of flagged questions |
| onSelect | function | no | Callback when a question is selected |
```

## File: ExamNavigation.jsx
```javascript
function ExamNavigation({
  questions = [],
  currentIndex = 0,
  answers = {},
  markedForReview = {},
  onSelect,
}) {
  const getStatus = (index) => {
    const questionId = questions[index]?._id || questions[index]?.id || index;
    const isAnswered = answers[questionId] !== undefined;
    const isMarked = Boolean(markedForReview[questionId]);

    if (index === currentIndex) return 'current';
    if (isAnswered && isMarked) return 'answered-marked';
    if (isAnswered) return 'answered';
    if (isMarked) return 'marked';
    return 'unanswered';
  };

  const answeredCount = Object.keys(answers).length;
  const markedCount = Object.keys(markedForReview).length;
  const totalCount = questions.length;

  const getButtonClass = (index) => {
    const status = getStatus(index);
    const base =
      'flex h-11 w-11 items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm';

    switch (status) {
      case 'current':
        return `${base} border-2 border-primary bg-primary text-white scale-105`;
      case 'answered':
        return `${base} border border-success-600 bg-success-50 text-success-700 hover:bg-success-100`;
      case 'marked':
        return `${base} border border-warning-600 bg-warning-50 text-warning-700 hover:bg-warning-100`;
      case 'answered-marked':
        return `${base} border border-primary bg-primary text-white hover:bg-on-surface`;
      default:
        return `${base} border border-surface-variant bg-surface-container-low text-secondary hover:border-outline hover:bg-surface-container hover:text-on-surface`;
    }
  };

  return (
    <div className="rounded-xl border border-surface-variant bg-surface-container-lowest p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-surface-variant">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary">Navigation</h3>
          <p className="text-xs text-secondary mt-1">{totalCount} total questions</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-medium">
          <span className="rounded-lg bg-success-50 border border-success-600 px-2.5 py-1 text-success-700">
            {answeredCount} Done
          </span>
          <span className="rounded-lg bg-warning-50 border border-warning-600 px-2.5 py-1 text-warning-700">
            {markedCount} Flagged
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-5 gap-2.5 sm:grid-cols-6 md:grid-cols-8">
        {questions.map((question, index) => (
          <button
            key={question?._id || question?.id || index}
            type="button"
            onClick={() => onSelect?.(index)}
            className={getButtonClass(index)}
            title={`Question ${index + 1}`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-secondary pt-4 border-t border-surface-variant">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md border border-surface-variant bg-surface-container-low" />
          <span>Unanswered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md border border-success-600 bg-success-50" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md border border-warning-600 bg-warning-50" />
          <span>Flagged</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md border-2 border-primary bg-primary" />
          <span>Current</span>
        </div>
      </div>
    </div>
  );
}

export default ExamNavigation;
```

## File: ExamTimer_spec.md
```markdown
# ExamTimer Component Specification

| Field | Value |
| --- | --- |
| File Path | frontend/src/components/exam/ExamTimer.jsx |
| Purpose | Visual countdown timer for an active exam session. |

## Dependencies

- React
- lucide-react icons

## Logic Steps

1. Render a timer card showing minutes and seconds.
2. Highlight when the timer is low on time.
3. Support an optional label and custom class name.

## Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| seconds | number | yes | Remaining time in seconds |
| label | string | no | Optional label shown above the timer |
| className | string | no | Extra classes |
```

## File: ExamTimer.jsx
```javascript
import { Clock, AlertTriangle } from 'lucide-react';

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function ExamTimer({ seconds, label = 'Time Remaining', className = '' }) {
  const isLowTime = seconds <= 300;

  return (
    <div
      className={`rounded-xl border p-6 shadow-sm transition-all duration-300 ${
        isLowTime
          ? 'border-warning-600 bg-warning-50 text-warning-700'
          : 'border-surface-variant bg-surface-container-lowest text-on-surface'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-secondary">
          <Clock size={18} className={isLowTime ? 'text-warning-700 animate-pulse' : 'text-secondary'} />
          <span>{label}</span>
        </div>

        {isLowTime && (
          <div className="flex items-center gap-1.5 rounded-lg bg-warning-100 px-3 py-1 text-xs font-semibold text-warning-700 border border-warning-600">
            <AlertTriangle size={14} />
            <span>Time running low!</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-3">
        <span className="text-[40px] font-bold tracking-wider font-mono text-on-surface leading-none drop-shadow-sm">
          {formatTime(seconds)}
        </span>
        <span className="text-xs font-medium text-secondary">mins : secs</span>
      </div>
    </div>
  );
}

export default ExamTimer;
```

## File: OptionSelector_spec.md
```markdown
# OptionSelector Component Specification

| Field | Value |
| --- | --- |
| File Path | frontend/src/components/exam/OptionSelector.jsx |
| Purpose | Reusable option choice control for exam answers. |

## Dependencies

- React

## Logic Steps

1. Render a selectable option row with a radio-style indicator.
2. Show the chosen state when `checked` is true.
3. Call `onChange` when the option is selected.

## Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| value | string | yes | Option value |
| label | string | yes | Option label text |
| checked | boolean | no | Whether this option is currently selected |
| onChange | function | no | Callback invoked when selected |
```

## File: OptionSelector.jsx
```javascript
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
```

## File: QuestionPanel_spec.md
```markdown
# QuestionPanel Component Specification

| Field | Value |
| --- | --- |
| File Path | frontend/src/components/exam/QuestionPanel.jsx |
| Purpose | Displays the current question, options, and answer state in the exam interface. |

## Dependencies

- React
- OptionSelector component
- Button component

## Logic Steps

1. Render the question text and number.
2. Show all options using the option selector.
3. Highlight whether the question is marked for review.
4. Support callbacks for answer selection and review toggling.

## Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| question | object | yes | Question data from the exam state |
| selectedValue | any | no | Current selected answer |
| isMarkedForReview | boolean | no | Whether the question is flagged |
| onSelect | function | no | Called when a user chooses an option |
| onToggleReview | function | no | Called when review status changes |
```

## File: QuestionPanel.jsx
```javascript
import { Bookmark, BookmarkCheck } from 'lucide-react';
import Button from '../common/Button';
import OptionSelector from './OptionSelector';

function QuestionPanel({
  question,
  selectedValue,
  isMarkedForReview = false,
  onSelect,
  onToggleReview,
}) {
  if (!question) return null;

  const options = Array.isArray(question.options)
    ? question.options
    : typeof question.options === 'object'
      ? Object.entries(question.options).map(([value, label]) => ({ value, label }))
      : [];

  return (
    <div className="rounded-xl border border-surface-variant bg-surface-container-lowest p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <span className="inline-block rounded-lg bg-surface-container-highest px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary border border-surface-variant">
            Question {question.orderIndex || 1}
          </span>
          <h3 className="mt-3 text-2xl font-semibold leading-snug text-on-surface">
            {question.questionText || question.question || 'No question text available.'}
          </h3>
        </div>

        <button
          type="button"
          onClick={onToggleReview}
          className={`flex shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
            isMarkedForReview
              ? 'border-warning-600 bg-warning-50 text-warning-700'
              : 'border-surface-variant bg-surface-container-low text-secondary hover:border-outline hover:bg-surface-container'
          }`}
        >
          {isMarkedForReview ? <BookmarkCheck size={16} className="text-warning-700" /> : <Bookmark size={16} />}
          <span>{isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}</span>
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {options.map((option) => (
          <OptionSelector
            key={option.value}
            value={option.value}
            label={option.label}
            checked={selectedValue === option.value}
            onChange={() => onSelect?.(option.value)}
          />
        ))}
      </div>
    </div>
  );
}

export default QuestionPanel;
```
