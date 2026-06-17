import { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {

    const loadMessages = async () => {

        const res = await axios.get(
            "http://localhost:5000/messages"
        );

        setMessages(res.data);
    };

    loadMessages();

    socket.on("receiveMessage", (data) => {

        setMessages((prev) => [...prev, data]);

    });

    return () => {

        socket.off("receiveMessage");

    };

}, []);

  const sendMessage = () => {
    if (!username.trim() || !message.trim()) return;

    socket.emit("sendMessage", {
      username,
      message,
      time: new Date().toLocaleTimeString(),
    });

    setMessage("");
  };

  return (
  <div
    style={{
      maxWidth: "800px",
      margin: "20px auto",
      border: "1px solid #ddd",
      borderRadius: "10px",
      padding: "20px",
      backgroundColor: "#fff"
    }}
  >
    <h1 style={{ textAlign: "center" }}>
      Real Time Chat App
    </h1>

    <input
      type="text"
      placeholder="Enter Username"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      style={{
        width: "100%",
        padding: "10px",
        marginBottom: "10px",
        border: "1px solid #ccc",
        borderRadius: "8px"
      }}
    />

    <div
      style={{
        height: "400px",
        overflowY: "auto",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "10px",
        marginBottom: "10px",
        backgroundColor: "#f8f9fa"
      }}
    >
      {messages.map((msg, index) => (
        <div
          key={index}
          style={{
            backgroundColor: "#e9ecef",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "10px"
          }}
        >
          <strong>{msg.username}</strong>

          <span
            style={{
              float: "right",
              color: "gray",
              fontSize: "12px"
            }}
          >
            {msg.time}
          </span>

          <br />

          {msg.message}
        </div>
      ))}
    </div>

    <div
      style={{
        display: "flex",
        gap: "10px"
      }}
    >
      <input
        type="text"
        placeholder="Type Message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendMessage();
          }
        }}
        style={{
          flex: 1,
          padding: "12px",
          border: "1px solid #ccc",
          borderRadius: "8px"
        }}
      />

      <button
        onClick={sendMessage}
        style={{
          padding: "12px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        Send
      </button>
    </div>
  </div>
);
}

export default App;