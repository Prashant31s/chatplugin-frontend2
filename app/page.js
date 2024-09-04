// frontend/pages/index.js
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatWindow from './components/ChatWindow';

const Home = () => {
  const router = useRouter();
  const [appId, setAppId] = useState("default-app-id");

  useEffect(() => {
    if (router.isReady) {
      const { appId } = router.query;
      setAppId(appId || "default-app-id");
    }
  }, [router.isReady, router.query]);

  console.log("appId", appId);

  return (
    <div>
      <h1>Welcome to Chat Plugin local {appId}</h1>
      <ChatWindow appId={appId} />
    </div>
  );
};

export default Home;
