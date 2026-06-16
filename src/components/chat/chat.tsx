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
  const resetChatRef = useRef<() => void>(() => { });

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
          {onToggleDock && (
            <button
              className="chat-toggle-btn"
              title={isDocked ? "Undock Chat" : "Dock Chat"}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onToggleDock(); }}
            >
              {isDocked ? '⇱' : '⇲'}
            </button>
          )}
          <button
            className={`chat-toggle-btn chat-status-toggle ${show ? 'open' : 'closed'}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); setShow(!show); }}
            title={show ? "Collapse Assistant" : "Expand Assistant"}
          />
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
    triggerReset,
    isRestartPrompt,
    isTyping,
    displayQuestion
  } = useChat(data, closeChat, onFormUpdate, onNodeChange, onPathChange);

  useEffect(() => {
    resetChatRef.current = triggerReset;
  }, [triggerReset, resetChatRef]);

  const [inputValue, setInputValue] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  // Auto-scroll on content updates
  useEffect(() => {
    scrollToBottom();
    const timer = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timer);
  }, [currentNode, history, isRestartPrompt, isTyping]);

  const handleInputSubmit = () => {
    if (inputValue.trim() === '') return;
    submitInput(inputValue);
    setInputValue('');
  };

  return (
    <div ref={containerRef} className="chat-container">
      {history.map(({ message, answer }, index) => (
        <ChatMessage key={index} message={message} isanswer={answer} onLoadCallback={scrollToBottom} />
      ))}

      {isTyping && <TypingIndicator />}

      {!isTyping && currentNode?.q && (
        <ChatMessage
          message={isRestartPrompt ? "Need another help?" : displayQuestion}
          isanswer={false}
          onLoadCallback={scrollToBottom}
        />
      )}

      {/* Options if it's a choice node or restart prompt */}
      {!isTyping && (isRestartPrompt
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
      {!isTyping && !isRestartPrompt && currentNode?.type === 'input' && (
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

      {!isTyping && !isRestartPrompt && goBack && (
        <div
          className="chat-message chat-right chat-options"
          onClick={goBack}
        >
          <ChatMessageChild message="⬅️ Go Back" isanswer={true} />
        </div>
      )}
    </div>
  );
}

function useChat(data: any, closeChat: () => void, onFormUpdate?: (f: string, v: string) => void, onNodeChange?: (id: string) => void, onPathChange?: (p: string[]) => void) {
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [currentNode, setCurrentNode] = useState<any>(null);
  const [history, sethistory] = useState<any[]>([]);
  const [pathStack, setPathStack] = useState<string[]>([]);
  const [isRestartPrompt, setIsRestartPrompt] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [nodeQuestions, setNodeQuestions] = useState<Record<string, string>>({});
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  // Initial load or data changes
  useEffect(() => {
    if (data?.startNode && data?.nodes) {
      const startId = data.startNode;
      const startNode = data.nodes[startId];

      setIsTyping(true);
      setIsRestartPrompt(false);
      sethistory([]);
      setPathStack([startId]);
      setNodeQuestions({});

      const delay = Math.max(600, Math.min(1200, (startNode.q || '').length * 12));
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        setCurrentNodeId(startId);
        setCurrentNode(startNode);
        if (onNodeChange) onNodeChange(startId);
        if (onPathChange) onPathChange([startId]);
      }, delay);
    } else {
      setCurrentNodeId(null);
      setCurrentNode({ q: "Error: Invalid script data structure." });
    }
  }, [data]);

  const executeAction = (node: any, nodeId: string) => {
    return new Promise<void>((resolve) => {
      let resolved = false;
      const safeResolve = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };

      const updateQuestion = (newQ: string) => {
        setNodeQuestions(prev => ({ ...prev, [nodeId]: newQ }));
        safeResolve();
      };

      let result: any = null;
      if (typeof node?.action === 'function') {
        try {
          result = node.action(updateQuestion);
        } catch (e) {
          console.error("Action execution error:", e);
          safeResolve();
        }
      } else if (typeof node?.action === 'string') {
        try {
          // eslint-disable-next-line no-new-func
          const fn = new Function('updateQuestion', node.action);
          result = fn(updateQuestion);
        } catch (e) {
          console.error("Action string execution error:", e);
          safeResolve();
        }
      } else {
        safeResolve();
      }

      if (result && typeof result.then === 'function') {
        result.then(safeResolve).catch(safeResolve);
      } else {
        const actionFn = typeof node?.action === 'function' ? node.action : null;
        const isSync = !actionFn || actionFn.length === 0;
        if (isSync) {
          safeResolve();
        }
      }
    });
  };

  const triggerReset = () => {
    const startId = data.startNode;
    const startNode = data.nodes[startId];
    setIsTyping(true);
    setIsRestartPrompt(false);
    sethistory([]);
    setPathStack([startId]);
    setNodeQuestions({});

    const delay = Math.max(600, Math.min(1200, (startNode.q || '').length * 12));
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setCurrentNodeId(startId);
      setCurrentNode(startNode);
      if (onNodeChange) onNodeChange(startId);
      if (onPathChange) onPathChange([startId]);
    }, delay);
  };

  const handleTransition = (nextNodeId: string, userMessage: string, currentHistory: any[], currentPathStack: string[]) => {
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
      // Clear dynamic question override before entering the node to avoid flash of old content
      setNodeQuestions(prev => {
        const next = { ...prev };
        delete next[nextNodeId];
        return next;
      });

      const displayQ = currentNodeId ? (nodeQuestions[currentNodeId] || currentNode?.q || '') : '';
      const prevBotQ = isRestartPrompt ? "Need another help?" : displayQ;

      let newHistory = [...currentHistory];
      if (userMessage) {
        newHistory.push({ message: prevBotQ, answer: false });
        newHistory.push({ message: userMessage, answer: true });
      }
      sethistory(newHistory);

      setIsTyping(true);
      setIsRestartPrompt(false);
      setCurrentNode(null);
      setCurrentNodeId(null);

      const delay = Math.max(700, Math.min(1500, (nextNode.q || '').length * 12));

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        const finalize = (hist: any[], path: string[]) => {
          setIsTyping(false);
          const isDeadEnd = (!nextNode.options || nextNode.options.length === 0) && !nextNode.next && nextNode.type !== 'input';

          if (isDeadEnd) {
            const startId = data.startNode;
            setCurrentNodeId(startId);
            setCurrentNode(data.nodes[startId]);
            setPathStack([startId]);
            const finalNodeQ = nodeQuestions[nextNodeId] || nextNode.q;
            sethistory([
              ...hist,
              { message: finalNodeQ, answer: false }
            ]);
            setIsRestartPrompt(true);
            if (onNodeChange) onNodeChange(startId);
            if (onPathChange) onPathChange([startId]);
          } else {
            setCurrentNodeId(nextNodeId);
            setCurrentNode(nextNode);

            setPathStack(path);
            if (onPathChange) onPathChange(path);
            if (onNodeChange) onNodeChange(nextNodeId);
          }
        };

        const newPathStack = [...currentPathStack, nextNodeId];

        if (nextNode.action) {
          setIsTyping(true);

          executeAction(nextNode, nextNodeId).then(() => {
            const isAutoTransition = nextNode.next && (!nextNode.options || nextNode.options.length === 0) && nextNode.type !== 'input';
            if (isAutoTransition) {
              setPathStack(newPathStack);
              if (onPathChange) onPathChange(newPathStack);
              if (onNodeChange) onNodeChange(nextNodeId);

              handleTransition(nextNode.next, '', newHistory, newPathStack);
            } else {
              finalize(newHistory, newPathStack);
            }
          });
        } else {
          finalize(newHistory, newPathStack);
        }
      }, delay);
    }
  };

  const handleNext = (nextNodeId: string, userMessage: string) => {
    handleTransition(nextNodeId, userMessage, history, pathStack);
  };

  // Auto-transition runner for processing / evaluation steps
  useEffect(() => {
    if (currentNode && currentNode.next && (!currentNode.options || currentNode.options.length === 0) && currentNode.type !== 'input' && !isTyping && !isRestartPrompt) {
      const autoDelay = 1500;
      const timer = setTimeout(() => {
        handleNext(currentNode.next, '');
      }, autoDelay);
      return () => clearTimeout(timer);
    }
  }, [currentNode, isTyping, isRestartPrompt]);

  const selectOption = (opt: { label: string; next: string }) => {
    handleNext(opt.next, opt.label);
  };

  const submitInput = (value: string) => {
    if (!currentNode) return;

    const validationError = validateInput(currentNode.field, value);
    if (validationError) {
      const currentDisplayQ = currentNodeId ? (nodeQuestions[currentNodeId] || currentNode?.q || '') : '';
      const prevBotQ = isRestartPrompt ? "Need another help?" : currentDisplayQ;

      let newHistory = [...history];
      newHistory.push({ message: prevBotQ, answer: false });
      newHistory.push({ message: value, answer: true });
      sethistory(newHistory);

      setIsTyping(true);
      setCurrentNode(null);
      setCurrentNodeId(null);

      const delay = Math.max(600, Math.min(1200, validationError.length * 12));
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        sethistory([
          ...newHistory,
          { message: validationError, answer: false }
        ]);
        setCurrentNode(currentNode);
        setCurrentNodeId(currentNodeId);
      }, delay);

      return;
    }

    if (currentNode.field && onFormUpdate) {
      onFormUpdate(currentNode.field, value);
    }
    if (currentNode.next) {
      handleNext(currentNode.next, value);
    }
  };

  const goBack = pathStack.length > 1 ? () => {
    const newStack = [...pathStack];
    const currentId = newStack[newStack.length - 1];

    // Find the first node in the stack that is DIFFERENT from currentId
    // to bypass self-transitions (like re-triggering cat_pic or dad_joke).
    let previousNodeId = currentId;
    let popCount = 0;
    for (let i = newStack.length - 2; i >= 0; i--) {
      if (newStack[i] !== currentId) {
        previousNodeId = newStack[i];
        popCount = newStack.length - 1 - i;
        break;
      }
    }

    if (popCount > 0) {
      newStack.splice(-popCount);
      setCurrentNodeId(previousNodeId);
      setCurrentNode(data.nodes[previousNodeId]);
      setPathStack(newStack);
      setIsRestartPrompt(false);
      if (onNodeChange) onNodeChange(previousNodeId);
      if (onPathChange) onPathChange(newStack);

      // Clean the corresponding history steps
      const newHistory = [...history];
      newHistory.splice(-2 * popCount);
      sethistory(newHistory);
    }
  } : null;

  const displayQuestion = currentNodeId ? (nodeQuestions[currentNodeId] || currentNode?.q) : '';

  return {
    currentNodeId,
    currentNode,
    history,
    selectOption,
    submitInput,
    goBack,
    triggerReset,
    isRestartPrompt,
    isTyping,
    displayQuestion
  };
}

const Icon = ({ image }: { image: string }) => (
  <div className="UserIcon" style={{ backgroundImage: `url(${image})` }}></div>
);

function BlurUpImage({ src, onLoad }: { src: string, onLoad?: () => void }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`blur-up-container ${isLoaded ? 'loaded' : ''}`}>
      <img
        src={src}
        alt="Shared Media"
        loading="lazy"
        decoding="async"
        onLoad={() => {
          setIsLoaded(true);
          if (onLoad) onLoad();
        }}
        className={`blur-up ${isLoaded ? 'loaded' : ''}`}
      />
    </div>
  );
}

function renderMessageContent(message: string, onLoadCallback?: () => void) {
  if (!message) return null;

  // Regex to match any http/https URL
  const urlRegex = /(https?:\/\/\S+)/gi;
  const parts = message.split(urlRegex);

  // If there are no URLs, just return the message
  if (parts.length === 1) {
    return message;
  }

  // Helper to check if a URL is an image
  const isImageUrl = (url: string) => {
    return /\.(?:png|jpg|jpeg|gif|webp)(?:\?\S+)?$/i.test(url);
  };

  return (
    <>
      {parts.map((part, index) => {
        if (part.match(urlRegex)) {
          const url = part;
          if (isImageUrl(url)) {
            return <BlurUpImage key={index} src={url} onLoad={onLoadCallback} />;
          } else {
            return (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="chat-link"
              >
                {url}
              </a>
            );
          }
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

function TypingIndicator() {
  return (
    <div className="chat-message chat-left">
      <Icon image={profilepicture_bot} />
      <div className="message typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}

function ChatMessageChild({ message, isanswer, onLoadCallback }: { message: string, isanswer: boolean, onLoadCallback?: () => void }) {
  return (
    <>
      <Icon image={isanswer ? profilepicture_user : profilepicture_bot} />
      <div className="message" style={{ whiteSpace: 'pre-wrap' }}>
        {renderMessageContent(message, onLoadCallback)}
      </div>
    </>
  );
}

function ChatMessage({ message, isanswer, onLoadCallback }: { message: string, isanswer: boolean, onLoadCallback?: () => void }) {
  if (!message) return null;
  return (
    <div className={`chat-message chat-${isanswer ? 'right' : 'left'}`}>
      <ChatMessageChild message={message} isanswer={isanswer} onLoadCallback={onLoadCallback} />
    </div>
  );
}

const validateInput = (field: string, value: string): string | null => {
  if (!field) return null;
  const trimmed = value.trim();
  if (!trimmed) {
    return "Please enter a value before submitting.";
  }

  const f = field.toLowerCase();
  
  if (f === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return "That doesn't look like a valid email address. Please make sure it follows the standard format (e.g., name@example.com).";
    }
  }

  if (f === 'card_last_digits') {
    const digitRegex = /^\d{4}$/;
    if (!digitRegex.test(trimmed)) {
      return "Please enter exactly the last 4 digits of your card number (e.g., 1234).";
    }
  }

  if (f === 'ordernumber') {
    const digitRegex = /^\d{6}$/;
    if (!digitRegex.test(trimmed)) {
      return "Please enter exactly a 6-digit order number (e.g., 123456).";
    }
  }

  if (f === 'monthly_income') {
    // strip non-numeric except decimal point
    const cleanNum = trimmed.replace(/[^0-9.]/g, '');
    const income = Number(cleanNum);
    if (!cleanNum || isNaN(income) || income <= 0) {
      return "Please enter a valid monthly income as a positive number (e.g., 4500).";
    }
  }

  if (f === 'name') {
    if (trimmed.length < 2) {
      return "Please enter your name (at least 2 characters).";
    }
  }

  return null;
};
