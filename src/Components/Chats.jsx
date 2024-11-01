// /src/Components/Chats.jsx

import React, { useContext, useEffect, useRef, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';

const Chats = () => {
  const [chats, setChats] = useState([]);
  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);
  const selectedChatRef = useRef(null);
  const [messageLength, setMessageLength] = useState(30);

  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(doc(db, 'userChats', currentUser.uid), (doc) => {
        setChats(doc.data());
      });

      return () => {
        unsub();
      };
    };

    currentUser.uid && getChats();
  }, [currentUser.uid]);

  useEffect(() => {
    // Update message length based on window width
    const updateMessageLength = () => {
      setMessageLength(Math.floor(window.innerWidth / 25)); // Adjust 25 to change the character density
    };

    updateMessageLength(); // Initial call
    window.addEventListener('resize', updateMessageLength);

    return () => window.removeEventListener('resize', updateMessageLength);
  }, []);

  const handleSelect = (u) => {
    dispatch({ type: "CHANGE_USER", payload: u });
    if (selectedChatRef.current) {
      selectedChatRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Function to truncate the message
  const truncateMessage = (message, maxLength) => {
    if (!message) return '';
    return message.length > maxLength ? message.slice(0, maxLength) + '...' : message;
  };

  return (
    <div className="chats">
      {Object.entries(chats)
        ?.sort((a, b) => b[1].date - a[1].date)
        .map((chat) => (
          <div
            className="userChat"
            key={chat[0]}
            onClick={() => handleSelect(chat[1].userInfo)}
            ref={chat[1].userInfo.uid === currentUser.uid ? selectedChatRef : null}
          >
            <img src={chat[1].userInfo.photoURL} alt="" />
            <div className="userChatInfo">
              <span>{chat[1].userInfo.displayName}</span>
              <p>{truncateMessage(chat[1].lastMessage?.text, messageLength)}</p>
            </div>
          </div>
      ))}
    </div>
  );
};

export default Chats;
