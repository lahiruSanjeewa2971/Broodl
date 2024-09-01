'use client';

import { Fugaz_One } from 'next/font/google';
import React, { useState } from 'react'
import Button from './Button';
import { useAuth } from '@/context/AuthContext';

const fugaz = Fugaz_One({ subsets: ["latin"], weight: ['400'] });

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);

  const { signUp, login } = useAuth();

  async function handleSubmit() {
    if (!email || !password || password.length < 6) {
      return;
    }

    setAuthenticating(true);

    try {
      if (isRegister) {
        await signUp(email, password);
      }
      else {
        await login(email, password);
      }
    } catch (error) {
      console.log("Failed : ", error);
    } finally {
      setAuthenticating(false);
    }
  }

  return (
    <div className='flex flex-col flex-1 justify-center items-center gap-4'>
      <h3 className={'text-3xl sm:text-4xl md:text-5xl ' + fugaz.className}>{isRegister ? 'Register' : 'Log In'}</h3>

      <p>You're one step away!</p>

      <input value={email} onChange={(e) => setEmail(e.target.value)} className='max-w-[400px] w-full mx-auto px-4 py-2 sm:py-3 border border-solid border-indigo-400 rounded-full outline-none' placeholder='Email' />
      <input value={password} onChange={(e) => setPassword(e.target.value)} className='max-w-[400px] w-full mx-auto px-4 py-2 sm:py-3 border border-solid border-indigo-400 rounded-full outline-none' placeholder='Password' type='password' />

      <div className='max-w-[400px] w-full mx-auto'>
        <Button clickhandler={handleSubmit} text={authenticating ? "Submitting..." : "Submit"} full />
      </div>

      <p className='text-center'>{isRegister ? "Already have an account ? " : "Don't have an account ? "}<button onClick={() => setIsRegister(!isRegister)} className='text-indigo-500'> {isRegister ? 'Sign in' : 'Sign up'}</button></p>
    </div>
  )
}
