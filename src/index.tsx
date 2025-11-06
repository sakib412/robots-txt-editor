import {autocompletion, type CompletionContext} from '@codemirror/autocomplete';
import {defaultKeymap, history, historyKeymap} from '@codemirror/commands';
import {HighlightStyle, syntaxHighlighting} from '@codemirror/language';
import {type Diagnostic, linter} from '@codemirror/lint';
import {EditorState} from '@codemirror/state';
import {
  EditorView,
  highlightActiveLine,
  keymap,
  lineNumbers,
} from '@codemirror/view';
import {tags} from '@lezer/highlight';
import {useEffect, useRef} from 'react';
import {validateRobotsTxt} from './validator';

interface RobotsTxtEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  onValidation?: (isValid: boolean) => void;
  height?: string;
  readOnly?: boolean;
}

// Syntax highlighting theme
const robotsTxtHighlighting = HighlightStyle.define([
  {tag: tags.comment, color: '#6a9955'},
  {tag: tags.keyword, color: '#0000ff', fontWeight: 'bold'},
  {tag: tags.string, color: '#a31515'},
  {tag: tags.operator, color: '#000'},
]);

// Auto-completion function
function robotsTxtCompletions(context: CompletionContext) {
  const word = context.matchBefore(/\w*/);
  if (!word || (word.from === word.to && !context.explicit)) return null;

  const line = context.state.doc.lineAt(context.pos);
  const lineText = line.text;

  // If at start of line, suggest directives
  if (lineText.trim() === '' || /^\s*\w*$/.test(lineText)) {
    return {
      from: word.from,
      options: [
        {
          label: 'User-agent:',
          type: 'keyword',
          info: 'Specifies which crawler the rules apply to',
        },
        {
          label: 'Disallow:',
          type: 'keyword',
          info: 'Paths that must not be accessed',
        },
        {
          label: 'Allow:',
          type: 'keyword',
          info: 'Paths that may be accessed',
        },
        {
          label: 'Sitemap:',
          type: 'keyword',
          info: 'Location of sitemap file',
        },
        {
          label: 'Crawl-delay:',
          type: 'keyword',
          info: 'Delay between requests (non-standard)',
        },
      ],
    };
  }

  // If after User-agent:, suggest common bots
  if (/user-agent:\s*$/i.test(lineText.substring(0, context.pos - line.from))) {
    return {
      from: word.from,
      options: [
        {label: '*', type: 'constant', info: 'All crawlers'},
        {label: 'Googlebot', type: 'constant', info: 'Google search crawler'},
        {
          label: 'Googlebot-Image',
          type: 'constant',
          info: 'Google image crawler',
        },
        {label: 'Bingbot', type: 'constant', info: 'Bing search crawler'},
        {label: 'Slurp', type: 'constant', info: 'Yahoo crawler'},
        {label: 'DuckDuckBot', type: 'constant', info: 'DuckDuckGo crawler'},
        {label: 'Baiduspider', type: 'constant', info: 'Baidu crawler'},
        {label: 'YandexBot', type: 'constant', info: 'Yandex crawler'},
        {
          label: 'facebookexternalhit',
          type: 'constant',
          info: 'Facebook crawler',
        },
      ],
    };
  }

  // If after Disallow: or Allow:, suggest common paths
  if (
    /(disallow|allow):\s*$/i.test(
      lineText.substring(0, context.pos - line.from),
    )
  ) {
    return {
      from: word.from,
      options: [
        {label: '/', type: 'string', info: 'Block/allow all paths'},
        {label: '/admin/', type: 'string', info: 'Admin directory'},
        {label: '/private/', type: 'string', info: 'Private directory'},
        {label: '/api/', type: 'string', info: 'API directory'},
        {label: '/wp-admin/', type: 'string', info: 'WordPress admin'},
        {label: '/cgi-bin/', type: 'string', info: 'CGI scripts'},
        {label: '/*.pdf$', type: 'string', info: 'All PDF files'},
        {label: '/*?', type: 'string', info: 'URLs with query parameters'},
      ],
    };
  }

  return null;
}

// Linter for real-time validation
const robotsTxtLinter = linter((view) => {
  const content = view.state.doc.toString();
  const result = validateRobotsTxt(content);

  const diagnostics: Diagnostic[] = [];

  // Add errors
  result.errors.forEach((error) => {
    const line = error.line > 0 ? error.line : 1;
    if (line <= view.state.doc.lines) {
      const lineObj = view.state.doc.line(line);
      diagnostics.push({
        from: lineObj.from,
        to: lineObj.to,
        severity: 'error',
        message: error.message,
      });
    }
  });

  // Add warnings
  result.warnings.forEach((warning) => {
    const line = warning.line > 0 ? warning.line : 1;
    if (line <= view.state.doc.lines) {
      const lineObj = view.state.doc.line(line);
      diagnostics.push({
        from: lineObj.from,
        to: lineObj.to,
        severity: 'warning',
        message: warning.message,
      });
    }
  });

  return diagnostics;
});

// Custom theme
const robotsTxtTheme = EditorView.theme({
  '&': {
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#fff',
  },
  '.cm-content': {
    fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
    padding: '10px 0',
    caretColor: '#000000',
  },
  '.cm-gutters': {
    backgroundColor: '#f7f7f7',
    color: '#999',
    border: 'none',
    borderRight: '1px solid #ddd',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#e8f2ff',
  },
  '.cm-activeLine': {
    backgroundColor: '#f0f8ff',
  },
  '.cm-line': {
    padding: '0 4px',
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: '#000000',
  },
  '&.cm-focused .cm-selectionBackground, ::selection': {
    backgroundColor: '#d7d4f0',
  },
  '.cm-tooltip': {
    border: '1px solid #ddd',
    backgroundColor: '#ffffff',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '13px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  '.cm-tooltip-autocomplete': {
    '& > ul > li[aria-selected]': {
      backgroundColor: '#0066cc',
      color: '#ffffff',
    },
  },
  '.cm-diagnostic': {
    padding: '3px 6px 3px 8px',
    marginLeft: '-8px',
    display: 'block',
  },
  '.cm-diagnostic-error': {
    borderLeft: '3px solid #d32f2f',
    backgroundColor: '#ffebee',
  },
  '.cm-diagnostic-warning': {
    borderLeft: '3px solid #f57c00',
    backgroundColor: '#fff3e0',
  },
  '.cm-lintRange-error': {
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='3'%3E%3Cpath d='m0 3 l3 -3 l3 3' stroke='%23d32f2f' fill='none' stroke-width='.7'/%3E%3C/svg%3E\")",
    backgroundRepeat: 'repeat-x',
    backgroundPosition: 'left bottom',
    paddingBottom: '2px',
  },
  '.cm-lintRange-warning': {
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='3'%3E%3Cpath d='m0 3 l3 -3 l3 3' stroke='%23f57c00' fill='none' stroke-width='.7'/%3E%3C/svg%3E\")",
    backgroundRepeat: 'repeat-x',
    backgroundPosition: 'left bottom',
    paddingBottom: '2px',
  },
});

function RobotsTxtEditor({
  initialValue = '',
  onChange,
  onValidation,
  height = '600px',
  readOnly = false,
}: RobotsTxtEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: ignore
  useEffect(() => {
    if (!editorRef.current) return;

    // Create editor state
    const startState = EditorState.create({
      doc: initialValue,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        syntaxHighlighting(robotsTxtHighlighting),
        autocompletion({
          override: [robotsTxtCompletions],
          activateOnTyping: true,
        }),
        robotsTxtLinter,
        robotsTxtTheme,
        EditorView.lineWrapping,
        EditorState.readOnly.of(readOnly),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newValue = update.state.doc.toString();
            onChange?.(newValue);

            // Trigger validation callback
            const result = validateRobotsTxt(newValue);
            onValidation?.(result.isValid);
          }
        }),
      ],
    });

    // Create editor view
    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;

    // Initial validation
    if (onValidation) {
      const result = validateRobotsTxt(initialValue);
      onValidation(result.isValid);
    }

    return () => {
      view.destroy();
    };
  }, []);

  return <div ref={editorRef} style={{height}} />;
}

export default RobotsTxtEditor;
