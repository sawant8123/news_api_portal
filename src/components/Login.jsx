import { GoogleLogin } from "@react-oauth/google";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const nav = useNavigate();
  const [err, setErr] = useState(null);

  const onSuccess = async (credResp) => {
    try {
      setErr(null);
      const id_token = credResp.credential; // Google ID token
      console.log("Google login successful, calling backend...");
      
      const res = await api.post("/auth/google/", { id_token });
      console.log("Backend response:", res.data);
      
      if (res.data.tokens && res.data.tokens.access) {
        localStorage.setItem("access", res.data.tokens.access);
        localStorage.setItem("refresh", res.data.tokens.refresh);
        console.log("Tokens stored, redirecting...");
        nav("/");
      } else {
        setErr("Invalid response from server - missing tokens");
      }
    } catch (e) {
      console.error("Login error:", e);
      const errorMessage = e?.response?.data?.detail || e?.message || "Login failed";
      setErr(errorMessage);
    }
  };

  const onError = () => setErr("Google login failed");

  return (
    <div style={{ display: "grid", placeItems: "center", height: "70vh" }}>
      <div style={{ padding: 24, border: "1px solid #eee", borderRadius: 8, minWidth: 320 }}>
        <h2 style={{ marginTop: 0 }}>Sign in</h2>
        <p>Use your Google account to continue.</p>
        <GoogleLogin onSuccess={onSuccess} onError={onError} />
        {err ? <p style={{ color: "red" }}>{err}</p> : null}
      </div>
    </div>
  );
}
