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

        if (res.data.user && res.data.user.name) {
          localStorage.setItem("userName", res.data.user.name);
        }

        console.log("Tokens and user info stored, redirecting...");
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
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        fontFamily: "'Roboto', sans-serif",
      }}
    >
      <div
        style={{
          padding: "40px 30px",
          borderRadius: "12px",
          background: "#fff",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          width: "350px",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "16px", color: "#333" }}>Welcome Back!</h1>
        <p style={{ marginBottom: "24px", color: "#555", fontSize: "14px" }}>
          Sign in with your Google account to continue
        </p>

        <div style={{ marginBottom: "16px" }}>
          <GoogleLogin onSuccess={onSuccess} onError={onError} />
        </div>

        {err && (
          <p
            style={{
              color: "#f44336",
              background: "#fdecea",
              padding: "10px",
              borderRadius: "6px",
              fontSize: "13px",
              marginTop: "12px",
            }}
          >
            {err}
          </p>
        )}

        <div style={{ marginTop: "20px", fontSize: "12px", color: "#777" }}>
          By signing in, you agree to our <span style={{ color: "#1976d2", cursor: "pointer" }}>Terms of Service</span> and{" "}
          <span style={{ color: "#1976d2", cursor: "pointer" }}>Privacy Policy</span>.
        </div>
      </div>
    </div>
  );
}
