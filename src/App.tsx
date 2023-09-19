import { FC } from 'react';
import Chat from '../components/chat/chat';
import { data } from './data/data';

import './style.css';

export const App: FC<{ name: string }> = ({ name }) => {
  return (
    <div>
      <Chat data={data}/>
    
    </div>
  );
};
