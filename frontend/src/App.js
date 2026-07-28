import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useState } from "react";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";


function App() {

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );


  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={
            token ? 
            <Navigate to="/chat" /> : 
            <Login setToken={setToken} />
          }
        />


        <Route
          path="/signup"
          element={
            token ?
            <Navigate to="/chat" /> :
            <Signup />
          }
        />


        <Route
          path="/chat"
          element={
            token ?
            <Chat /> :
            <Navigate to="/" />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;