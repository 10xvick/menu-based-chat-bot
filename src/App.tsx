import { useState, useEffect, useMemo } from 'react';
import Chat from './components/chat/chat';
import CodeEditor from './components/editor/CodeEditor';
import TreeVisualizer from './components/TreeVisualizer';
import SplitView from './components/SplitView';

import { dataCode as defaultDataCode } from './data/data';
import { ecommerceExampleCode, itSupportExampleCode, appointmentExampleCode } from './data/examples';

import './style.css';

export const App = () => {
  const [activeCode, setActiveCode] = useState(() => {
    const saved = localStorage.getItem('chatbot_code');
    // Migration: If the user has old nested code from a previous version, ignore it and use default.
    if (saved && saved.includes('startNode:') && saved.includes('ui_controls') && saved.includes('fun_menu')) {
      return saved;
    }
    return defaultDataCode;
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  const [formState, setFormState] = useState<Record<string, string>>({});
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [pathStack, setPathStack] = useState<string[]>([]);
  const [isDocked, setIsDocked] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleCodeChange = (newCode: string) => {
    setActiveCode(newCode);
    localStorage.setItem('chatbot_code', newCode);
    // Reset chat state when code changes
    setFormState({});
    setCurrentNodeId(null);
    setPathStack([]);
  };

  const loadTemplate = (templateName: string) => {
    let newCode;
    switch (templateName) {
      case 'ecommerce':
        newCode = ecommerceExampleCode;
        break;
      case 'it_support':
        newCode = itSupportExampleCode;
        break;
      case 'appointment':
        newCode = appointmentExampleCode;
        break;
      default:
        newCode = defaultDataCode;
    }
    handleCodeChange(newCode);
  };

  // Evaluate the active code to derive the parsed data object for the chat
  const parsedData = useMemo(() => {
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function(activeCode);
      return fn();
    } catch (error) {
      console.error("Failed to parse code:", error);
      return null;
    }
  }, [activeCode]);

  const handleFormUpdate = (field: string, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Bot Builder</h1>
        <div className="header-controls">
          <select
            onChange={(e) => loadTemplate(e.target.value)}
            className="template-selector"
            defaultValue="default"
          >
            <option value="default">Default Banking Template</option>
            <option value="ecommerce">E-commerce Support</option>
            <option value="it_support">IT Support</option>
            <option value="appointment">Appointment Booking</option>
          </select>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>
      </header>

      <main className="main-content">
        {isDocked ? (
          <SplitView
            panes={[
              <TreeVisualizer key="tree" data={parsedData} currentNodeId={currentNodeId} pathStack={pathStack} formState={formState} />,
              <CodeEditor key="editor" code={activeCode} onCodeChange={handleCodeChange} />,
              <Chat
                key="chat"
                data={parsedData}
                onFormUpdate={handleFormUpdate}
                onNodeChange={setCurrentNodeId}
                onPathChange={setPathStack}
                isDocked={isDocked}
                onToggleDock={() => setIsDocked(!isDocked)}
              />
            ]}
          />
        ) : (
          <SplitView
            panes={[
              <TreeVisualizer key="tree" data={parsedData} currentNodeId={currentNodeId} pathStack={pathStack} formState={formState} />,
              <CodeEditor key="editor" code={activeCode} onCodeChange={handleCodeChange} />
            ]}
          />
        )}
      </main>

      {/* Floating Chat component when undocked */}
      {!isDocked && parsedData && (
        <Chat
          data={parsedData}
          onFormUpdate={handleFormUpdate}
          onNodeChange={setCurrentNodeId}
          onPathChange={setPathStack}
          isDocked={isDocked}
          onToggleDock={() => setIsDocked(!isDocked)}
        />
      )}
      {!parsedData && !isDocked && (
        <div className="chat-window"><div className="chat-header">Syntax Error in Code</div></div>
      )}
    </div>
  );
};
