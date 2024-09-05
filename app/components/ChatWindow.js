// frontend/components/ChatWindow.js
import React, { useState, useEffect } from 'react';
import socket from '../utils/socket';

const ChatWindow = ({ appId,roomId,user }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const finalroom = appId+roomId;
  useEffect(() => {
    socket.emit('join', { finalroom });
    console.log("aaaaa", finalroom);
    socket.on('message', (newMessage) => {
      console.log("mmmmm",newMessage);
      setMessages((prevMessages) => [newMessage, ...prevMessages]);
    });
    socket.on('messageHistory', (history) => {
      setMessages(history);
    });

    return () => {
      socket.off('message');
      socket.off('messageHistory');
    };
  }, [appId, roomId,finalroom]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('message', { appId,finalroom, user,message });
      setMessage('');
    }
  };
  useEffect(()=>{
    console.log("messsages", messages);
  },[messages])

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            {msg.message}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatWindow;
