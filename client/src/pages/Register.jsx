import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
export default function Register() {
 const [name,setName]=useState('');const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [error,setError]=useState('');const nav=useNavigate();
 async function submit(e){e.preventDefault();setError('');try{const cred=await createUserWithEmailAndPassword(auth,email,password);await updateProfile(cred.user,{displayName:name});nav('/');}catch(err){setError(err.message);}}
 return <main className="auth-page"><form className="auth-card" onSubmit={submit}><div className="brand-mark">✦</div><h1>Create account</h1><p>Join your conversations on SmartChat.</p>{error&&<div className="error">{error}</div>}<label>Display name</label><input required value={name} onChange={e=>setName(e.target.value)}/><label>Email address</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/><label>Password (minimum 6 characters)</label><input type="password" minLength="6" required value={password} onChange={e=>setPassword(e.target.value)}/><button className="primary full">Create account</button><small>Already registered? <Link to="/login">Sign in</Link></small></form></main>;
}