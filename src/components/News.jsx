import { useEffect, useState } from "react";
import api from "../api";

export default function News() {
  const [articles, setArticles] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [country, setCountry] = useState("us");
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  const countries = [
    { code: "us", name: "United States" },
    { code: "gb", name: "United Kingdom" },
    { code: "in", name: "India" },
    { code: "ca", name: "Canada" },
    { code: "au", name: "Australia" },
    { code: "de", name: "Germany" },
    { code: "fr", name: "France" },
    { code: "jp", name: "Japan" },
  ];

  const categories = [
    { id: "general", name: "General", icon: "📰" },
    { id: "technology", name: "Technology", icon: "💻" },
    { id: "business", name: "Business", icon: "💼" },
    { id: "sports", name: "Sports", icon: "⚽" },
    { id: "entertainment", name: "Entertainment", icon: "🎬" },
    { id: "health", name: "Health", icon: "🏥" },
    { id: "science", name: "Science", icon: "🔬" },
    { id: "politics", name: "Politics", icon: "🏛️" },
  ];

  const load = async (opts = {}) => {
    try {
      setLoading(true);
      setErr(null);
      const params = {};
      if (q) params.q = q;
      if (opts.country || country) params.country = opts.country || country;
      if (opts.category || selectedCategory) params.category = opts.category || selectedCategory;
      
      console.log("Fetching news with params:", params);
      const res = await api.get("/news/", { params });
      console.log("News API response:", res.data);
      
      if (res.data.articles && res.data.articles.length > 0) {
        setArticles(res.data.articles);
        setErr(null);
      } else {
        setArticles([]);
        if (q) {
          setErr("No articles found for your search. Try a different keyword.");
        } else {
          setErr("No recent headlines available. Try selecting a different category or country.");
        }
      }
    } catch (e) {
      console.error("News API error:", e);
      const errorMessage = e?.response?.data?.detail || e?.message || "Failed to load news";
      setErr(errorMessage);
      
      if (e?.response?.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (q.trim()) {
      setHasSearched(true);
      load();
    } else {
      setErr("Please enter a search term");
    }
  };

  const handleRefresh = () => {
    setHasSearched(false);
    setQ("");
    load();
  };

  const handleCountryChange = (newCountry) => {
    setCountry(newCountry);
    setHasSearched(false);
    setQ("");
    load({ country: newCountry });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setHasSearched(false);
    setQ("");
    load({ category });
  };

  useEffect(() => {
    load({ country: "us", category: "general" });
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header Section */}
      <div style={{ 
        background: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)", 
        padding: "30px", 
        borderRadius: "15px", 
        marginBottom: "30px",
        color: "white",
        textAlign: "center",
        boxShadow: "0 8px 32px rgba(220, 53, 69, 0.3)"
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: "2.5rem", 
          fontWeight: "bold",
          textShadow: "2px 2px 4px rgba(0,0,0,0.3)"
        }}>
          NEWS PORTAL
        </h1>
        <p style={{ 
          margin: "10px 0 0 0", 
          fontSize: "1.1rem", 
          opacity: 0.9 
        }}>
          Stay informed, connected, and empowered with the latest news
        </p>
      </div>

      {/* Controls Section */}
      <div style={{ 
        backgroundColor: "white", 
        padding: "25px", 
        borderRadius: "15px", 
        marginBottom: "25px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
      }}>
        {/* Top Row - Country and View Mode */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.1rem" }}>🌍</span>
            <select 
              value={country} 
              onChange={(e) => handleCountryChange(e.target.value)}
              style={{ 
                padding: "10px 15px", 
                border: "2px solid #e9ecef", 
                borderRadius: "8px", 
                fontSize: "14px",
                minWidth: "140px",
                outline: "none"
              }}
            >
              {countries.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.1rem" }}>👁️</span>
            <select 
              value={viewMode} 
              onChange={(e) => setViewMode(e.target.value)}
              style={{ 
                padding: "10px 15px", 
                border: "2px solid #e9ecef", 
                borderRadius: "8px", 
                fontSize: "14px",
                minWidth: "100px",
                outline: "none"
              }}
            >
              <option value="grid">Grid View</option>
              <option value="list">List View</option>
            </select>
          </div>

          <button 
            onClick={handleRefresh} 
            disabled={loading}
            style={{ 
              padding: "10px 20px", 
              backgroundColor: "#6c757d", 
              color: "white", 
              border: "none", 
              borderRadius: "8px", 
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              fontSize: "14px"
            }}
          >
            {loading ? "🔄 Loading..." : "🔄 Refresh"}
          </button>
        </div>

        {/* Search Row */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for news, topics, or keywords..."
            style={{ 
              flex: 1, 
              padding: "12px 20px", 
              border: "2px solid #e9ecef", 
              borderRadius: "8px", 
              fontSize: "16px",
              minWidth: "300px",
              outline: "none",
              transition: "border-color 0.3s"
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            onFocus={(e) => e.target.style.borderColor = "#dc3545"}
            onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
          />
          <button 
            onClick={handleSearch} 
            disabled={loading || !q.trim()}
            style={{ 
              padding: "12px 30px", 
              backgroundColor: "#dc3545", 
              color: "white", 
              border: "none", 
              borderRadius: "8px", 
              cursor: loading || !q.trim() ? "not-allowed" : "pointer",
              opacity: loading || !q.trim() ? 0.6 : 1,
              fontSize: "16px",
              fontWeight: "bold",
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#c82333"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "#dc3545"}
          >
            🔍 Search
          </button>
        </div>

        {/* Categories Row */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              style={{
                padding: "8px 16px",
                backgroundColor: selectedCategory === category.id ? "#dc3545" : "#f8f9fa",
                color: selectedCategory === category.id ? "white" : "#495057",
                border: `2px solid ${selectedCategory === category.id ? "#dc3545" : "#e9ecef"}`,
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: selectedCategory === category.id ? "bold" : "normal",
                transition: "all 0.3s",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== category.id) {
                  e.target.style.backgroundColor = "#e9ecef";
                  e.target.style.borderColor = "#dc3545";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category.id) {
                  e.target.style.backgroundColor = "#f8f9fa";
                  e.target.style.borderColor = "#e9ecef";
                }
              }}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Error and Loading States */}
      {err && (
        <div style={{ 
          backgroundColor: "#f8d7da", 
          color: "#721c24", 
          padding: "20px", 
          borderRadius: "10px", 
          marginBottom: "25px",
          textAlign: "center",
          border: "1px solid #f5c6cb"
        }}>
          <p style={{ margin: 0, fontSize: "16px" }}>{err}</p>
        </div>
      )}

      {loading && (
        <div style={{ 
          textAlign: "center", 
          padding: "60px 20px",
          backgroundColor: "white",
          borderRadius: "15px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "20px" }}>🔄</div>
          <p style={{ fontSize: "18px", color: "#6c757d", margin: 0 }}>Loading the latest news...</p>
        </div>
      )}

      {/* Welcome Message */}
      {!loading && !err && articles.length === 0 && !hasSearched && (
        <div style={{ 
          textAlign: "center", 
          padding: "60px 20px",
          backgroundColor: "white",
          borderRadius: "15px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "4rem", marginBottom: "20px" }}>📰</div>
          <h3 style={{ color: "#dc3545", marginBottom: "15px" }}>Welcome to News Portal!</h3>
          <p style={{ color: "#6c757d", fontSize: "16px", margin: "0 0 20px 0" }}>
            Select a category above to see the latest headlines, or search for specific topics.
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            {categories.slice(0, 4).map(category => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold"
                }}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Articles Grid/List */}
      {!loading && !err && articles.length > 0 && (
        <div style={{ 
          backgroundColor: "white", 
          padding: "25px", 
          borderRadius: "15px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "25px" 
          }}>
            <h2 style={{ margin: 0, color: "#343a40" }}>
              {q ? `Search Results for "${q}"` : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} News`}
            </h2>
            <span style={{ 
              backgroundColor: "#dc3545", 
              color: "white", 
              padding: "6px 12px", 
              borderRadius: "15px", 
              fontSize: "14px",
              fontWeight: "bold"
            }}>
              {articles.length} articles
            </span>
          </div>

          <div style={{
            display: viewMode === "grid" ? "grid" : "block",
            gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(350px, 1fr))" : "1fr",
            gap: viewMode === "grid" ? "25px" : "0"
          }}>
            {articles.map((article, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid #e9ecef",
                  borderRadius: "12px",
                  overflow: "hidden",
                  transition: "all 0.3s",
                  cursor: "pointer",
                  backgroundColor: "white",
                  ...(viewMode === "list" && {
                    display: "flex",
                    marginBottom: "20px",
                    padding: "20px"
                  })
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-5px)";
                  e.target.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}
                onClick={() => window.open(article.url, '_blank')}
              >
                {viewMode === "grid" ? (
                  // Grid View
                  <>
                    {article.image ? (
                      <img 
                        src={article.image} 
                        alt={article.title} 
                        style={{ 
                          width: "100%", 
                          height: "200px", 
                          objectFit: "cover" 
                        }} 
                      />
                    ) : (
                      <div style={{ 
                        height: "200px", 
                        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "3rem",
                        color: "#adb5bd"
                      }}>
                        📰
                      </div>
                    )}
                    <div style={{ padding: "20px" }}>
                      <h3 style={{ 
                        margin: "0 0 12px 0", 
                        fontSize: "18px", 
                        lineHeight: "1.4",
                        color: "#343a40",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}>
                        {article.title}
                      </h3>
                      <p style={{ 
                        margin: "0 0 15px 0", 
                        color: "#6c757d", 
                        fontSize: "14px",
                        lineHeight: "1.5",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}>
                        {article.description || "No description available"}
                      </p>
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center",
                        fontSize: "12px",
                        color: "#adb5bd"
                      }}>
                        <span>{article.source || "Unknown Source"}</span>
                        <span>{formatDate(article.publishedAt)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  // List View
                  <>
                    {article.image ? (
                      <img 
                        src={article.image} 
                        alt={article.title} 
                        style={{ 
                          width: "120px", 
                          height: "120px", 
                          objectFit: "cover",
                          borderRadius: "8px",
                          marginRight: "20px"
                        }} 
                      />
                    ) : (
                      <div style={{ 
                        width: "120px", 
                        height: "120px", 
                        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                        borderRadius: "8px",
                        marginRight: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "2rem",
                        color: "#adb5bd"
                      }}>
                        📰
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        margin: "0 0 10px 0", 
                        fontSize: "20px", 
                        lineHeight: "1.3",
                        color: "#343a40"
                      }}>
                        {article.title}
                      </h3>
                      <p style={{ 
                        margin: "0 0 15px 0", 
                        color: "#6c757d", 
                        fontSize: "15px",
                        lineHeight: "1.5"
                      }}>
                        {article.description || "No description available"}
                      </p>
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center",
                        fontSize: "13px",
                        color: "#adb5bd"
                      }}>
                        <span>{article.source || "Unknown Source"}</span>
                        <span>{formatDate(article.publishedAt)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
