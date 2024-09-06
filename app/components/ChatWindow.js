// frontend/components/ChatWindow.js
import React, { useState, useEffect } from 'react';
import socket from '../utils/socket';
const ChatWindow = ({ appId,roomId,user }) => {
  const [data, setData] = useState([]);
  const [message, setMessage] = useState("");
  const finalroom = appId+roomId;
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleSubmit = (e) => {
    //triggers when send button is licked
    e.preventDefault();
    if (message) {
      socket.emit("message", { appId,finalroom,user, message });
    }
    setMessage("");
  };

  const handleEdit = (messageId, currentContent) => {
    //triggers when message edit button is clicked
    const newContent = prompt("Edit your message:", currentContent);
    if (newContent) {
      socket.emit("edit-message", { messageId, newContent, room: room });
    }
    setActiveDropdown(null);
  };

  const handleDelete = (messageId) => {
    //triggers when message delete button is clicked
    socket.emit("delete-message", { messageId, room: room });
    setActiveDropdown(null);
  };

  useEffect(() => {
    socket.emit("join-room", finalroom);
    socket.on("messageHistory", (messages) => {
      //gets the history of room from server and put it in the state to display in ui
      console.log("mesagesss",messages)
      let mes = messages.map((msg) => ({
        nmessages: msg.message,
        ruser: msg.user,
      }));
      setData(mes);
      console.log("daaaaata", messages);
    });
  }, []);

  useEffect(() => {
 
    socket.on("receive-message", ( newMessage ) => {
      console.log("newm", newMessage);
      setData((prevData) => [
        ...prevData,
        {  nmessages: newMessage.message, ruser: newMessage.user }, //adds the message received in state
      ]);
    });

    

    

    return () => {
      socket.off("receive-message");
    };
  }, [data]);

  const toggleDropdown = (messageId) => {
    setActiveDropdown(activeDropdown === messageId ? null : messageId);
  };

  return (
    // <div className="w-screen bg-accent h-100%">
      <div className="rounded-2xl items-center justify-center text-center text-2xl h-screen w-[100%]">
        <div className="flex flex-col justify-end border-[2.5px] border-white rounded-[30px] bg-black  min-w-[750px]  mx-auto  bg-background w-[100%] h-[100%]">
          <div className="flex flex-col-reverse p-3 mt-5 mr-2 overflow-auto scrollbar-thin scrollbar-thumb-rounded-sm scrollbar-thumb-black">
            <div className="flex flex-col gap-3 p-2">
              {data.map((msg, index) =>
                msg.ruser === user ? (
                  <div
                    key={index}
                    className="relative bg-joinbutton flex flex-row self-end max-w-xs border-[1px] border-black rounded-[25px] p-1"
                  >
                    <p className="text-wrap m-1 word overflow-x-auto">
                      {msg.nmessages}
                    </p>
                  </div>
                ) : (
                  <div
                    key={index}
                    className="bg-secondary flex flex-col max-w-xs border-[1px] border-text rounded-[25px] w-fit"
                  >
                    {msg.ruser === data[index - 1 > 0 ? index - 1 : 0].ruser && //functionality to not give every message with user if the last message is from same user
                    index != 0 ? (
                      <span className="m-0.5 bg-secondary pl-1 pr-1  text-black rounded-2xl text-wrap word overflow-x-auto ">
                        {msg.nmessages}
                      </span>
                    ) : (
                      <div className="flex flex-col">
                        <span
                          className={`pt-1 pl-1 pr-1  mt-0 text-[20px] font-bold text-black `}
                        >
                          {msg.ruser} :
                        </span>
                        <span className=" mb-[2px] pl-1 pr-1 pb-1 text-black rounded-xl text-wrap word overflow-x-auto ">
                          {msg.nmessages}
                        </span>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter message"
              className="input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" className="">
              Send
            </button>
          </form>
        </div>
      </div>
    // </div>
  );
};

export default ChatWindow;
