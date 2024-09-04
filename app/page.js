// frontend/pages/index.js
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatWindow from './components/ChatWindow';

const Home = () => {
  const router = useRouter();
  const [appId, setAppId] = useState("default-app-id");
  const [x,setX]= useState(0)
  useEffect(() => {
    if (router.isReady) {
      const { appId } = router.query;
      setAppId(appId || "default-app-id");
    }
  }, [router.isReady, router.query]);

  useEffect(()=>{
    if(AppId!="default-app-id"){
      setX(2);
    }
  },[AppId,router.isReady, router.quer])

  console.log("appId", appId);

  return (
    <div>
      <h1>Welcome to Chat Plugin local {x}</h1>
      <ChatWindow appId={appId} />
    </div>
  );
};

export default Home;
