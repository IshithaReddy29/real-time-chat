
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaPaperPlane, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import io from "socket.io-client";
import axios from "axios";
import "./Chat.css";
import EmojiPicker from "emoji-picker-react";
import { FaSmile } from "react-icons/fa";


const socket = io("https://real-time-chat-cu4o.onrender.com");

function Chat() {

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) ||{};

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedMessage, setEditedMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState("");
   const [search, setSearch] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
 
  const typingTimeout = useRef(null);

  const loadMessages = useCallback(async () => {

  if (!selectedUser) {
    setMessages([]);
    return;
  }

  try {

    const res = await axios.get(
      `https://real-time-chat-cu4o.onrender.com/messages?sender=${user.name}&receiver=${selectedUser}`
    );

    setMessages(Array.isArray(res.data) ? res.data : []);

  } catch (err) {
    console.log(err);
  }

}, [user.name, selectedUser]);
  
  useEffect(() => {localStorage.setItem("darkMode", darkMode);}, [darkMode]);
  // Redirect if not logged in

  useEffect(() => {

    if (user.name) {
        socket.emit("join", user.name);
    }

    return () => {
        socket.off("onlineUsers");
        socket.off("receiveMessage");
        socket.off("typing");
        socket.off("stopTyping");
        socket.off("messageDeleted");
    };

}, [user.name]);


  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
      return;
    }

    loadMessages();
    
  console.log("Joining server as:", user.name);
  socket.on("onlineUsers", (users) => {

    console.log("Received Online Users:", users);

    setOnlineUsers(users);

});



    socket.on("receiveMessage", (data) => {
      setMessages((prev) => {

    const exists = prev.some(
        (msg) =>
            msg.sender === data.sender &&
            msg.receiver === data.receiver &&
            msg.message === data.message &&
            msg.time === data.time
    );

    if (exists) return prev;

    return [...prev, data];

});
});

socket.on("messageEdited", (updatedMessage) => {

    setMessages((prev) =>
        prev.map((msg) =>
            msg._id === updatedMessage._id
                ? { ...msg, message: updatedMessage.message }
                : msg
        )
    );

});

socket.on("messageDeleted", (id) => {

  setMessages((prev) =>
    prev.filter((msg) => msg._id !== id)
  );

});

socket.on("typing", (data) => {
    console.log("Typing event:", data);

    if (typeof data === "string") {
        setTypingUser(data);
    } else {
        setTypingUser(data.sender);
    }
});

socket.on("stopTyping", () => {

    setTypingUser("");

});

   return () => {
  socket.off("receiveMessage");
  socket.off("messageEdited");
  socket.off("onlineUsers");
  socket.off("typing");
  socket.off("stopTyping");
  socket.off("messageDeleted");
};

  }, [navigate,user.name,selectedUser,loadMessages]);

  // Load previous messages

  // Send Message
  const onEmojiClick = (emojiData) => {

    setMessage((prev) => prev + emojiData.emoji);

};
  const sendMessage = () => {

  if (message.trim() === "") return;

  if (!selectedUser) {
    alert("Please select a user first.");
    return;
  }

  const newMessage = {

    sender: user.name || "Anonymous",

    receiver: selectedUser,

    message: message,

    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),

  };
  console.log("Sending:", newMessage);
  
if (selectedUser === user.name) {
  alert("You can't send messages to yourself.");
  return;
}
  socket.emit("sendMessage", newMessage);

  setMessage("");

  socket.emit("stopTyping");

};

const deleteMessage = async (id) => {

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this message?"
  );

  if (!confirmDelete) return;

  try {

    await axios.delete(
      `https://real-time-chat-cu4o.onrender.com/messages/${id}`
    );

    setMessages((prev) =>
      prev.filter((msg) => msg._id !== id)
    );

  } catch (err) {

    console.log(err);

  }

};

const editMessage = (msg) => {
    setEditingId(msg._id);
    setEditedMessage(msg.message);
};

const saveEditedMessage = async (id) => {

    if (editedMessage.trim() === "") return;

    try {

        await axios.put(
            `https://real-time-chat-cu4o.onrender.com/messages/${id}`,
            {
                message: editedMessage,
            }
        );

        socket.emit("editMessage", {
            _id: id,
            message: editedMessage,
        });

        setMessages((prev) =>
            prev.map((msg) =>
                msg._id === id
                    ? { ...msg, message: editedMessage }
                    : msg
            )
        );

        setEditingId(null);
        setEditedMessage("");

    } catch (err) {
        console.log(err);
    }

};

  // Logout
  const logout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    navigate("/");
  };

  const filteredMessages = messages.filter((msg) =>
    msg.message.toLowerCase().includes(search.toLowerCase()) ||
    msg.sender.toLowerCase().includes(search.toLowerCase())
);

  return (
    <div className="chat-container"
    style={{
  background: darkMode ? "#121212" : "#f5f5f5",
  color: darkMode ? "white" : "black",
  transition: "0.3s",
}}>
      

  <div className="sidebar"
  style={{
    background: darkMode ? "#1E1E1E" : "#1f2937",
    color: "white",
  }}>
        <div className="online-users"
        style={{
  background: darkMode ? "#121212" : "#f5f5f5",
  color: darkMode ? "white" : "black",
  transition: "0.3s",
}}>

  <div
  className="online-title"
  style={{
    color: darkMode ? "white" : "#1f2937",
  }}
>
  <span>🟢 Online Users</span>

  <span className="count">
  {onlineUsers.filter((name) => name !== user.name).length}
</span>
</div>

  {onlineUsers.length === 0 ? (

    <div className="empty-users">
      No users online
    </div>

  ) : (

    onlineUsers
  .filter((name) => name !== user.name)
  .map((name, index) => (

  <div
    className="online-user-card"
    key={index}
    onClick={() => setSelectedUser(name)}
    style={{
      background: selectedUser === name
        ? "#4F46E5"
        : "#374151",
      cursor: "pointer",
      transition: "0.3s",
    }}
  >

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

        <h3 style={{
    color: "white",
  }}>{user.name}</h3>

        <p style={{
    color: "#4ade80",
  }}>🟢 Online</p>

      </div>

    </div>

    <button className="logout-btn" onClick={logout}>
      <FaSignOutAlt />
      Logout
    </button>

  </div>

  <div className="chat-section"
  style={{
  background: darkMode ? "#181818" : "#ffffff",
}}>

    
    <div
  className="chat-header"
  style={{
    background: darkMode ? "#242424" : "white",
    color: darkMode ? "white" : "black",
  }}
>

      <h2>
  {selectedUser
    ? `💬 Chat with ${selectedUser}`
    : "💬 Select a user"}
</h2>
      <button
  onClick={() => setDarkMode(!darkMode)}
  style={{
    padding: "8px 12px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginRight: "10px",
    background: darkMode ? "#FFD54F" : "#333",
    color: darkMode ? "#000" : "#fff",
    fontWeight: "bold",
  }}
>
  {darkMode ? "☀️ Light" : "🌙 Dark"}
</button>

      <span>Real Time Chat</span>

    </div>

    <div className="search-box"
    style={{
  background: darkMode ? "#2a2a2a" : "white",
  color: darkMode ? "white" : "black",
}}>

    <input
        type="text"
        placeholder="🔍 Search messages..."
        value={search}
        style={{
    background: darkMode ? "#333" : "#f3f4f6",
    color: darkMode ? "white" : "black",
  }}
        onChange={(e) => setSearch(e.target.value)}
    />

</div>

    <div className="messages">

      {filteredMessages
  .filter((msg) => {

    if (!selectedUser) return false;

    return (
      (msg.sender === user.name &&
        msg.receiver === selectedUser) ||

      (msg.sender === selectedUser &&
        msg.receiver === user.name)
    );

  })
  .map((msg, index) => (
        <div
          key={index}
          className={
  msg.sender === user.name
    ? "my-message"
    : "other-message"
}
        >

          <div className="message-top">
    <strong>{msg.sender}</strong>
    <span>{msg.time}</span>
</div>

{editingId === msg._id ? (
    <div className="edit-container">

        <input
            type="text"
            value={editedMessage}
            onChange={(e) => setEditedMessage(e.target.value)}
            className="edit-input"
        />

        <div className="edit-actions">

            <button
                className="save-btn"
                onClick={() => saveEditedMessage(msg._id)}
            >
                Save
            </button>

            <button
                className="cancel-btn"
                onClick={() => {
                    setEditingId(null);
                    setEditedMessage("");
                }}
            >
                Cancel
            </button>

        </div>

    </div>
) : (
    <p>{msg.message}</p>
)}

{msg.sender === user.name && editingId !== msg._id && (
    <div className="message-actions">
        <button
            className="edit-btn"
            onClick={() => editMessage(msg)}
        >
            Edit
        </button>

        <button
            className="delete-btn"
            onClick={() => deleteMessage(msg._id)}
        >
            Delete
        </button>
    </div>
)}

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

    if (selectedUser) {
        socket.emit("typing", {
            sender: user.name,
            receiver: selectedUser,
        });
    }

    clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {

        socket.emit("stopTyping", {
            sender: user.name,
            receiver: selectedUser,
        });

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