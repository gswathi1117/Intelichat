import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { onValue, onDisconnect, ref, set, serverTimestamp as rtdbTimestamp } from 'firebase/database';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db, rtdb } from '../firebase';
import { useAuth } from '../context/AuthContext';
import ChatRoom from '../components/ChatRoom';

export default function Dashboard() {
 const {user}=useAuth(); const [mode,setMode]=useState('bot'); const [target,setTarget]=useState(''); const [targetUid,setTargetUid]=useState(''); const [people,setPeople]=useState([]);
 useEffect(() => {
  if (!user) return;

  const statusRef = ref(rtdb, `status/${user.uid}`);
  const connectedRef = ref(rtdb, '.info/connected');

  const unsubscribeConnection = onValue(connectedRef, async (snapshot) => {
    if (snapshot.val() === false) {
      return;
    }

    try {
      await onDisconnect(statusRef).set({
        state: 'offline',
        email: user.email,
        changedAt: rtdbTimestamp()
      });

      await set(statusRef, {
        state: 'online',
        email: user.email,
        changedAt: rtdbTimestamp()
      });
    } catch (error) {
      console.error('Presence update error:', error);
    }
  });

  const unsubscribeStatus = onValue(ref(rtdb, 'status'), (snapshot) => {
    const allUsers = snapshot.val() || {};

    setPeople(
      Object.entries(allUsers)
        .filter(([uid, value]) =>
          uid !== user.uid && value.state === 'online'
        )
        .map(([uid, value]) => ({
          uid,
          email: value.email
        }))
    );
  });

  return () => {
    unsubscribeConnection();
    unsubscribeStatus();
  };
}, [user]);
 const privateRoom = targetUid ? `private_${[user.uid,targetUid].sort().join('_')}` : '';
 async function openPrivate(){const q=query(collection(db,'users'),where('email','==',target.trim().toLowerCase()));const result=await getDocs(q);if(result.empty){alert('No account found with that email. Ask the person to register first.');return;}if(result.docs[0].id===user.uid){alert('Choose another user email.');return;}setTargetUid(result.docs[0].id);setMode('private');}
 return <main className="app-shell">
  <aside className="sidebar"><div className="logo"><span>✦</span> SmartChat</div><div className="profile"><div className="avatar">{(user.displayName||user.email)[0].toUpperCase()}</div><div><b>{user.displayName||'User'}</b><small>{user.email}</small></div></div>
   <p className="nav-label">WORKSPACE</p>
   <button className={`nav-item ${mode==='bot'?'active':''}`} onClick={()=>setMode('bot')}>✧ <span>Chatbot assistant</span></button>
   <button className={`nav-item ${mode==='public'?'active':''}`} onClick={()=>setMode('public')}>◉ <span>Public room</span></button>
   <p className="nav-label">PRIVATE MESSAGES</p><div className="private-form"><input placeholder="User email address" value={target} onChange={e=>setTarget(e.target.value)}/><button onClick={openPrivate}>Open chat</button></div>
   <p className="nav-label">ONLINE NOW · {people.length}</p><div className="people">{people.map(p=><div className="person" key={p.uid}><span className="online-dot"/>{p.email}</div>)}{people.length===0&&<small className="muted">No other users online</small>}</div>
   <button className="logout" onClick={()=>signOut(auth)}>↪ Sign out</button>
  </aside>
  <div className="main-content">
   {mode==='bot'&&<ChatRoom roomId={`bot_${user.uid}`} title="SmartChat Assistant" botMode/>}
   {mode==='public'&&<ChatRoom roomId="public" title="Community Public Room"/>}
   {mode==='private'&&<ChatRoom roomId={privateRoom} title={`Private chat · ${target}`}/>}
   <footer>SmartChat · Full Stack Real-Time Chatbot Project</footer>
  </div>
 </main>;
}