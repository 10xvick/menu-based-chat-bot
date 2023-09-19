import Chat from './components/chat/chat';
import { data } from './data/data';

import './style.css';

export const App = () => {
  return (
    <div>
      <Chat data={data} />
    </div>
  );
};
