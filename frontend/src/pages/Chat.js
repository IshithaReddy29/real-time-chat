import { useRef } from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPaperPlane, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import io from "socket.io-client";
import axios from "axios";
import "./Chat.css";
import EmojiPicker from "emoji-picker-react";
import { FaSmile } from "react-icons/fa";


const socket = io("https://real-time-chat-2-2wr0.onrender.com");

function Chat() {

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) ||{};

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState("");
   const [search, setSearch] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
 
  const typingTimeout = useRef(null);
  

  // Redirect if not logged in
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
      return;
    }

    loadMessages();
    socket.emit("join", user.name);
    console.log("Joining server as:", user.name);
  socket.on("onlineUsers", (users) => {

    console.log("Received Online Users:", users);

    setOnlineUsers(users);

});

    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });
    socket.on("typing", (username) => {

    setTypingUser(username);

});

socket.on("stopTyping", () => {

    setTypingUser("");

});

   return () => {
  socket.off("receiveMessage");
  socket.off("onlineUsers");
  socket.off("typing");
  socket.off("stopTyping");
};

  }, [navigate,user.name]);

  // Load previous messages
  const loadMessages = async () => {
    try {
      const res = await axios.get("https://real-time-chat-2-2wr0.onrender.com/messages");


      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err);
    }
  };

  // Send Message
  const onEmojiClick = (emojiData) => {

    setMessage((prev) => prev + emojiData.emoji);

};
  const sendMessage = () => {

    if (message.trim() === "") return;

    const newMessage = {

      username: user.name || "Anonymous",

      message: message,

      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    socket.emit("sendMessage", newMessage);

    setMessage("");
    socket.emit("stopTyping");
  };

  // Logout
  const logout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    navigate("/");
  };

  const filteredMessages = messages.filter((msg) =>
    msg.message.toLowerCase().includes(search.toLowerCase()) ||
    msg.username.toLowerCase().includes(search.toLowerCase())
);

  return (
    <div className="chat-container">

  <div className="sidebar">
        <div className="online-users">

  <div className="online-title">
    <span>🟢 Online Users</span>
    <span className="count">{onlineUsers.length}</span>
  </div>

  {onlineUsers.length === 0 ? (

    <div className="empty-users">
      No users online
    </div>

  ) : (

    onlineUsers.map((name, index) => (

      <div className="online-user-card" key={index}>

        <div className="avatar">

          {name.charAt(0).toUpperCase()}

        </div>

        <div className="user-details">

          <div className="user-name">
            {name}
          </div>

          <div className="user-status">

            <span className="green-dot"></span>

            Online

          </div>

        </div>

      </div>

    ))

  )}

</div>
    <div className="profile">

      <FaUserCircle className="profile-icon" />

      <div>

        <h3>{user.name}</h3>

        <p>🟢 Online</p>

      </div>

    </div>

    <button className="logout-btn" onClick={logout}>
      <FaSignOutAlt />
      Logout
    </button>

  </div>

  <div className="chat-section">

    <div className="chat-header">

      <h2>💬ChatSphere</h2>

      <span>Real Time Chat</span>

    </div>

    <div className="search-box">

    <input
        type="text"
        placeholder="🔍 Search messages..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
    />

</div>

    <div className="messages">

      {filteredMessages.map((msg, index) => (

        <div
          key={index}
          className={
            msg.username === user.name
              ? "my-message"
              : "other-message"
          }
        >

          <div className="message-top">

            <strong>{msg.username}</strong>

            <span>{msg.time}</span>

          </div>

          <p>{msg.message}</p>

        </div>

      ))}

    </div>
    {typingUser && (

    <div className="typing">

         {typingUser} is typing...

    </div>

)}

    <div className="input-area">

    <div className="emoji-container">

        <button
            className="emoji-btn"
            onClick={() => setShowEmoji(!showEmoji)}
        >
            <FaSmile />
        </button>

        {showEmoji && (

            <div className="emoji-picker">

                <EmojiPicker
                    onEmojiClick={onEmojiClick}
                />

            </div>

        )}

    </div>

    <input

        type="text"

        placeholder="Type a message..."

        value={message}

        onChange={(e) => {

            setMessage(e.target.value);

            socket.emit("typing", user.name);

            clearTimeout(typingTimeout.current);

            typingTimeout.current = setTimeout(() => {

                socket.emit("stopTyping");

            }, 1000);

        }}

        onKeyDown={(e) => {

            if (e.key === "Enter") {

                sendMessage();

            }

        }}

    />

    <button onClick={sendMessage}>

        <FaPaperPlane />

    </button>

</div>

  </div>

</div>
);
}

export default Chat;