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

  const handleExport = () => {
    const blob = new Blob([localCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bot-script.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setLocalCode(content);
        try {
          // eslint-disable-next-line no-new-func
          const fn = new Function(content);
          fn();
          setError(null);
          onCodeChange(content);
        } catch (err: any) {
          setError(`Import validation error: ${err.message}`);
          onCodeChange(content);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="json-editor-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="editor-header">
        <h2>JavaScript Action Editor</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            className="theme-toggle" 
            style={{ padding: '0.35rem 0.6rem', fontSize: '0.725rem' }} 
            onClick={handleExport}
            title="Export bot script as JS file"
          >
            📥 Export
          </button>
          <label 
            className="theme-toggle" 
            style={{ padding: '0.35rem 0.6rem', fontSize: '0.725rem', margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="Import bot script from JS or JSON file"
          >
            📤 Import
            <input 
              type="file" 
              accept=".js,.json" 
              style={{ display: 'none' }} 
              onChange={handleImport} 
            />
          </label>
          <button className="apply-btn" onClick={handleApply}>Save & Apply</button>
        </div>
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
