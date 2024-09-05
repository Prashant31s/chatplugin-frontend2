'use client';  // This indicates the use of the App Router
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';  // Use this for query params in App Router
import ChatWindow from './components/ChatWindow';

const Home = () => {
  const searchParams = useSearchParams();  // New way to get query parameters in App Router
  const [appId, setAppId] = useState('default-app-id');

  useEffect(() => {
    const appIdFromUrl = searchParams.get('appId');  // Fetch appId from the URL query
    if (appIdFromUrl) {
      setAppId(appIdFromUrl);
    }
  }, [searchParams]);

  console.log("AppId being used:", appId);

  return (
    <div>
      <h1>Welcome to Chat Plugin, AppId: {appId}</h1>
      <ChatWindow appId={appId} /> {/* Pass appId to ChatWindow */}
    </div>
  );
};

export default Home;
