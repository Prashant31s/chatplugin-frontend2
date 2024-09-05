'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; // Update the import
import ChatWindow from '../components/ChatWindow'; // Correct the import path

const Home = () => {
  const router = useRouter();
  const [appId, setAppId] = useState("default-app-id");

  useEffect(() => {
    if (router.isReady) {
      const appIdFromUrl = router.query?.appId; // Use optional chaining
      console.log("AppId from URL:", appIdFromUrl);  
      setAppId(appIdFromUrl || "default-app-id");
    }
  }, [router.isReady, router.query]);

  console.log("AppId being used:", appId);

  return (
    <div>
      <h1>Welcome to Chat Plugin, AppId: {appId}</h1>
      <ChatWindow appId={appId} /> {/* Pass appId to ChatWindow */}
    </div>
  );
};

export default Home;
