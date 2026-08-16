import { useCallback } from 'react';
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import python from 'highlight.js/lib/languages/python';
import yaml from 'highlight.js/lib/languages/yaml';
import markdown from 'highlight.js/lib/languages/markdown';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import plaintext from 'highlight.js/lib/languages/plaintext';

hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('python', python);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('plaintext', plaintext);
hljs.registerLanguage('text', plaintext);

const TERMINAL_LANGS = new Set(['bash', 'shell', 'sh']);
hljs.registerLanguage('sh', bash);

export function BlockCode({ block }) {
  const lang = block.lang || block.language || '';
  const content = block.content || block.code || '';
  const isTerminal = TERMINAL_LANGS.has(lang.toLowerCase());

  const highlighted = useCallback(() => {
    if (!lang) return null;
    try {
      const result = hljs.highlight(content, { language: lang, ignoreIllegals: true });
      return result.value;
    } catch {
      return null;
    }
  }, [content, lang]);

  const html = highlighted();

  return (
    <div className={`block-code-wrap ${isTerminal ? 'block-code-terminal' : 'block-code-editor'}`}>
      {block.label && (
        <div className="block-code-label">
          {isTerminal ? <span className="block-code-label-dot" /> : null}
          {block.label}
        </div>
      )}
      <pre className="block-code" tabIndex={0}>
        {html
          ? <code dangerouslySetInnerHTML={{ __html: html }} />
          : <code>{content}</code>
        }
      </pre>
    </div>
  );
}
