import React, { useState } from 'react';
import katex from 'katex';
import { Copy, Check } from 'lucide-react';

interface KatexTextProps {
  content: string;
  className?: string;
  inline?: boolean;
}

/**
 * Safely renders a LaTeX formula into HTML.
 * Guaranteed to NEVER output ugly red "KaTeX parse error" messages to the user.
 */
function renderKatexSafe(latex: string, displayMode: boolean): { html: string; isRendered: boolean } {
  let clean = (latex || '').trim();

  // Strip outer delimiters if present
  if (clean.startsWith('$$') && clean.endsWith('$$') && clean.length >= 4) {
    clean = clean.slice(2, -2).trim();
  } else if (clean.startsWith('\\[') && clean.endsWith('\\]') && clean.length >= 4) {
    clean = clean.slice(2, -2).trim();
  } else if (clean.startsWith('\\(') && clean.endsWith('\\)') && clean.length >= 4) {
    clean = clean.slice(2, -2).trim();
  } else if (clean.startsWith('$') && clean.endsWith('$') && clean.length >= 2) {
    clean = clean.slice(1, -1).trim();
  }

  if (!clean) return { html: '', isRendered: true };

  try {
    const html = katex.renderToString(clean, {
      displayMode,
      throwOnError: true,
      strict: false,
      trust: false
    });
    return { html, isRendered: true };
  } catch {
    // If strict fails (e.g. during streaming or edge-case notation), try with throwOnError: false
    try {
      const fallbackHtml = katex.renderToString(clean, {
        displayMode,
        throwOnError: false,
        strict: false
      });
      // KaTeX with throwOnError:false outputs <span class="katex-error">KaTeX parse error:...</span>
      // We NEVER want to show that red error text to the user!
      if (!fallbackHtml.includes('katex-error') && !fallbackHtml.includes('ParseError')) {
        return { html: fallbackHtml, isRendered: true };
      }
    } catch {
      // Ignore
    }

    // Clean, elegant fallback: display cleanly formatted mathematical text without any error messages
    const escaped = clean
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const fallbackMarkup = displayMode
      ? `<div class="my-2.5 py-2 px-3.5 bg-[#0B0F19]/90 rounded-xl text-center font-mono text-xs text-[#38BDF8] border border-white/15 overflow-x-auto tracking-wide shadow-md">${escaped}</div>`
      : `<span class="inline-block font-mono text-[#38BDF8] bg-white/[0.08] px-1.5 py-0.5 rounded text-xs border border-white/10">${escaped}</span>`;

    return { html: fallbackMarkup, isRendered: false };
  }
}

/**
 * Checks if a matched dollar token is likely currency ($100, $5.50, $20/month) rather than LaTeX math
 */
function isCurrency(text: string): boolean {
  return /^\$\d+([.,]\d+)?(\s*(usd|billion|million|k|per|\/.*))?$/i.test(text.trim());
}

/**
 * Code Block component with Copy to Clipboard
 */
const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-2xl overflow-hidden border border-white/15 bg-[#0B0F19]/95 shadow-xl font-mono text-xs">
      <div className="flex items-center justify-between px-3.5 py-2 bg-white/[0.04] border-b border-white/10 text-slate-300">
        <span className="text-[11px] font-semibold text-[#38BDF8] uppercase tracking-wider">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg hover:bg-white/10 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Copy code"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-slate-100 leading-relaxed custom-scrollbar selection:bg-[#0EA5E9]/30">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const KatexText: React.FC<KatexTextProps> = ({ content, className = '', inline = false }) => {
  if (!content) return null;

  // Inline mode: directly parses inline math, bold, and code for titles and options
  if (inline) {
    return <span className={className}>{renderInlineText(content, 0)}</span>;
  }

  // Full block mode: pre-processes display math blocks and code blocks, then processes lines
  return (
    <div className={`space-y-2 text-sm text-slate-200 leading-relaxed font-qurova ${className}`}>
      {renderBlocks(content)}
    </div>
  );
};

/**
 * Renders rich inline spans: math, bold, italic, code, and text
 */
function renderInlineText(text: string, keySeed: number | string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$(?!\s)[\s\S]+?(?<!\s)\$|\\\([\s\S]+?\\\)|\*\*[^*]+?\*\*|`[^`]+?`|\*[^*\n]+?\*)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    const key = `inline-${keySeed}-${match.index}`;

    // Display math embedded inline
    if ((token.startsWith('$$') && token.endsWith('$$')) || (token.startsWith('\\[') && token.endsWith('\\]'))) {
      const { html } = renderKatexSafe(token, true);
      nodes.push(
        <span
          key={key}
          className="block my-2 overflow-x-auto text-center"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
    // Inline math $...$ or \(...\)
    else if ((token.startsWith('$') && token.endsWith('$')) || (token.startsWith('\\(') && token.endsWith('\\)'))) {
      if (isCurrency(token)) {
        nodes.push(token);
      } else {
        const { html } = renderKatexSafe(token, false);
        nodes.push(
          <span
            key={key}
            className="inline-block px-1 align-baseline text-[#38BDF8] font-semibold"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }
    }
    // Bold
    else if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push(
        <strong key={key} className="text-white font-semibold">
          {token.slice(2, -2)}
        </strong>
      );
    }
    // Inline code
    else if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push(
        <code
          key={key}
          className="font-mono text-xs px-1.5 py-0.5 rounded-md bg-white/[0.08] text-[#38BDF8] border border-white/10 mx-0.5"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    // Italic
    else if (token.startsWith('*') && token.endsWith('*')) {
      nodes.push(
        <em key={key} className="text-slate-300 italic">
          {token.slice(1, -1)}
        </em>
      );
    } else {
      nodes.push(token);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.substring(lastIndex));
  }

  return nodes;
}

/**
 * Parses full multi-paragraph, multi-line content into structured React elements
 */
function renderBlocks(rawContent: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];

  const blockRegex = /(```[\s\S]*?```|\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let blockIndex = 0;

  while ((match = blockRegex.exec(rawContent)) !== null) {
    if (match.index > lastIndex) {
      const textChunk = rawContent.substring(lastIndex, match.index);
      parseTextChunk(textChunk, elements, blockIndex++);
    }

    const token = match[0];
    const key = `block-${blockIndex++}`;

    // Code block
    if (token.startsWith('```') && token.endsWith('```')) {
      const firstLineEnd = token.indexOf('\n');
      let lang = 'code';
      let code = '';
      if (firstLineEnd !== -1) {
        lang = token.slice(3, firstLineEnd).trim();
        code = token.slice(firstLineEnd + 1, -3);
      } else {
        code = token.slice(3, -3);
      }
      elements.push(<CodeBlock key={key} language={lang} code={code} />);
    }
    // Display Math Block ($$...$$ or \[...\])
    else {
      const { html } = renderKatexSafe(token, true);
      elements.push(
        <div
          key={key}
          className="my-3 py-2.5 px-4 bg-[#0B0F19]/80 rounded-2xl overflow-x-auto text-center border border-white/10 text-white shadow-inner custom-scrollbar"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    lastIndex = blockRegex.lastIndex;
  }

  if (lastIndex < rawContent.length) {
    const textChunk = rawContent.substring(lastIndex);
    parseTextChunk(textChunk, elements, blockIndex++);
  }

  return elements;
}

/**
 * Parses non-code, non-display-math text lines (headings, lists, quotes, paragraphs)
 */
function parseTextChunk(text: string, elements: React.ReactNode[], chunkId: number) {
  const lines = text.split('\n');
  let lineIdx = 0;

  while (lineIdx < lines.length) {
    const line = lines[lineIdx];
    const trimmed = line.trim();

    if (!trimmed) {
      lineIdx++;
      continue;
    }

    const key = `chunk-${chunkId}-line-${lineIdx}`;

    // Headings
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={key} className="text-xl sm:text-2xl font-nevera text-[#38BDF8] mt-4 mb-2 font-normal">
          {renderInlineText(trimmed.replace(/^#\s+/, ''), key)}
        </h1>
      );
      lineIdx++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={key} className="text-lg sm:text-xl font-nevera text-white mt-3 mb-1.5 font-normal">
          {renderInlineText(trimmed.replace(/^##\s+/, ''), key)}
        </h2>
      );
      lineIdx++;
      continue;
    }
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={key} className="text-base sm:text-lg font-nevera text-[#38BDF8] mt-3 mb-1 font-medium">
          {renderInlineText(trimmed.replace(/^###\s+/, ''), key)}
        </h3>
      );
      lineIdx++;
      continue;
    }
    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4 key={key} className="text-sm font-semibold text-white mt-2.5 mb-1 font-qurova">
          {renderInlineText(trimmed.replace(/^####\s+/, ''), key)}
        </h4>
      );
      lineIdx++;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote
          key={key}
          className="border-l-2 border-[#0EA5E9] bg-white/[0.04] pl-3.5 pr-3 py-1.5 my-2 rounded-r-xl text-xs sm:text-sm text-slate-300 italic"
        >
          {renderInlineText(trimmed.replace(/^>\s+/, ''), key)}
        </blockquote>
      );
      lineIdx++;
      continue;
    }

    // Bullet list item (- or *)
    if (/^[-*]\s+/.test(trimmed)) {
      elements.push(
        <div key={key} className="flex items-start gap-2.5 my-1 pl-1 text-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9] shrink-0 mt-2 shadow-[0_0_6px_#0EA5E9]" />
          <div className="leading-relaxed flex-1">
            {renderInlineText(trimmed.replace(/^[-*]\s+/, ''), key)}
          </div>
        </div>
      );
      lineIdx++;
      continue;
    }

    // Numbered list item (1. 2. etc)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      elements.push(
        <div key={key} className="flex items-start gap-2.5 my-1.5 pl-1 text-sm">
          <span className="px-1.5 py-0.5 rounded-md bg-white/[0.06] text-[#38BDF8] border border-white/10 text-xs font-mono shrink-0 mt-0.5">
            {numMatch[1]}
          </span>
          <div className="leading-relaxed flex-1">
            {renderInlineText(numMatch[2], key)}
          </div>
        </div>
      );
      lineIdx++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={key} className="my-1 leading-relaxed">
        {renderInlineText(trimmed, key)}
      </p>
    );

    lineIdx++;
  }
}
