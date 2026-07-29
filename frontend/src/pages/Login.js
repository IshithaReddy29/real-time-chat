import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login({ setToken }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

 const loginUser = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post(
      "https://real-time-chat-cu4o.onrender.com/api/auth/login",
      {
        email,
        password,
      }
    );

    // Save login details
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    // Update App.js state immediately
    setToken(res.data.token);

    alert("Login Successful");

    // Navigate to chat page
    navigate("/chat");

  } catch (err) {
  console.log(err.response);
  alert(err.response?.data?.message || err.message);
}
};
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg,#667eea,#764ba2)",
      }}
    >
      <form
        onSubmit={loginUser}
        style={{
          width: "380px",
          background: "white",
          padding: "35px",
          borderRadius: "20px",
          boxShadow: "0 15px 35px rgba(0,0,0,.2)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#4F46E5",
          }}
        >
          💬 ChatSphere
        </h1>

        <h3
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          Welcome Back 👋
        </h3>

        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "20px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            fontSize: "15px",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "20px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            fontSize: "15px",
          }}
        />

        <button
          style={{
            width: "100%",
            padding: "14px",
            background: "#4F46E5",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "17px",
            cursor: "pointer",
          }}
        >
          Login
        </button>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          Don't have an account?
          <Link
            to="/signup"
            style={{
              textDecoration: "none",
              color: "#4F46E5",
              marginLeft: "6px",
              fontWeight: "bold",
            }}
          >
            Signup
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;