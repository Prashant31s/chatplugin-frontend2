// frontend/components/ChatWindow.js
import React, { useState, useEffect,useRef } from 'react';
import socket from '../utils/socket';
const ChatWindow = ({ appId,roomId,user }) => {
  const [data, setData] = useState([]);
  const [message, setMessage] = useState("");
  const finalroom = appId+roomId;
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

  // const handleSubmit = (e) => {
  //   //triggers when send button is licked
  //   e.preventDefault();
  //   if (message) {
  //     socket.emit("message", { appId,finalroom,user, message });
  //   }
  //   setMessage("");
  // };
  useEffect(() => {
    console.log("1")
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    console.log("Mobile", isMobile)
    setMaxZoom(isMobile ? 10 : 2);
  }, []);

  

  useEffect(() => {
    socket.emit("join-room", finalroom);
    socket.on("messageHistory", (messages) => {
      //gets the history of room from server and put it in the state to display in ui
      //console.log("mesagesss",messages)
      let mes = messages.map((msg) => ({
        message: msg.message,
        user: msg.user,
      }));
      setData(mes);
      //console.log("daaaaata", messages);
    });
  }, [appId,user]);

  useEffect(() => {
 
    socket.on("receive-message", ( newMessage ) => {
      //console.log("newm", newMessage);
      setData((prevData) => [
        ...prevData,
        {  message: newMessage.message, user: newMessage.user }, //adds the message received in state
      ]);
    });

    return () => {
      socket.off("receive-message");
    };
  }, [data]);

  useEffect(() => {                      // Centers the image when it is viewed and adjusts the position on window resize.
    console.log("3")
    if (viewingImage) {
      const handleResize = () => {
        console.log("chalaaa")
        if (imageRef.current) {                // check if the image element is available
          // imgRect will be an object containing properties like width and height.
          const imgRect = imageRef.current.getBoundingClientRect();  //getBoundingClientRect() provides the size of the image and its position relative to the viewport.
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const imgWidth = imgRect.width;
          const imgHeight = imgRect.height;
          console.log("check", viewportWidth, viewportHeight)
          console.log("check2", imgWidth, imgHeight)
          console.log("container pos x, y", (viewportWidth - imgWidth) / 2, (viewportHeight - imgHeight) / 2)
          console.log("container pos x, y", (viewportWidth - imgWidth), (viewportHeight - imgHeight))
          setImagePosition({                        // Calculate initial position to center the image
            x: (viewportWidth - imgWidth) / 2,
            y: (viewportHeight - imgHeight) / 2
          });
      
        }
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [viewingImage]);




  useEffect(() => {
    console.log("4")
    const handleScroll = (e) => {
      if (viewingImage) {
        e.preventDefault();
        const zoomChange = e.deltaY < 0 ? 1.1 : 0.9;  // for virtical scroll direction if scroll up increase by 1.1 zoom in and scroll sown with 0.9 zoom out
        setZoom(prevZoom => {
          const newZoom = Math.max(1, Math.min(prevZoom * zoomChange, maxZoom)); // prevzoom is current zoom level it will not go below 1 and above the maxZoom
          return newZoom;
        });
      }
    };

    window.addEventListener('wheel', handleScroll);  // calls the handlescroll when the wheel is moved
    return () => {
      window.removeEventListener('wheel', handleScroll);
    };
  }, [viewingImage, maxZoom]);
  
  useEffect(() => {
    // Add global event listeners
    // window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  
    // Cleanup function to remove event listeners
    return () => {
      // window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isHolding, imageDragging]); 

  const toggleDropdown = (messageId) => {
    setActiveDropdown(activeDropdown === messageId ? null : messageId);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const newImages = [...images, ...files];             // creates a array of existing image and newly dropped files
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
        previews.forEach((preview) => insertImageIntoContentEditable(preview));     //ittrates over the perview anf insert each emage into the contentEditable div
      });
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const renderMessage = (text, images) => {
    // const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]|(www\.)[^\s]+)[^>]/gi;
    text = text.replace(/&nbsp;/g, ' ');
    const urlPattern = /\b(?:https?|ftp|file):\/\/[^\s<>"'()]+(?=\s|$|(?=<))|(?<![\w.-])www\.[^\s<>"'()]+(?=\s|$|(?=<))/gi;
    let parts = [];       // used to store text,link and images
    let lastIndex = 0;
    let match;            // used to store the url patterns
 
    // Function to add onClick to images in the text and style them as block elements
    const addOnClickToImages = (html) => {
      return html.replace(/<img\s([^>]*?)src=["']([^"']*)["']([^>]*?)>/gi, (match, p1, src, p2) => {
        return `<img ${p1}src="${src}"${p2} style="display:block;cursor:pointer;max-width:100%;max-height:150px;" onclick="window.handleImageClick('${src}')" />`;
      });
    };
 
    while ((match = urlPattern.exec(text)) !== null) {       // iterates through message searching for URL using the URLPatern
      const url = match[0];
      if (match.index > lastIndex) {                      // if there is text betwwen 2 image it pushes the message in parts array
        parts.push(text.substring(lastIndex, match.index));
      }
 
      const href = url.startsWith('www.') ? `http://${url}` : url;
      parts.push(
        <a
          key={url}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'blue', textDecoration: 'underline' }}
        >
          {url}
        </a>
      );
      lastIndex = match.index + match[0].length;               //check if there is text after last url match it pushes to parts
    }
 
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
 
    return (
      <div>
        {parts.map((part, index) => {
          if (typeof part === 'string' && !urlPattern.test(part)) {
            // Render non-URL parts as HTML with onclick for images
            const htmlWithOnClick = addOnClickToImages(part);
            return (
              <span key={index} dangerouslySetInnerHTML={{ __html: htmlWithOnClick }} />
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
      img.style.maxHeight = "150px";
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
      range.setStartAfter(img);  // Move the cursor after the image
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      contentEditableRef.current.focus();  // Focus the contentEditable element
    }
  };
  
  
  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (contentEditableRef.current) {  // get the inner Html of the div and set the div to contenteditable = true
  
      const contentHtml = contentEditableRef.current.innerHTML.trim(); // Trim whitespace from both ends
      const messageData = {appId, message: contentHtml, finalroom, user };
  
      // Check if there are any images to process
      if (images.length > 0) {
        const readers = images.map((img) => {
          const reader = new FileReader();         //FileReader is used to read each image file
          return new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(img);           // readAsDataURL converts the file into data URL string
          });
        });
        Promise.all(readers).then((imageResults) => {          // when promise is resolved then executes the callback function .then part
          // Send the message with images included as HTML
          socket.emit("message", {...messageData, images: imageResults });      // send mwssage data and image data URL (imageresult)
          console.log("appid check0",appId)
          setMessage("");
          setImages([]);
          setImagePreviews([]);
          contentEditableRef.current.innerHTML = ""; // Clear the contentEditable div
        });
      } else if (contentHtml !== "" && contentHtml.replace(/<[^>]*>/g, '').trim() !== "") {    // to check its valid message or empty html
        // Send the content with text only
        socket.emit("message", messageData);
        setMessage("");
        contentEditableRef.current.innerHTML = ""; // Clear the contentEditable div
      } else {
        return;           // If there's no content and no images, do nothing
      }
    }
  };
  
  
  const handleContentChange = (e) => {
    const contentEditableElement = e.currentTarget;
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : document.createRange();
  
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
          const newSpan = document.createElement('span');
          newSpan.innerHTML = newTextContent;
          node.replaceWith(...newSpan.childNodes);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.nodeName === 'IMG') {
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
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));    // chechks the MIME type that starts with '/image"
  
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
      if (item.type.startsWith('image/')) {
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
    console.log("Hold chexk", isHolding)
  };

  const handleMouseMove = (e) => {
    if (!isHolding) return;
    console.log("holding check agian",isHolding)

    const dx = e.clientX - dragStartPoint.x;
    const dy = e.clientY - dragStartPoint.y;

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      setImageDragging(true);
    }

    if (imageDragging) {
      setImagePosition(prevPosition => ({
        x: prevPosition.x + dx,
        y: prevPosition.y + dy
      }));
      setDragStartPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    console.log("working")
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

  return (
    // <div className="w-screen bg-accent h-100%">
      <div className="rounded-2xl  h-screen w-auto">
        <div className="flex flex-col justify-end border-[2.5px] border-white  bg-black  bg-background  h-[100%]">
          <div className="flex flex-col-reverse p-3 mt-5 mr-2 overflow-auto scrollbar-thin scrollbar-thumb-rounded-sm scrollbar-thumb-black">
            <div className="flex flex-col gap-3 p-2 w-[100%]">
              {data.map((msg, index) =>
                msg.user === user ? (
                  <div
                    key={index}
                    className="relative bg-joinbutton flex flex-row self-end max-w-[80%] border-[1px] border-black rounded-[25px] p-1"
                  >
                    <p className="text-wrap m-1 word overflow-x-auto word">
                    {renderMessage(msg.message)}
                    </p>
                  </div>
                ) : (
                  <div
                    key={index}
                    className="bg-secondary flex flex-col max-w-[80%] border-[1px] border-text rounded-[25px] w-fit"
                  >
                    {msg.user === data[index - 1 > 0 ? index - 1 : 0].user && //functionality to not give every message with user if the last message is from same user
                    index != 0 ? (
                      <span className="m-0.5 bg-secondary pl-1 pr-1  text-black rounded-2xl text-wrap word overflow-x-auto word ">
                        {renderMessage(msg.message)}
                      </span>
                    ) : (
                      <div className="flex flex-col">
                        <span
                          className={`pt-1 pl-1 pr-1  mt-0 text-[20px] font-bold text-black `}
                        >
                          {msg.user} :
                        </span>
                        <span className=" mb-[2px] pl-1 pr-1 pb-1 text-black rounded-xl text-wrap word overflow-x-auto word ">
                        renderMessage{msg.message}
                        </span>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>

          <form className="form" onSubmit={handleSubmit} onDrop={handleDrop} onDragOver={handleDragOver}>
            {/* <input
              type="text"
              placeholder="Enter message"
              className="input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            /> */}

<input
                type="file"
                multiple
                id="fileInput"
                onChange={handleImageChange}
                className="hidden"
              />
              <div

                ref={contentEditableRef}
                contentEditable
                onInput={handleContentChange}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="input"
                placeholder="Type your message..."
                style={{
                  //whiteSpace: 'pre-wrap',
                  whiteSpace: 'break-spaces',
                  overflowWrap: 'break-word',
                  overflowY: 'auto',
                  maxHeight: '150px', // Adjust the max height to fit your needs
                }}
              />
              <label htmlFor="fileInput" className="cursor-pointer flex-shrink-0">
                <img src="https://www.svgrepo.com/show/490988/attachment.svg" alt="Attachment" width={50} height={50} />
              </label>
            <button type="submit" className="">
              Send
            </button>
          </form>
        </div>
        {viewingImage && (
          
        <div
          className="image-viewer-overlay"
          onClick={(e) => e.currentTarget === e.target && setViewingImage(null)}
          onMouseUp={handleMouseUp}
        >
          <div
            className="image-viewer-container "
            style={{
            
              // cursor: "pointer",
            }}
            onMouseUp={handleMouseUp}
            onClick={(e) => e.currentTarget === e.target && setViewingImage(null)}
          >
            <img
              ref={imageRef}
              src={viewingImage}
              alt="Viewing"
              className="image-viewer-img"
              style={{
                position: 'absolute',
                top: `${imagePosition.y}px`,
                left: `${imagePosition.x}px`,
                transform: `scale(${zoom})`,
                cursor: isHolding ? 'grabbing' : 'grab',
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
    // </div>
  );
};

export default ChatWindow;
