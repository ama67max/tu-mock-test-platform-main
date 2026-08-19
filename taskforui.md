Task 1: Update CSS Variables in globals.css
Objective: Fix the CSS custom property values to match the specified design requirements for both light and dark modes.

Implementation Guidance:

Light Mode (:root):

Change canvas from #FFFFFF to #F8FAFC
Add new --color-border-shared: 39 39 42 (#27272A)
Update surface values for proper elevation hierarchy
Dark Mode (.dark):

Keep canvas at #000000 (already correct)
Change card/elevated surfaces from #141414/#0a0a0a to #121214
Add the same --color-border-shared: 39 39 42 (#27272A)
Update chart-specific variables for data series colors
Add Chart Color Variables:

css

--chart-primary: for main data series
--chart-secondary: for secondary data
--chart-grid: for grid lines
--chart-text: for axis labels
Demo: After completing this task, toggling between dark and light modes will show:

Light: Off-white canvas with proper contrast
Dark: Pure black canvas with #121214 cards
Both: Consistent #27272A borders
Task 2: Add Dark Mode Color Variants to Tailwind Config
Objective: Update tailwind.config.js to support theme-aware colors using CSS variables, enabling components to automatically adapt to the current theme.

Implementation Guidance:

Add CSS Variable-Based Colors:

js

colors: {
  'canvas': 'rgb(var(--color-bg-primary))',
  'card': 'rgb(var(--color-surface-elevated))',
  'border-shared': 'rgb(var(--color-border-shared))',
  'chart-primary': 'rgb(var(--chart-primary))',
  'chart-secondary': 'rgb(var(--chart-secondary))',
}
Add Chart Data Series Colors:

Define Zinc shades for light mode data
Define lighter shades for dark mode visibility
Update Existing Semantic Tokens:

Ensure background, surface-*, primary, secondary reference CSS variables
Demo: Tailwind classes like bg-canvas, border-border-shared, text-chart-primary will automatically switch values based on the active theme.

Task 3: Make PerformanceChart Theme-Aware
Objective: Update the PerformanceChart.jsx component to dynamically adapt its colors based on the current theme (dark/light mode).

Implementation Guidance:

Import Theme Hook:

jsx

import { useTheme } from '../../contexts/ThemeContext';
Create Theme-Aware Color Configuration:

jsx

const { isDark } = useTheme();

const chartColors = isDark
  ? {
      score: '#E5E5E5',      // Light gray for dark mode
      attempts: '#A1A1AA',   // Medium gray
      grid: 'rgba(255, 255, 255, 0.1)',
      text: '#FAFAFA',
      tooltipBg: '#18181B',
    }
  : {
      score: '#18181B',      // Zinc-900 for light mode
      attempts: '#3F3F46',   // Zinc-700
      grid: 'rgba(0, 0, 0, 0.1)',
      text: '#18181B',
      tooltipBg: '#FFFFFF',
    };
Replace Hardcoded Values:

Replace all #111827, #ffffff, slate-* references
Use chartColors object throughout
Update Skeleton:

Replace bg-slate-900/70 with theme-aware class
Demo: The PerformanceChart on the Dashboard page will display with appropriate colors in both themes — dark data series on light canvas, light data series on dark canvas.

Task 4: Make SubjectBreakdown Theme-Aware
Objective: Update the SubjectBreakdown.jsx component with the same theme-aware color system as PerformanceChart.

Implementation Guidance:

Import Theme Hook and Create Color Config:

Same pattern as Task 3
Replace Hardcoded Colors:

Bar fills, axis labels, tooltips, grid lines
Use dynamic chartColors based on isDark
Update Skeleton and Empty State:

Replace bg-slate-950/80, text-slate-400
Use theme semantic classes
Demo: The Subject Breakdown bar chart will adapt colors appropriately when toggling themes on the Dashboard.

Task 5: Fix ResultPage.jsx to Use Theme System
Objective: Refactor ResultPage.jsx to replace all hardcoded zinc-*, bg-white, text-zinc-* classes with semantic theme tokens.

Implementation Guidance:

Replace Root Container:

jsx

// Before
<div className="min-h-screen bg-white text-zinc-900">

// After
<div className="min-h-screen bg-background text-on-surface">
Replace All Hardcoded Classes:

Before	After
bg-white	bg-surface-container-lowest
bg-zinc-100	bg-surface-container-low
text-zinc-900	text-primary
text-zinc-600	text-secondary
text-zinc-500	text-tertiary
border-black/10	border-surface-variant
bg-black	bg-primary
text-white	text-on-primary
Update Loading and Error States:

Replace hardcoded colors in loading spinner, error display
Use Shared Border:

Apply border-border-shared where appropriate
Demo: The ResultPage will now match the visual style of other pages and properly switch appearance when toggling between dark and light modes.

Task 6: Fix OfflineIndicator Theme Consistency
Objective: Update OfflineIndicator.jsx to use theme semantic colors for status indicators instead of hardcoded green-600, red-600.

Implementation Guidance:

Replace Hardcoded Status Colors:

jsx

// Before
className="bg-gradient-to-r from-green-600 to-green-700"

// After - use success/warning semantic tokens
className="bg-success-600"
Use CSS Variables for Dynamic Colors:

Online state: success-* palette
Offline state: danger-* palette
Update All Variants:

compact, detailed, banner variants should all use semantic colors
Demo: The offline indicator will use consistent semantic colors that work in both themes.

Task 7: Verification and Cross-Page Testing
Objective: Verify that all pages and components properly support both dark and light themes with the correct color values.

Implementation Guidance:

Test Each Page:

Toggle theme on each page
Verify canvas, card, border, text colors match specifications
Check charts render correctly in both modes
Verify Color Values:

Light canvas: #F8FAFC
Dark canvas: #000000
Dark cards: #121214
Shared border: #27272A
Test Components:

Buttons, Cards, Inputs, Badges
Charts (PerformanceChart, SubjectBreakdown)
OfflineIndicator, LoadingSpinner
ExamTimer
Check for Edge Cases:

Low-time warning state in ExamTimer
Error states across pages
Empty data states in charts