// frontend/pages/index.js
'use client'
import React from 'react';
import ChatWindow from './components/ChatWindow';
import { useRouter,useSearchParams  } from 'next/navigation';

const Home = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appId = searchParams.get("appId")|| "default-app-id";
  console.log("appId",appId); 
  // const appId = router.query.appId || "default-app-id";// Replace with dynamic appId as needed

  return (
    <div>
      <h1>Welcome to Chat Plugin local {appId}</h1>

      <ChatWindow appId={appId} />
    </div>
  );
};

export default Home;
