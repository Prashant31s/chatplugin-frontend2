// frontend/components/ChatWindow.js
import React, { useState, useEffect } from 'react';
import socket from '../utils/socket';

const ChatWindow = ({ appId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.emit('join', { appId });

    socket.on('message', (newMessage) => {
      setMessages((prevMessages) => [newMessage, ...prevMessages]);
    });

    return () => {
      socket.off('message');
    };
  }, [appId]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('message', { appId, message });
      setMessage('');
    }
  };

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