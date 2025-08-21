import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const nav = useNavigate();
  const loc = useLocation();
  const [isAuthed, setIsAuthed] = useState(false);

  // Check auth status on mount and when location changes
  useEffect(() => {
    setIsAuthed(!!localStorage.getItem("access"));
  }, [loc.pathname]);

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsAuthed(false);  // force re-render
    nav("/login");
  };

  return (
    <nav style={{ padding: "12px 16px", borderBottom: "1px solid #ddd", display: "flex", gap: 16 }}>
      <Link to="/" style={{ fontWeight: 700, textDecoration: "none" }}>News Portal</Link>
      {/* <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
        {isAuthed && loc.pathname !== "/login" && (
          <button onClick={logout}>Logout</button>
        )}
      </div> */}
    </nav>
  );
}
