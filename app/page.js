'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatWindow from './components/ChatWindow'; // Adjust the path if needed

// Main Home component
const Home = () => {
  const searchParams = useSearchParams();
  const [appId, setAppId] = useState('default-app-id');

  useEffect(() => {
    const appIdFromUrl = searchParams.get('appId');
    if (appIdFromUrl) {
      setAppId(appIdFromUrl);
    }
  }, [searchParams]);

  console.log("AppId being used:", appId);

  return (
    <div>
      <h1>Welcome to Chat Plugin, AppId: {appId}</h1>
      <ChatWindow appId={appId} />
    </div>
  );
};

// Fallback UI while loading
const LoadingFallback = () => <div>Loading chat...</div>;

// Wrapping Home component with Suspense in HomePage
export default function HomePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Home />
    </Suspense>
  );
}
