import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Home/Home";
import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";
import ClientDashboard from "./components/Dashboard/ClientDashboard";
import LoanRequestForm from "./components/LoanRequest/LoanRequestForm";

function parseJwt(token) {
  if (!token) return null; // Evita el error si es null
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join(""),
  );

  return JSON.parse(jsonPayload);
}

// Validar expiración del token

function App() {
  const rawToken = localStorage.getItem("token");
  const payload = parseJwt(rawToken);
  const now = new Date().getTime();

  const tokenValido = payload ? payload.exp * 1000 > now : false;

  const [user, setUser] = useState(
    payload && tokenValido ? { name: payload.first_name } : null,
  );
  // const [user, setUser] = useState(null);

  return (
    <div className="App">
      {/* user ? <Navigate to="/dashboard" /> : */}

      <Navbar user={user} />
      <Routes>
        <Route
          path="/"
          element={tokenValido ? <Home /> : <Navigate to="/login" />}
        />
        <Route path="/login" element={<Login />} />
        <Route
          path="/register"
          element={
            user ? <Navigate to="/dashboard" /> : <Register setUser={setUser} />
          }
        />
        <Route
          path="/new-request"
          element={
            user ? <LoanRequestForm user={user} /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/dashboard"
          element={
            user ? <ClientDashboard user={user} /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
