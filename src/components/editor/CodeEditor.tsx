import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
}

export default function CodeEditor({ code, onCodeChange }: CodeEditorProps) {
  const [localCode, setLocalCode] = useState(code);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocalCode(code);
    setError(null);
  }, [code]);

  const handleApply = () => {
    try {
      // Basic validation: try to evaluate the code to ensure it's valid JS
      // eslint-disable-next-line no-new-func
      const fn = new Function(localCode);
      fn(); // Call it to see if it throws immediately (e.g. ReferenceError for undeclared vars)
      
      setError(null);
      onCodeChange(localCode);
    } catch (e: any) {
      setError(`Execution Error: ${e.message}`);
      // Even if there's an error, we might still want to apply it so the user can fix it,
      // but App.tsx will handle the fallback. We still emit the change so it saves to localStorage.
      onCodeChange(localCode);
    }
  };

  return (
    <div className="json-editor-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="editor-header">
        <h2>JavaScript Action Editor</h2>
        <button className="apply-btn" onClick={handleApply}>Save & Apply</button>
      </div>
      {error && <div className="editor-error">{error}</div>}
      <div style={{ flex: 1, minHeight: 0 }}>
        <Editor
          height="100%"
          defaultLanguage="typescript"
          theme="vs-dark"
          value={localCode}
          onChange={(value) => setLocalCode(value || '')}
          options={{
            'semanticHighlighting.enabled': true,
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>
    </div>
  );
}
