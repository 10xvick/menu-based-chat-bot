import { useEffect, useRef, useState } from 'react';
import { profilepicture_bot, profilepicture_user } from '../../data/data';

interface ChatProps {
  data: any;
  onFormUpdate?: (field: string, value: string) => void;
  onNodeChange?: (nodeId: string) => void;
  onPathChange?: (pathStack: string[]) => void;
  isDocked?: boolean;
  onToggleDock?: () => void;
}

export default function Chat({ data, onFormUpdate, onNodeChange, onPathChange, isDocked = false, onToggleDock }: ChatProps) {
  const [show, setShow] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });

  // Expose a ref to trigger reset from the header
  const resetChatRef = useRef<() => void>(() => {});

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isDocked) return; // Disable dragging if docked
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    posStart.current = { ...position };
    
    const handlePointerMove = (ev: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = ev.clientX - dragStart.current.x;
      const dy = ev.clientY - dragStart.current.y;
      setPosition({
        x: posStart.current.x + dx,
        y: posStart.current.y + dy
      });
    };

    const handlePointerUp = () => {
      isDragging.current = false;
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    
    // @ts-ignore
    e.target.setPointerCapture(e.pointerId);
  };

  return (
    <div 
      className={`chat-window ${isDocked ? 'chat-docked' : ''}`} 
      style={isDocked ? {} : { transform: `translate(${position.x}px, ${position.y}px)` }}
    >
      <div onPointerDown={handlePointerDown} className="chat-header">
        <div className="chat-header-title">
          <span className="status-dot"></span>
          Assistant
        </div>
        <div className="chat-header-actions">
          <button 
            className="chat-toggle-btn" 
            title="Reset Chat"
            onPointerDown={(e) => e.stopPropagation()} 
            onClick={(e) => { e.stopPropagation(); resetChatRef.current(); }}
          >
            ↺
          </button>
          <button 
            className="chat-toggle-btn" 
            onPointerDown={(e) => e.stopPropagation()} 
            onClick={(e) => { e.stopPropagation(); setShow(!show); }}
          >
            {show ? '▼' : '▲'}
          </button>
        </div>
      </div>
      {show && (
        <ChatComponent 
          data={data} 
          closeChat={() => setShow(false)} 
          onFormUpdate={onFormUpdate} 
          onNodeChange={onNodeChange} 
          onPathChange={onPathChange}
          resetChatRef={resetChatRef}
        />
      )}
    </div>
  );
}

function ChatComponent({ data, closeChat, onFormUpdate, onNodeChange, onPathChange, resetChatRef }: ChatProps & { closeChat: () => void, resetChatRef: React.MutableRefObject<() => void> }) {
  const {
    currentNodeId,
    currentNode,
    history,
    selectOption,
    submitInput,
    goBack,
    Bottom,
    triggerReset,
    isRestartPrompt
  } = useChat(data, closeChat, onFormUpdate, onNodeChange, onPathChange);

  useEffect(() => {
    resetChatRef.current = triggerReset;
  }, [triggerReset, resetChatRef]);

  const [inputValue, setInputValue] = useState('');

  const handleInputSubmit = () => {
    if (inputValue.trim() === '') return;
    submitInput(inputValue);
    setInputValue('');
  };

  return (
    <div className="chat-container">
      {history.map(({ message, answer }, index) => (
        <ChatMessage key={index} message={message} isanswer={answer} />
      ))}

      {currentNode?.q && (
        <ChatMessage 
          message={isRestartPrompt ? "Need another help?" : currentNode.q} 
          isanswer={false} 
        />
      )}

      {/* Options if it's a choice node or restart prompt */}
      {(isRestartPrompt 
        ? (data?.nodes?.[data.startNode]?.options || []) 
        : (currentNode?.options || [])
      )
        .concat(isRestartPrompt ? [{ label: "Bye", next: "__CLOSE__" }] : [])
        .map((opt: any, index: number) => (
          <div
            key={index}
            className="chat-message chat-right chat-options"
            onClick={() => selectOption(opt)}
          >
            <ChatMessageChild message={opt.label} isanswer={true} />
          </div>
        ))}

      {/* Text Input if it's an input node and not restart prompt */}
      {!isRestartPrompt && currentNode?.type === 'input' && (
        <div className="chat-input-container">
          <input
            type="text"
            className="chat-text-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
            placeholder="Type your answer here..."
            autoFocus
          />
          <button className="chat-send-btn" onClick={handleInputSubmit}>Send</button>
        </div>
      )}

      {!isRestartPrompt && goBack && (
        <div
          className="chat-message chat-right chat-options"
          onClick={goBack}
        >
          <ChatMessageChild message="⬅️ Go Back" isanswer={true} />
        </div>
      )}

      <Bottom />
    </div>
  );
}

function useChat(data: any, closeChat: () => void, onFormUpdate?: (f: string, v: string) => void, onNodeChange?: (id: string) => void, onPathChange?: (p: string[]) => void) {
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [currentNode, setCurrentNode] = useState<any>(null);
  const [history, sethistory] = useState<any[]>([]);
  const [pathStack, setPathStack] = useState<string[]>([]);
  const [isRestartPrompt, setIsRestartPrompt] = useState(false);
  const ref = useRef<any>(null);

  const Bottom = () => <div ref={ref} style={{ height: 1, flexShrink: 0 }}></div>;

  useEffect(() => {
    // Reset to start node
    if (data?.startNode && data?.nodes) {
      setCurrentNodeId(data.startNode);
      setCurrentNode(data.nodes[data.startNode]);
      sethistory([]);
      setPathStack([data.startNode]);
      setIsRestartPrompt(false);
      if (onNodeChange) onNodeChange(data.startNode);
      if (onPathChange) onPathChange([data.startNode]);
    } else {
      // Fallback if the data is malformed
      setCurrentNodeId(null);
      setCurrentNode({ q: "Error: Invalid script data structure." });
    }
  }, [data]);

  useEffect(() => {
    if (ref.current && ref.current.parentElement) {
      ref.current.parentElement.scrollTo({
        top: ref.current.parentElement.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [currentNode, history, isRestartPrompt]);

  const executeAction = (node: any) => {
    if (typeof node?.action === 'function') {
      try { node.action(); } catch (e) { console.error("Action execution error:", e); }
    } else if (typeof node?.action === 'string') {
      try {
        // eslint-disable-next-line no-new-func
        const fn = new Function(node.action);
        fn();
      } catch (e) { console.error("Action string execution error:", e); }
    }
  };

  const triggerReset = () => {
    const startId = data.startNode;
    setCurrentNodeId(startId);
    setCurrentNode(data.nodes[startId]);
    sethistory([]);
    setPathStack([startId]);
    setIsRestartPrompt(false);
    if (onNodeChange) onNodeChange(startId);
    if (onPathChange) onPathChange([startId]);
  };

  const handleNext = (nextNodeId: string, userMessage: string) => {
    if (nextNodeId === "__RESET__") {
      triggerReset();
      return;
    }
    if (nextNodeId === "__CLOSE__") {
      closeChat();
      return;
    }

    const nextNode = data.nodes[nextNodeId];
    if (nextNode) {
      executeAction(nextNode);
      
      const isDeadEnd = (!nextNode.options || nextNode.options.length === 0) && !nextNode.next && nextNode.type !== 'input';
      const prevBotQ = isRestartPrompt ? "Need another help?" : currentNode.q;
      
      if (isDeadEnd) {
        // Build the history with user's answer, then separately append the dead-end message
        const updatedHistory = [
          ...history,
          { message: prevBotQ, answer: false },
          { message: userMessage, answer: true },
          { message: nextNode.q, answer: false }
        ];
        
        // Transition immediately to startNode on the tree, prompting a restart
        const startId = data.startNode;
        setCurrentNodeId(startId);
        setCurrentNode(data.nodes[startId]);
        setPathStack([startId]);
        sethistory(updatedHistory);
        setIsRestartPrompt(true);
        if (onNodeChange) onNodeChange(startId);
        if (onPathChange) onPathChange([startId]);
      } else {
        // Standard transition
        setCurrentNodeId(nextNodeId);
        setCurrentNode(nextNode);
        
        const newPath = [...pathStack, nextNodeId];
        setPathStack(newPath);
        if (onPathChange) onPathChange(newPath);
        
        sethistory([
          ...history,
          { message: prevBotQ, answer: false },
          { message: userMessage, answer: true },
        ]);
        setIsRestartPrompt(false);
        if (onNodeChange) onNodeChange(nextNodeId);
      }
    }
  };

  const selectOption = (opt: { label: string; next: string }) => {
    handleNext(opt.next, opt.label);
  };

  const submitInput = (value: string) => {
    if (currentNode.field && onFormUpdate) {
      onFormUpdate(currentNode.field, value);
    }
    if (currentNode.next) {
      handleNext(currentNode.next, value);
    }
  };

  const goBack = pathStack.length > 1 ? () => {
    const newStack = [...pathStack];
    newStack.pop();
    const previousNodeId = newStack[newStack.length - 1];
    
    setCurrentNodeId(previousNodeId);
    setCurrentNode(data.nodes[previousNodeId]);
    setPathStack(newStack);
    setIsRestartPrompt(false);
    if (onNodeChange) onNodeChange(previousNodeId);
    if (onPathChange) onPathChange(newStack);

    const newHistory = [...history];
    newHistory.splice(-2);
    sethistory(newHistory);
  } : null;

  return {
    currentNodeId,
    currentNode,
    history,
    selectOption,
    submitInput,
    goBack,
    Bottom,
    triggerReset,
    isRestartPrompt
  };
}

const Icon = ({ image }: { image: string }) => (
  <div className="UserIcon" style={{ backgroundImage: `url(${image})` }}></div>
);

function ChatMessageChild({ message, isanswer }: { message: string, isanswer: boolean }) {
  return (
    <>
      <Icon image={isanswer ? profilepicture_user : profilepicture_bot} />
      <div className="message" style={{ whiteSpace: 'pre-wrap' }}>{message}</div>
    </>
  );
}

function ChatMessage({ message, isanswer }: { message: string, isanswer: boolean }) {
  if (!message) return null;
  return (
    <div className={`chat-message chat-${isanswer ? 'right' : 'left'}`}>
      <ChatMessageChild message={message} isanswer={isanswer} />
    </div>
  );
}
