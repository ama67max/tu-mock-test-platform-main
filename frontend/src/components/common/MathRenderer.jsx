import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import 'katex/contrib/mhchem';

/**
 * MathRenderer
 * - Renders mixed content strings containing inline ($...$), display ($$...$$)
 *   KaTeX markup and chemistry macros like \ce{H2O} (mhchem) correctly.
 * - Usage: <MathRenderer content={text} />
 *
 * Behavior:
 * - Finds $$...$$ first (display math) then $...$ (inline) and renders them via katex.
 * - In plain text segments (outside $...$), detects \ce{...} and renders that with katex
 *   so chemistry formulas are displayed even without math delimiters.
 */

function renderKaTeX(expr, displayMode = false) {
  try {
    // throwOnError=false so invalid markup doesn't break the page
    return katex.renderToString(expr, { displayMode, throwOnError: false });
  } catch (e) {
    // Fallback: escape and return raw text
    return `<span class="katex-error">${String(expr)}</span>`;
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default function MathRenderer({ content = '', className = '' }) {
  // If content is not a string, coerce
  const text = typeof content === 'string' ? content : String(content);

  const html = useMemo(() => {
    // Regex to capture display ($$...$$) and inline ($...$). Non-greedy.
    const regex = /(\$\$([\s\S]+?)\$\$)|(\$([^\$\n][\s\S]*?)\$)/g;

    let lastIndex = 0;
    const parts = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
      const matchStart = match.index;
      const matchStr = match[0];

      // Push preceding plain text
      if (matchStart > lastIndex) {
        const plain = text.slice(lastIndex, matchStart);
        parts.push({ type: 'text', value: plain });
      }

      if (match[1]) {
        // Display math ($$...$$) captured in group 2
        parts.push({ type: 'math', value: match[2], display: true });
      } else if (match[3]) {
        // Inline math ($...$) captured in group 4
        parts.push({ type: 'math', value: match[4], display: false });
      }

      lastIndex = regex.lastIndex;
    }

    // Trailing text
    if (lastIndex < text.length) {
      parts.push({ type: 'text', value: text.slice(lastIndex) });
    }

    // For each part, convert to HTML
    const rendered = parts
      .map((p) => {
        if (p.type === 'math') {
          // Render math with KaTeX
          return renderKaTeX(p.value, !!p.display);
        }

        // p.type === 'text'
        let segment = escapeHtml(p.value);

        // Replace \ce{...} occurrences in plain text with rendered katex (mhchem)
        // Use a regex to find all \ce{...} occurrences (non-greedy braces)
        segment = segment.replace(/\\ce\{([^}]+)\}/g, (m, inner) => {
          // inner already escaped from escapeHtml; unescape before passing to katex
          const unescaped = inner.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
          return renderKaTeX(`\\ce{${unescaped}}`, false);
        });

        // Also support inline math that may have been written as \( ... \) or display as \[ ... \]
        // Replace \( ... \) with rendered inline math
        segment = segment.replace(/\\\(([^)]+)\\\)/g, (m, inner) => renderKaTeX(inner, false));
        // Replace \[ ... \] with rendered display math
        segment = segment.replace(/\\\[([\s\S]+?)\\\]/g, (m, inner) => renderKaTeX(inner, true));

        return segment;
      })
      .join('');

    return rendered;
  }, [text]);

  return (
    <div
      className={className}
      // KaTeX produces HTML; using dangerouslySetInnerHTML is required to inject it
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
