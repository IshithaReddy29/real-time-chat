import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const signupUser = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await axios.post(
        "https://real-time-chat-2-2wr0.onrender.com/api/auth/signup",
        {
          name,
          email,
          password,
        }
      );

      alert("Account Created Successfully");

      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Signup Failed");
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
        onSubmit={signupUser}
        style={{
          width: "400px",
          background: "#fff",
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
          Create Account
        </h3>

        <input
          type="text"
          placeholder="Full Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />

        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={inputStyle}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "14px",
            background: "#4F46E5",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "17px",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          Sign Up
        </button>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          Already have an account?
          <Link
            to="/"
            style={{
              color: "#4F46E5",
              textDecoration: "none",
              fontWeight: "bold",
              marginLeft: "6px",
            }}
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginBottom: "15px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box",
};

export default Signup;