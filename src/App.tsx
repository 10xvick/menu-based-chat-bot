import Chat from './components/chat/chat';
import JsonEditor from './components/editor/JsonEditor';
import { data } from './data/data';

import './style.css';

export const App = () => {
  return (
    <div>
      <Chat />
      <JsonEditor/>
    </div>
  );
};
