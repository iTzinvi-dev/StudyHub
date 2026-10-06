import React from 'react';
import katex from 'katex';

interface KatexTextProps {
  content: string;
  className?: string;
}

export const KatexText: React.FC<KatexTextProps> = ({ content, className = '' }) => {
  // Parse content for block math ($$...$$) and inline math ($...$)
  const renderFormatted = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      // Check for headings
      if (line.startsWith('### ')) {
        return (
          <h3 key={lineIdx} className="text-lg font-serif text-[#FFD700] mt-3 mb-1.5 font-medium">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('#### ')) {
        return (
          <h4 key={lineIdx} className="text-sm font-semibold text-[#FFFFCC] mt-2 mb-1">
            {line.replace('#### ', '')}
          </h4>
        );
      }

      // Check if line is block equation
      const blockMatch = line.match(/^\s*\$\$(.+?)\$\$\s*$/);
      if (blockMatch) {
        try {
          const html = katex.renderToString(blockMatch[1].trim(), {
            displayMode: true,
            throwOnError: false
          });
          return (
            <div
              key={lineIdx}
              className="my-3 py-2 px-3 bg-[#2A2A05]/60 rounded-lg overflow-x-auto text-center border border-[#FFD700]/15"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <pre key={lineIdx} className="text-xs text-[#FFD700]">{line}</pre>;
        }
      }

      // Parse inline math ($...$) and bold (**...**) within line
      const parts: React.ReactNode[] = [];
      const regex = /(\$\$[\s\S]+?\$\$|\$.+?\$|\*\*.+?\*\*)/g;
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }

        const token = match[0];
        if (token.startsWith('$$') && token.endsWith('$$')) {
          const formula = token.slice(2, -2).trim();
          try {
            const html = katex.renderToString(formula, { displayMode: true, throwOnError: false });
            parts.push(
              <span
                key={`${lineIdx}-${match.index}`}
                className="block my-2 overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            parts.push(token);
          }
        } else if (token.startsWith('$') && token.endsWith('$')) {
          const formula = token.slice(1, -1).trim();
          try {
            const html = katex.renderToString(formula, { displayMode: false, throwOnError: false });
            parts.push(
              <span
                key={`${lineIdx}-${match.index}`}
                className="inline-block px-1 text-[#FFD700]"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            parts.push(token);
          }
        } else if (token.startsWith('**') && token.endsWith('**')) {
          parts.push(
            <strong key={`${lineIdx}-${match.index}`} className="text-[#FFFFCC] font-semibold">
              {token.slice(2, -2)}
            </strong>
          );
        }

        lastIndex = regex.lastIndex;
      }

      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      return (
        <p key={lineIdx} className="min-h-[1.25rem] leading-relaxed my-1">
          {parts.length > 0 ? parts : ' '}
        </p>
      );
    });
  };

  return <div className={`space-y-1 text-sm text-[#E6E6B8] ${className}`}>{renderFormatted(content)}</div>;
};
