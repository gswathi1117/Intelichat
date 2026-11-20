
import { useEffect, useRef, useState } from 'react';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from 'firebase/firestore';

import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function ChatRoom({
  roomId,
  title,
  botMode = false
}) {
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);

  const bottom = useRef(null);

  // Listen to Firebase messages in real time
  useEffect(() => {
    if (!roomId) {
      return;
    }

    const messagesRef = collection(
      db,
      'rooms',
      roomId,
      'messages'
    );

    const messagesQuery = query(
      messagesRef,
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messageList = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data()
        }));

        setMessages(messageList);
      },
      (error) => {
        console.error('Firebase message error:', error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [roomId]);

  // Scroll to the latest message
  useEffect(() => {
    bottom.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);

  // Send a message
  async function send(e) {
    e.preventDefault();

    const text = value.trim();

    if (!text || sending || !user || !roomId) {
      return;
    }

    setValue('');
    setSending(true);

    try {
      // Save user message in Firestore
      await addDoc(
        collection(db, 'rooms', roomId, 'messages'),
        {
          text: text,
          uid: user.uid,
          email: user.email,
          sender: user.displayName || user.email,
          createdAt: serverTimestamp(),
          kind: botMode ? 'bot-chat' : 'user-chat'
        }
      );

      // Get chatbot response
      if (botMode) {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/bot`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: text
            })
          }
        );

        if (!response.ok) {
          throw new Error('Chatbot API is unavailable');
        }

        const data = await response.json();

        // Save chatbot response in Firestore
       
await addDoc(
  collection(db, 'rooms', roomId, 'messages'),
  {
    text: data.reply,
    uid: user.uid,
    email: user.email,
    sender: 'SmartChat Bot',
    createdAt: serverTimestamp(),
    kind: 'bot'
  }
);

      }
    } catch (error) {
      console.error('Message sending error:', error);
      alert(error.message || 'Unable to send message');
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="chat-panel">

      <header className="chat-header">
        <div>
          <h2>{title}</h2>
          <p>
            {botMode
              ? 'Ask a question and get an instant response'
              : 'Messages update live for everyone in this room'}
          </p>
        </div>

        <span className="live">
          <i />
          LIVE
        </span>
      </header>

      <div className="messages">

        {messages.length === 0 && (
          <div className="empty">
            <div className="empty-icon">✦</div>
            <h3>Start a conversation</h3>
            <p>Your messages will appear here.</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${
              message.uid === user?.uid ? 'mine' : ''
            } ${
              message.kind === 'bot' ? 'bot-message' : ''
            }`}
          >
            <div className="bubble-meta">
              <b>
                {message.uid === user?.uid
                  ? 'You'
                  : message.sender || message.email || 'User'}
              </b>

              {message.kind === 'bot' && (
                <span className="bot-tag">BOT</span>
              )}
            </div>

            <div className="bubble">
              {message.text}
            </div>
          </div>
        ))}

        <div ref={bottom} />

      </div>

      <form className="composer" onSubmit={send}>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={
            botMode
              ? 'Ask SmartChat anything…'
              : 'Type your message…'
          }
          maxLength={1500}
        />

        <button
          type="submit"
          disabled={sending || !value.trim()}
        >
          {sending ? '…' : 'Send ↗'}
        </button>
      </form>

    </section>
  );
}
