import Editor from '@monaco-editor/react';
import { useTheme } from '../app/ThemeProvider';

interface Props {
  value: string;
  onChange: (value: string) => void;
  height?: number;
  onRun?: () => void;
}

// Monaco configured for SQL. The editor loads its assets from a CDN via the
// @monaco-editor/react loader, which works on static hosting with no backend.
export function SqlEditor({ value, onChange, height = 200, onRun }: Props) {
  const { theme } = useTheme();
  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700">
      <Editor
        height={height}
        language="sql"
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        value={value}
        onChange={(v) => onChange(v ?? '')}
        onMount={(editor, monaco) => {
          // Ctrl/Cmd + Enter runs the query, matching common SQL tools.
          if (onRun) {
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, onRun);
          }
        }}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: 'JetBrains Mono, monospace',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          suggestOnTriggerCharacters: true,
        }}
      />
    </div>
  );
}
