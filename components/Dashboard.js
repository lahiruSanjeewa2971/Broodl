'use client'

import { Fugaz_One } from 'next/font/google';
import React, { useEffect, useState } from 'react'
import Calendar from './Calendar';
import { useAuth } from '@/context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import Login from './Login';
import Loading from './Loading';

const fugaz = Fugaz_One({ subsets: ["latin"], weight: ['400'] });

export default function Dashboard() {

  const { userDataObj, currentUser, setUserDataObj, loading } = useAuth();
  const [data, setData] = useState({});
  const now = new Date();

  function countValues() {
    let total_number_of_days = 0;
    let sum_moods = 0;
    for (let year in data) {
      for (let month in data[year]) {
        for (let day in data[year][month]) {
          let days_mood = data[year][month][day];
          total_number_of_days++;
          sum_moods += days_mood;
        }
      }
    }
    return {
      num_days: total_number_of_days,
      average_mood: sum_moods / total_number_of_days
    }
  }

  const statuses = {
    // num_days: 14,
    // average_mood: (new Date()).toDateString(),
    ...countValues(),
    time_remaining: `${23 - now.getHours()}H : ${60 - now.getMinutes()}M`,
  }

  async function handleSetMood(mood) {
    const day = now.getDate();
    const month = now.getMonth() + 1;
    console.log("Month :", month)
    const year = now.getFullYear();

    try {
      const newData = { ...userDataObj };
      if (!newData?.[year]) newData[year] = {};
      if (!newData?.[year]?.[month]) newData[year][month] = {};

      newData[year][month][day] = mood;

      setData(newData);

      setUserDataObj(newData);

      const docRef = doc(db, 'users', currentUser.uid);
      const res = await setDoc(docRef, {
        [year]: {
          [month]: {
            [day]: mood
          }
        }
      }, { merge: true })
    } catch (error) {
      console.log("failed to set mood data :", error);
    }
  }

  const moods = {
    '&*@#$': '😭',
    'Sad': '😭',
    'Existing': '😶',
    'Good': '😊',
    'Elated': '😍',
  }

  useEffect(() => {
    if (!userDataObj || !currentUser) {
      return;
    }
    setData(userDataObj);
  }, [userDataObj, currentUser])

  if (loading) {
    return <Loading />
  }

  if (!currentUser) {
    return <Login />
  }

  return (
    <div className='flex flex-col flex-1 gap-10 sm:gap-14 md:gap-16'>
      <div className='grid grid-cols-3 bg-indigo-50 text-indigo-500 rounded-lg'>
        {Object.keys(statuses).map((status, index) => {
          return (
            <div key={index} className='p-4 flex flex-col gap-1 sm:gap-2'>
              <p className='font-medium uppercase text-xl sm:text-sm truncate'>{status.replaceAll('_', ' ')}</p>
              <p className={'text-base sm:text-lg truncate ' + fugaz.className}>{statuses[status]}{status === 'num_days' ? ' 🔥' : ''}</p>
            </div>
          )
        })}
      </div>

      <h4 className={'text-3xl sm:text-4xl md:text-5xl text-center ' + fugaz.className}>
        How do you <span className='textGradient'>feel</span> today ?
      </h4>

      <div className='flex items-stretch flex-wrap gap-4'>
        {/* <div className='grid grid-cols-2 md:grid-cols-4 gap-4'> */}
        {
          Object.keys(moods).map((mood, moodIndex) => {
            return (
              <button onClick={() => {
                const currentMoodValue = moodIndex + 1;
                handleSetMood(currentMoodValue);
              }} className={'p-4 rounded-2xl purpleShadow duration-200 bg-indigo-50 hover:bg-indigo-100 text-center flex flex-col items-center gap-2 flex-1'} key={moodIndex}>
                <p className={'' + fugaz.className}>{mood}</p>
                <p>{moods[mood]}</p>
              </button>
            )
          })
        }
      </div>

      <Calendar completeData={data} handleSetMood={handleSetMood} />
    </div>
  )
}
