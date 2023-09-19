import { useEffect, useRef, useState } from 'react';
import { profilepicture_bot, profilepicture_user } from '../../data/data';

export default function Chat({ data }) {
  const [question, options, select, history, Bottom] = useChat(data);

  return (
    <div className="chat-container">
      {history.map(({ message, answer }) => (
        <ChatMessage message={message} isanswer={answer} />
      ))}

      <ChatMessage message={question} isanswer={false} />

      {options.map((e) => (
        <div
          className="chat-message chat-right chat-options"
          onClick={() => select(e)}
        >
          <ChatMessageChild message={e} isanswer={true} />
        </div>
      ))}
      <Bottom />
    </div>
  );
}

function useChat(data) {
  const [query, setquery] = useState(data.o);
  const [question, setquestion] = useState(data.q);
  const [history, sethistory] = useState([]);
  const ref = useRef();
  const Bottom = () => <div ref={ref}></div>;
  const options = Object.keys(query);

  useEffect(() => {
    ref.current?.scrollIntoView();
  }, [question]);

  return [
    question,
    options,
    (option) => {
      const data = query[option];
      setquestion(data.q);
      setquery(data.o);
      sethistory([
        ...history,
        { message: question },
        { message: option, answer: true },
      ]);
    },
    history,
    Bottom,
  ];
}

const Icon = ({ image }) => (
  <div className="UserIcon" style={{ backgroundImage: `url(${image})` }}></div>
);

function ChatMessageChild({ message, isanswer }) {
  return (
    <>
      <Icon image={isanswer ? profilepicture_user : profilepicture_bot} />{' '}
      <div className="message">{message} </div>
    </>
  );
}
function ChatMessage({ message, isanswer }) {
  return (
    <div className={`chat-message chat-${isanswer ? 'right' : 'left'}`}>
      <ChatMessageChild message={message} isanswer={isanswer} />
    </div>
  );
}
