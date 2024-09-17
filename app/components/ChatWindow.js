// frontend/components/ChatWindow.js
import React, { useState, useEffect, useRef } from "react";
import socket from "../utils/socket";
const ChatWindow = ({ appId, roomId, user }) => {
  const [data, setData] = useState([]);
  const [message, setMessage] = useState("");
  const finalroom = appId + roomId;
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [viewingImage, setViewingImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });
  const [maxZoom, setMaxZoom] = useState(2);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const contentEditableRef = useRef(null);
  const imageRef = useRef(null);
  const [isHolding, setIsHolding] = useState(false);
  const [dragStartPoint, setDragStartPoint] = useState({ x: 0, y: 0 });
  const [imageDragging, setImageDragging] = useState(false);
  const [chatboxopen, setChatBoxOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [activeReactionDropdown, setActiveReactionDropdown] = useState(null);
  // const [activeDropdown, setActiveDropdown] = useState(null);
  // const handleSubmit = (e) => {
  //   //triggers when send button is licked
  //   e.preventDefault();
  //   if (message) {
  //     socket.emit("message", { appId,finalroom,user, message });
  //   }
  //   setMessage("");
  // };

  const toggleReactionDropdown = (messageId) => {
    setActiveReactionDropdown(
      activeReactionDropdown === messageId ? null : messageId
    );
  };
  const handleReactToMessage = (messageId, emoji) => {
    console.log("emoji", emoji);
    socket.emit("react-to-message", {
      messageId,
      emoji,
      user,
      room: finalroom,
    });
  };
  useEffect(() => {
    console.log("1");
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    console.log("Mobile", isMobile);
    setMaxZoom(isMobile ? 10 : 2);
  }, []);

  useEffect(() => {
    console.log("2");
    socket.emit("join-room", finalroom);
    socket.on("messageHistory", (messages) => {
      const formattedMessages = messages.map((msg) => ({
        ...msg,
        createdAt: msg.createdAt ? new Date(msg.createdAt) : null,
      }));
      setData(formattedMessages);
    });
  }, [appId, user]);
  //changes
  // useEffect(() => {
  //   //console.log("sfg", data);
  //   console.log("3");
  //   data.map((userdata) => {
  //     const date = new Date(userdata.date);
  //     const year = date.getFullYear();
  //     const month = date.getMonth() + 1;
  //     const day = date.getDate();
  //     const hours = date.getHours();
  //     const minutes = date.getMinutes();
  //     const seconds = date.getSeconds();
  //     const messagedate = `${day}-${month}-${year}`;
  //     const messagetime = `${hours}:${minutes}`;
  //     userdata.messagetime = messagetime.toString();
  //     userdata.messageDate = messagedate.toString();
  //     // console.log(
  //     //   "useer",
  //     //   year,
  //     //   month,
  //     //   day,
  //     //   hours,
  //     //   minutes,
  //     //   seconds,
  //     //   messagetime,
  //     //   messagedate
  //     // );
  //   });
  // }, [data]);

  useEffect(() => {
    console.log("5");
    socket.on("receive-message", (newMessage) => {
      console.log("Received new message:", newMessage);
      setData((prevData) => [
        ...prevData,
        {
          ...newMessage,
          createdAt: newMessage.createdAt
            ? new Date(newMessage.createdAt)
            : null,
        },
      ]);
    });

    socket.on("message-edited", ({ messageId, newContent }) => {
      console.log("edited", newContent);
      setData((prevData) =>
        prevData.map(
          (msg) =>
            msg._id === messageId ? { ...msg, message: newContent } : msg //make the edits in message in the state
        )
      );
    });

    socket.on("message-deleted", ({ messageId }) => {
      setData(
        (prevData) => prevData.filter((msg) => msg._id !== messageId) //remove the deleted message from the state
      );
    });

    socket.on("message-reaction", ({ messageId, reactions }) => {
      setData((prevData) =>
        prevData.map((msg) =>
          msg._id === messageId ? { ...msg, reactions } : msg
        )
      );
    });
    return () => {
      socket.off("receive-message");
      socket.off("message-edited");
      socket.off("message=deleted");
      socket.off("message-reaction");
    };
  }, []);

  useEffect(() => {
    // Centers the image when it is viewed and adjusts the position on window resize.
    //console.log("7");
    if (viewingImage) {
      const handleResize = () => {
        console.log("chalaaa");
        if (imageRef.current) {
          // check if the image element is available
          // imgRect will be an object containing properties like width and height.
          const imgRect = imageRef.current.getBoundingClientRect(); //getBoundingClientRect() provides the size of the image and its position relative to the viewport.
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const imgWidth = imgRect.width;
          const imgHeight = imgRect.height;
          console.log("check", viewportWidth, viewportHeight);
          console.log("check2", imgWidth, imgHeight);
          console.log(
            "container pos x, y",
            (viewportWidth - imgWidth) / 2,
            (viewportHeight - imgHeight) / 2
          );
          console.log(
            "container pos x, y",
            viewportWidth - imgWidth,
            viewportHeight - imgHeight
          );
          setImagePosition({
            // Calculate initial position to center the image
            x: (viewportWidth - imgWidth) / 2,
            y: (viewportHeight - imgHeight) / 2,
          });
        }
      };
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [viewingImage]);

  useEffect(() => {
    //console.log("8");
    const handleScroll = (e) => {
      if (viewingImage) {
        e.preventDefault();
        const zoomChange = e.deltaY < 0 ? 1.1 : 0.9; // for virtical scroll direction if scroll up increase by 1.1 zoom in and scroll sown with 0.9 zoom out
        setZoom((prevZoom) => {
          const newZoom = Math.max(1, Math.min(prevZoom * zoomChange, maxZoom)); // prevzoom is current zoom level it will not go below 1 and above the maxZoom
          return newZoom;
        });
      }
    };

    window.addEventListener("wheel", handleScroll); // calls the handlescroll when the wheel is moved
    return () => {
      window.removeEventListener("wheel", handleScroll);
    };
  }, [viewingImage, maxZoom]);

  useEffect(() => {
    // Add global event listeners
    // window.addEventListener('mousemove', handleMouseMove);
    console.log("9");
    window.addEventListener("mouseup", handleMouseUp);

    // Cleanup function to remove event listeners
    return () => {
      // window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isHolding, imageDragging]);

  const toggleDropdown = (messageId) => {
    console.log("mes", messageId);
    setActiveDropdown(activeDropdown === messageId ? null : messageId);
  };
  const handleEdit = (messageId, currentContent) => {
    // Load the content of the message to the contentEditable div
    if (contentEditableRef.current) {
      contentEditableRef.current.innerHTML = currentContent;
      moveCursorToEnd(contentEditableRef.current); // Move cursor to the end of the content
    }

    setEditingMessageId(messageId); // Track the message being edited
    setActiveDropdown(null);
  };

  const handleDelete = (messageId) => {
    //triggers when message delete button is clicked
    socket.emit("delete-message", { messageId, room: finalroom });
    setActiveDropdown(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const newImages = [...images, ...files]; // creates a array of existing image and newly dropped files
      setImages(newImages);
      const readers = files.map((file) => {
        const reader = new FileReader();
        return new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then((previews) => {
        setImagePreviews([...imagePreviews, ...previews]);
        previews.forEach((preview) => insertImageIntoContentEditable(preview)); //ittrates over the perview anf insert each emage into the contentEditable div
      });
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const renderMessage = (text, images) => {
    // const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]|(www\.)[^\s]+)[^>]/gi;
    text = text.replace(/&nbsp;/g, " ");
    const urlPattern =
      /\b(?:https?|ftp|file):\/\/[^\s<>"'()]+(?=\s|$|(?=<))|(?<![\w.-])www\.[^\s<>"'()]+(?=\s|$|(?=<))/gi;
    let parts = []; // used to store text,link and images
    let lastIndex = 0;
    let match; // used to store the url patterns

    // Function to add onClick to images in the text and style them as block elements
    const addOnClickToImages = (html) => {
      return html.replace(
        /<img\s([^>]*?)src=["']([^"']*)["']([^>]*?)>/gi,
        (match, p1, src, p2) => {
          return `<img ${p1}src="${src}"${p2} style="display:block;cursor:pointer;max-width:100%;max-height:100px;" onclick="window.handleImageClick('${src}')" />`;
        }
      );
    };

    while ((match = urlPattern.exec(text)) !== null) {
      // iterates through message searching for URL using the URLPatern
      const url = match[0];
      if (match.index > lastIndex) {
        // if there is text betwwen 2 image it pushes the message in parts array
        parts.push(text.substring(lastIndex, match.index));
      }

      const href = url.startsWith("www.") ? `http://${url}` : url;
      parts.push(
        <a
          key={url}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "blue", textDecoration: "underline" }}
        >
          {url}
        </a>
      );
      lastIndex = match.index + match[0].length; //check if there is text after last url match it pushes to parts
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return (
      <div>
        {parts.map((part, index) => {
          if (typeof part === "string" && !urlPattern.test(part)) {
            // Render non-URL parts as HTML with onclick for images
            const htmlWithOnClick = addOnClickToImages(part);
            return (
              <span
                key={index}
                dangerouslySetInnerHTML={{ __html: htmlWithOnClick }}
              />
            );
          } else {
            // Render URLs directly
            return part;
          }
        })}
      </div>
    );
  };

  const insertImageIntoContentEditable = (imageUrl) => {
    if (contentEditableRef.current) {
      const img = document.createElement("img");
      img.src = imageUrl;
      img.style.maxWidth = "100%";
      img.style.maxHeight = "100px";
      img.style.paddingTop = "2px"; // Add padding to the top
      img.style.paddingBottom = "2px"; // Add padding to the bottom
      // img.style.cursor = "pointer";
      // img.onclick = () => {
      //     setViewingImage(imageUrl);
      //     setZoom(1);
      // };

      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(contentEditableRef.current);
      range.collapse(false);
      range.insertNode(img);
      range.setStartAfter(img); // Move the cursor after the image
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      contentEditableRef.current.focus(); // Focus the contentEditable element
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (contentEditableRef.current) {
      const contentHtml = contentEditableRef.current.innerHTML.trim();

      if (editingMessageId) {
        // Emit the edit message event
        socket.emit("edit-message", {
          messageId: editingMessageId,
          newContent: contentHtml,
          room: finalroom,
        });

        // Reset editing state
        setEditingMessageId(null);
      } else {
        // Handle new message
        const messageData = { appId, message: contentHtml, finalroom, user };

        if (images.length > 0) {
          const readers = images.map((img) => {
            const reader = new FileReader();
            return new Promise((resolve) => {
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(img);
            });
          });

          Promise.all(readers).then((imageResults) => {
            socket.emit("message", { ...messageData, images: imageResults });
            setImages([]);
            setImagePreviews([]);
          });
        } else if (
          contentHtml !== "" &&
          contentHtml.replace(/<[^>]*>/g, "").trim() !== ""
        ) {
          socket.emit("message", messageData);
        }
      }

      // Clear the contentEditable div
      contentEditableRef.current.innerHTML = ""; // Clear the div after sending/editing
    }
  };

  const handleContentChange = (e) => {
    const contentEditableElement = e.currentTarget;
    const selection = window.getSelection();
    const range =
      selection.rangeCount > 0
        ? selection.getRangeAt(0)
        : document.createRange();

    // Save the current cursor position
    const cursorPosition = {
      offset: range.startOffset,
      container: range.startContainer,
    };

    // Function to color URLs in the text
    const colorUrls = (text) => {
      const urlRegex = /https:\/\/([^\/\.]+)\.([^\/\s]+(?:\/[^\s]*)?)/gi;
      return text;
    };

    const processNodes = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Replace text content with colored URLs
        const newTextContent = colorUrls(node.textContent);
        if (newTextContent !== node.textContent) {
          // Replace text node with a new span containing the formatted text
          const newSpan = document.createElement("span");
          newSpan.innerHTML = newTextContent;
          node.replaceWith(...newSpan.childNodes);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.nodeName === "IMG") {
          // Do nothing, preserve <img> tags as HTML
          return;
        } else {
          // Convert element's content to plain text
          const plainText = node.innerText;

          // Process the plain text to color URLs
          const coloredText = colorUrls(plainText);

          // Replace the element with a new text node containing the colored text
          const newTextNode = document.createTextNode(coloredText);
          node.replaceWith(newTextNode);
        }
      }
    };

    // Process the content without replacing the entire innerHTML
    // [Text, Img, text, <div><span>text</span></div>]
    Array.from(contentEditableElement.childNodes).forEach(processNodes);

    // Restore cursor position
    const restoreCursor = () => {
      const newRange = document.createRange();
      newRange.setStart(cursorPosition.container, cursorPosition.offset);
      newRange.collapse(true);

      selection.removeAllRanges();
      selection.addRange(newRange);
    };

    restoreCursor();
  };

  const handleFiles = (files) => {
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    ); // chechks the MIME type that starts with '/image"

    if (imageFiles.length === 0) {
      console.log("No valid image files selected");
      return;
    }

    const newImages = [...images, ...imageFiles];
    setImages(newImages);

    const readers = imageFiles.map((file) => {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((previews) => {
      setImagePreviews([...imagePreviews, ...previews]);
      previews.forEach((preview) => insertImageIntoContentEditable(preview));
    });
  };
  useEffect(() => {
    // Client-side code here

    // Set global handler for image click
    console.log("10");
    window.handleImageClick = (src) => {
      setViewingImage(src);
      setZoom(1);
    };

    return () => {
      // Cleanup if needed
    };
  }, []);
  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    const files = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        files.push(file);
      }
    }
    if (files.length > 0) {
      handleFiles(files);
      e.preventDefault(); // Prevent the default paste behavior
      contentEditableRef.current.focus();
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      // Prevent the default action for Enter key (adding a new line)
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsHolding(true);
    setDragStartPoint({ x: e.clientX, y: e.clientY });
    setImageDragging(false);
    console.log("Hold chexk", isHolding);
  };

  const handleMouseMove = (e) => {
    if (!isHolding) return;
    console.log("holding check agian", isHolding);

    const dx = e.clientX - dragStartPoint.x;
    const dy = e.clientY - dragStartPoint.y;

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      setImageDragging(true);
    }

    if (imageDragging) {
      setImagePosition((prevPosition) => ({
        x: prevPosition.x + dx,
        y: prevPosition.y + dy,
      }));
      setDragStartPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    console.log("working");
    if (isHolding && !imageDragging) {
      // This was a click, not a drag
      setZoom(1);
    }
    setIsHolding(false);
    setImageDragging(true);
  };
  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setOriginalSize({ width: naturalWidth, height: naturalHeight });
  };

  const chatbox = () => {
    setChatBoxOpen(!chatboxopen);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    const date = new Date(dateValue);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateValue) => {
    if (!dateValue) return "N/A";
    const date = new Date(dateValue);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const shouldShowDateHeader = (currentMsg, prevMsg) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.createdAt).toDateString();
    const prevDate = new Date(prevMsg.createdAt).toDateString();
    return currentDate !== prevDate;
  };
  const name = (user) => {
    let s = user.charAt(0).toUpperCase();
    let space = false;
    for (let i = 1; i < user.length; i++) {
      if (space) {
        s += user.charAt(i).toUpperCase();
        break;
      }
      if (user.charAt(i) == " ") {
        space = true;
      }
    }

    if (s.length == 1) {
      s += user.charAt(1).toUpperCase();
    }
    return s;
  };
  const moveCursorToEnd = (element) => {
    const range = document.createRange();
    const selection = window.getSelection();

    range.selectNodeContents(element);
    range.collapse(false); // Collapse the range to the end
    selection.removeAllRanges();
    selection.addRange(range);
    element.focus(); // Ensure the contentEditable div gets focused
  };

  const checkdate = (a, b) => {
    const date1 = new Date(a);
    const date2 = new Date(b);
    
    if (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    ) {
      
      return true;
    }
    return false;
  };

  const renderReactions = (reactions, isOwnMessage) => {
    if (!reactions || reactions.length === 0) return null;
 
    const groupedReactions = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = { count: 0, users: [] };
      }
      acc[reaction.emoji].count++;
      acc[reaction.emoji].users.push(reaction.user);
      return acc;
    }, {});
 
    return (
      <div className={`reactions-container flex flex-wrap  ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
        {Object.entries(groupedReactions).map(([emoji, { count, users }]) => (
          <div key={emoji} className={`reaction-item relative group ${isOwnMessage ? 'text-right' : 'text-left'} m-0.5`}>
            <div className="reaction bg-gray-100 rounded-lg border border-time cursor-default inline-flex items-center overflow-hidden">
              <span className=" ">{emoji}</span>
              <span className=" border-primary px-1 py-1 bg-gray-200">{count}</span>
            </div>
            <div
              className={`absolute ${isOwnMessage ? 'right-0' : 'left-0'} bottom-full mb-2
                        bg-white text-black text-xs rounded-md p-1 opacity-0 group-hover:opacity-100
                        transition-opacity duration-200 pointer-events-none z-10
                        shadow-[0_0_10px_rgba(0,0,0,0.1)] bg-background`}
              style={{
                boxShadow: isOwnMessage
                  ? '-5px 0 10px rgba(0,0,0,0.1)'
                  : '5px 0 10px rgba(0,0,0,0.1)'
              }}
            >
              {users.map((username, index) => (
                <div key={index} className="whitespace-nowrap  border-b border-gray-200 last:border-b-0">
                  {username}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };
  return (
    // <div className="w-screen bg-accent h-100%">
    <div>
      {chatboxopen ? (
        <div className="rounded-lg  h-screen w-auto p-[2%] ">
          <div className="flex flex-row h-[5%] bg-primary rounded-t-lg py-[1%] ">
            <div className="w-[95%] h-[100%]"></div>
            <button onClick={chatbox} className=" w-[10%] h-[100%] ">
              <img
                src="https://www.svgrepo.com/show/80301/cross.svg"
                alt="close icon"
                className="h-[60%] w-[90%]  invert"
              ></img>
            </button>
          </div>
          <div className="flex flex-col justify-end  bg-background  h-[95%] rounded-b-lg  p-2 pr-0">
            <div className="flex overflow-auto custom-scrollbar h-[90%]  ">
              <div className="flex flex-col gap-3  w-[100%] pr-0">
         
                {data.map((msg, index) => (
                  <React.Fragment key={index}>
                    {shouldShowDateHeader(msg, data[index - 1]) && (
                      <div className="text-center my-2">
                        <span className="bg-gray-200 text-time px-2 py-1 rounded-full text-[10px]">
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                    )}
                    {msg.user === user ? (
                      <div className="flex flex-col mr-1">
                        <div className="text-[9px] text-time block ml-1 justify-end text-end mr-1">
                          {formatTime(msg.createdAt)}
                        </div>
                        <div className="message-container relative bg-sender flex flex-row self-end max-w-[80%] rounded-[4px] bg-chat2">
                          <p className="mb-[2px] pl-1 pr-1 pb-1 text-black rounded-xl text-wrap word overflow-x-auto preserve-whitespace m-1 word text-msg text-[70%]">
                            {renderMessage(msg.message)}
                          </p>

                          {/* Emoji Reaction and Three-dot button */}
                      
                          <div className="message-actions flex items-center gap-2 absolute right-0 top-[-30px] opacity-0 hover:opacity-100">
                              {/* Emoji Reaction */}
                              <div className="emoji-reaction">
                                <div className="emoji-dropdown">
                                  <button onClick={() => handleReactToMessage(msg._id, "😊")}>😊</button>
                                  <button onClick={() => handleReactToMessage(msg._id, "👍")}>👍</button>
                                  <button onClick={() => handleReactToMessage(msg._id, "❤️")}>❤️</button>
                            

                              {/* Edit Button */}
                              <button
                                onClick={() => handleEdit(msg._id, msg.message)}
                                className="py-[3px] px-2  hover:bg-delete rounded-[3px] text-[10px]"
                              >
                                Edit
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDelete(msg._id)}
                                className="py-[3px] px-2 text-red hover:bg-delete rounded-[3px] text-[10px]"
                              >
                                Delete
                              </button>
                              </div>
                              </div>
                            </div>
                        </div>

                        {/* Show reactions below the message */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className="reactions-container">
                            {msg.reactions.map((reaction, index) => (
                              <span key={index} className="reaction">
                                {reaction.emoji}{" "}
                                {reaction.user === user ? "You" : reaction.user}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-row ">
                        {msg.user ===
                          data[index - 1 > 0 ? index - 1 : 0].user &&
                        index != 0 &&
                        checkdate(
                          msg.createdAt,
                          data[index - 1 > 0 ? index - 1 : 0].createdAt
                        ) ? (
                          <div className=" rounded-full w-7 items-center justify-center h-7 mr-1 mt-3 text-center text-[12px] flex"></div>
                        ) : (
                          <div className="bg-user text-text rounded-full w-7 items-center justify-center h-7 mr-1 mt-3 text-center text-[12px] flex">
                            {name(msg.user)}
                          </div>
                        )}

                        <div className="w-[80%]">
                          {/* {
                            msg.user ===
                            data[index - 1 > 0 ? index - 1 : 0].user &&
                            index != 0 ?(
                              <div>f</div>
                            ):(
                              <div>s</div>
                            )
                          } */}
                          <div className="text-[9px] text-time">
                            <span className="mr-1">{msg.user}</span>
                            <span>{formatTime(msg.createdAt)}</span>
                          </div>
                          <div className="message-container flex flex-col max-w-[80%] w-fit bg-receiver rounded-[4px]">
                            <span className="mb-[2px] pl-1 pr-1 pb-1 text-black text-wrap word overflow-x-auto preserve-whitespace m-1 word text-msg text-[70%] ">
                              {renderMessage(msg.message)}
                              
                            </span>
                            {renderReactions(msg.reactions, msg.user === user)}
                            {/* Emoji Reaction and Three-dot button */}
                            <div className="message-actions left-0">
                              {/* Emoji Reaction button */}

                              <div className="emoji-reaction">
                                <div className="emoji-dropdown">
                                  <button
                                    onClick={() =>
                                      handleReactToMessage(msg._id, "😊")
                                    }
                                  >
                                    😊
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleReactToMessage(msg._id, "👍")
                                    }
                                  >
                                    👍
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleReactToMessage(msg._id, "❤️")
                                    }
                                  >
                                    ❤️
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                          </div>

                          {/* Show reactions below the message */}
                          {/* {msg.reactions && msg.reactions.length > 0 && (
                            <div className="reactions-container1">
                              {msg.reactions.map((reaction, index) => (
                                <span key={index} className="reaction">
                                  {reaction.emoji}{" "}
                                  {reaction.user === user
                                    ? "You"
                                    : reaction.user}
                                </span>
                              ))}
                            </div>
                          )} */}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="h-[10%] flex flex-col items-center justify-center  text-[14px]"
            >
              <div className="bg-background flex  flex-row   h-[90%] w-[100%] rounded-b-lg items-center text-start justify-center  ">
                <div className="bg-receiverhover  flex flex-row rounded-[10px] w-[100%] h-[100%]">
                  <input
                    type="file"
                    multiple
                    id="fileInput"
                    onChange={handleImageChange}
                    className="hidden bg-receiverhover "
                  />
                  <div
                    ref={contentEditableRef}
                    contentEditable
                    onInput={handleContentChange}
                    onDrop={handleDrop}
                    onPaste={handlePaste}
                    onKeyDown={handleKeyDown}
                    onDragOver={handleDragOver}
                    className="flex-grow bg-white  rounded-[10px]  px-2 overflow-y-auto custom-scrollbar  bg-receiverhover outline-none py-[10px] "
                    placeholder="Type your message..."
                    style={{
                      whiteSpace: "break-spaces",
                      overflowWrap: "break-word",
                      overflowY: "auto",
                      maxHeight: "100px",
                      height: "100%",
                      width: "80%",
                      scrollbarWidth: "thin",
                      scrollbarColor: "#888 #f0f0f0",
                    }}
                  />
                  <div className="h-[100%] w-[20%] flex flex-col justify-center  ">
                    <div className="flex flex-row w-full p-[20%] pr-0">
                      <label
                        htmlFor="fileInput"
                        className=" cursor-pointer w-[50%]  h-[100%] items-center justify-center text-center flex  mr-1"
                      >
                        <img
                          src="https://www.svgrepo.com/show/457374/attachment.svg"
                          alt="Attachment"
                          className="h-[75%] "
                        />
                      </label>
                      <button className="w-[50%] pl-0 pr-0 h-[100%]  rounded-r-full px-2 py-1  ">
                        <img
                          src="https://www.svgrepo.com/show/309946/send.svg"
                          alt="Send"
                          className="h-[80%] "
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          {viewingImage && (
            <div
              className="image-viewer-overlay"
              onClick={(e) =>
                e.currentTarget === e.target && setViewingImage(null)
              }
              onMouseUp={handleMouseUp}
            >
              <div
                className="image-viewer-container "
                style={
                  {
                    // cursor: "pointer",
                  }
                }
                onMouseUp={handleMouseUp}
                onClick={(e) =>
                  e.currentTarget === e.target && setViewingImage(null)
                }
              >
                <img
                  ref={imageRef}
                  src={viewingImage}
                  alt="Viewing"
                  className="image-viewer-img"
                  style={{
                    position: "absolute",
                    top: `${imagePosition.y}px`,
                    left: `${imagePosition.x}px`,
                    transform: `scale(${zoom})`,
                    cursor: isHolding ? "grabbing" : "grab",
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  // onMouseUp={handleMouseUp}
                  onLoad={handleImageLoad}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={chatbox}
          className="w-[45px] h-[45px] rounded-full bg-primary absolute bottom-[3%] right-[3%] items-center  "
        >
          <img
            src="https://www.svgrepo.com/show/529480/chat-round-line.svg"
            className="  mx-auto h-[70%] invert"
          ></img>
        </button>
      )}
    </div>
    // </div>
  );
};

export default ChatWindow;
