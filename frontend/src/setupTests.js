// Polyfill ResizeObserver for jsdom environment used by Vitest
class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}

global.ResizeObserver = global.ResizeObserver || ResizeObserver;

import '@testing-library/jest-dom';
