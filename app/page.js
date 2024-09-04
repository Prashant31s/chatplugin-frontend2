// frontend/pages/index.js
'use client'
import React from 'react';
import ChatWindow from './components/ChatWindow';


const Home = () => {
  const appId = "your-app-id";  // Replace with dynamic appId as needed

  return (
    <div>
      <h1>Welcome to Chat Plugin</h1>
      <ChatWindow appId={appId} />
    </div>
  );
};

export default Home;
