import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
export default function Login() {
 const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const nav=useNavigate();
 async function submit(e){e.preventDefault();setError('');try{await signInWithEmailAndPassword(auth,email,password);nav('/');}catch(err){setError(err.message);}}
 return <main className="auth-page"><form className="auth-card" onSubmit={submit}><div className="brand-mark">✦</div><h1>Welcome back</h1><p>Sign in to continue to SmartChat.</p>{error&&<div className="error">{error}</div>}<label>Email address</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/><label>Password</label><input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/><button className="primary full">Sign in</button><small>New here? <Link to="/register">Create an account</Link></small></form></main>;
}