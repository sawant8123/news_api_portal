import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import News from "./components/News";
import Login from "./components/Login";

function App() {
  return (
    
    <Router>
      
      {location.pathname !== "/login" && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<News />} />
      </Routes>
    </Router>
  );
}

export default App;
