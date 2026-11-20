import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: '20kb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'SmartChat API' }));

function getBotReply(message) {
  const text = String(message || '').toLowerCase();
  if (/^(hi|hello|hey|good morning|good evening)\b/.test(text)) return 'Hello! 👋 I’m SmartChat. How can I help you today?';
  if (text.includes('your name') || text.includes('who are you')) return 'I’m SmartChat, a demo chatbot built with React, Express and Firebase.';
  if (text.includes('react')) return 'React is a JavaScript library for building reusable user-interface components. This project uses React with Vite.';
  if (text.includes('firebase')) return 'Firebase provides services such as Authentication, Cloud Firestore and Realtime Database. SmartChat uses them for login, messages and online presence.';
  if (text.includes('password') || text.includes('login')) return 'Use the registered email and password to sign in. If you are new, create an account from the Register page.';
  if (text.includes('project') || text.includes('smartchat')) return 'SmartChat demonstrates real-time messaging, authentication, public and private rooms, online presence, routing, Context API and a REST chatbot endpoint.';
  if (text.includes('thank')) return 'You’re welcome! Happy to help. 😊';
  if (text.includes('help')) return 'I can explain this project, React, Firebase, authentication, real-time chat and web development. What would you like to know?';
  return `Thanks for your question: “${String(message).slice(0, 180)}”. I’m the starter SmartChat bot, so my built-in knowledge is limited. You can extend my response logic in server/index.js or connect an AI model securely from the backend.`;
}

app.post('/api/bot', (req, res) => {
  const message = req.body?.message;
  if (typeof message !== 'string' || !message.trim()) return res.status(400).json({ error: 'A message is required.' });
  if (message.length > 1500) return res.status(413).json({ error: 'Message is too long.' });
  res.json({ reply: getBotReply(message) });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`SmartChat API running on port ${port}`));
