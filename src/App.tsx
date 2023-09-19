import Chat from './components/chat/chat';
import JsonEditor from './components/editor/JsonEditor';

import './style.css';

export const App = () => {
  return (
    <div>
      <Chat />
      <JsonEditor />
    </div>
  );
};
