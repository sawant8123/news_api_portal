import { useEffect, useState, useCallback, useMemo } from "react";
import Select from "react-select";
import api from "../api";
import "./news.css";

export default function News() {
  const [articles, setArticles] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [country, setCountry] = useState("us");
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [viewMode, setViewMode] = useState("grid");
  const [userName, setUserName] = useState("User");

  const countries = useMemo(
    () => [
      { code: "us", name: "United States", icon: "🇺🇸" },
      { code: "gb", name: "United Kingdom", icon: "🇬🇧" },
      { code: "in", name: "India", icon: "🇮🇳" },
      { code: "ca", name: "Canada", icon: "🇨🇦" },
      { code: "au", name: "Australia", icon: "🇦🇺" },
      { code: "de", name: "Germany", icon: "🇩🇪" },
      { code: "fr", name: "France", icon: "🇫🇷" },
      { code: "jp", name: "Japan", icon: "🇯🇵" },
    ],
    []
  );
  
  
  const viewModes = useMemo(
    () => [
      { value: "grid", label: "Grid View", icon: "bi-grid-fill" },
      { value: "list", label: "List View", icon: "bi-list-ul" },
    ],
    []
  );
  

  const categories = useMemo(
    () => [
      { id: "general", name: "General", icon: "bi-newspaper" },
      { id: "technology", name: "Technology", icon: "bi-laptop" },
      { id: "business", name: "Business", icon: "bi-briefcase" },
      { id: "sports", name: "Sports", icon: "bi-trophy" },
      { id: "entertainment", name: "Entertainment", icon: "bi-film" },
      { id: "health", name: "Health", icon: "bi-heart-pulse" },
      { id: "science", name: "Science", icon: "bi-flask" },
      { id: "politics", name: "Politics", icon: "bi-building" },
    ],
    []
  );

  const load = useCallback(
    async (opts = {}) => {
      try {
        setLoading(true);
        setErr(null);
        const params = {};
        if (q) params.q = q;
        if (opts.country || country) params.country = opts.country || country;
        if (opts.category || selectedCategory)
          params.category = opts.category || selectedCategory;

        const res = await api.get("/news/", { params });

        if (res.data.articles?.length > 0) {
          setArticles(res.data.articles);
          setErr(null);
        } else {
          setArticles([]);
          setErr(
            q
              ? "No articles found for your search. Try a different keyword."
              : "No recent headlines available. Try selecting a different category or country."
          );
        }
      } catch (e) {
        console.error("News API error:", e);
        setErr(
          e?.response?.data?.detail || e?.message || "Failed to load news"
        );
        if (e?.response?.status === 401) {
          localStorage.clear();
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    },
    [q, country, selectedCategory]
  );

  const handleSearch = useCallback(() => {
    if (q.trim()) {
      setHasSearched(true);
      load();
    } else {
      setErr("Please enter a search term");
    }
  }, [q, load]);

  const handleRefresh = useCallback(() => {
    setHasSearched(false);
    setQ("");
    load();
  }, [load]);

  const handleCountryChange = useCallback(
    (option) => {
      setCountry(option.code);
      setHasSearched(false);
      setQ("");
      load({ country: option.code });
    },
    [load]
  );

  const handleViewModeChange = useCallback(
    (option) => {
      setViewMode(option.value);
    },
    []
  );

  const handleCategoryChange = useCallback(
    (category) => {
      setSelectedCategory(category);
      setHasSearched(false);
      setQ("");
      load({ category });
    },
    [load]
  );

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  const articleComponents = useMemo(() => {
    return articles.map((article, index) => (
      <div
        key={`${article.url}-${index}`}
        className={`article-card ${viewMode === "list" ? "list-mode" : ""}`}
        onClick={() => window.open(article.url, "_blank")}
      >
        {viewMode === "grid" ? (
          <>
            {article.image ? (
              <img
                src={article.image}
                alt={article.title}
                className="article-image-grid"
                loading="lazy"
              />
            ) : (
              <div className="article-placeholder-grid">📰</div>
            )}
            <div className="article-content">
              <h3 className="article-title">{article.title}</h3>
              <p className="article-description">
                {article.description || "No description available"}
              </p>
              <div className="article-meta">
                <span>{article.source || "Unknown Source"}</span>
                <span>{formatDate(article.publishedAt)}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            {article.image ? (
              <img
                src={article.image}
                alt={article.title}
                className="article-image-list"
                loading="lazy"
              />
            ) : (
              <div className="article-placeholder-list">📰</div>
            )}
            <div className="article-text-list">
              <h3 className="article-title-list">{article.title}</h3>
              <p className="article-description-list">
                {article.description || "No description available"}
              </p>
              <div className="article-meta-list">
                <span>{article.source || "Unknown Source"}</span>
                <span>{formatDate(article.publishedAt)}</span>
              </div>
            </div>
          </>
        )}
      </div>
    ));
  }, [articles, viewMode, formatDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (q.trim() && q.length > 2) {
        setHasSearched(true);
        load();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [q, load]);

  useEffect(() => {
    load({ country: "us", category: "general" });
  }, [load]);

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) setUserName(storedUserName);
  }, []);

  return (
    <div className="news-container">
      {/* HEADER */}
      <div className="header">
        <div className="header-inner">
          <div className="logo-section">
            <div className="logo-circle">
              <i className="bi bi-newspaper"></i>
            </div>
            <div>
              <h1 className="logo-title">NEWS PORTAL</h1>
              <p className="logo-subtitle">
                Stay informed, connected, and empowered
              </p>
            </div>
          </div>
          <div className="user-info">
            <div className="user-badge">
              <div className="user-icon">
                <i className="bi bi-person"></i>
              </div>
              <span>{userName}</span>
            </div>
            <button
              className="logout-btn"
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
            >
              <i className="bi bi-box-arrow-right"></i> Logout
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="container">
        <div className="controls">
          <div className="controls-row">
            {/* Country Dropdown with Flags */}
            <Select
  className="custom-select"
  value={countries.find((c) => c.code === country)}
  onChange={handleCountryChange}
  options={countries}
  getOptionLabel={(option) => {
    if (!option) return "";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "1.2rem" }}>{option.icon}</span>
        <span>{option.name || option.label}</span>
      </div>
    );
  }}
  getOptionValue={(option) => option.code}
/>


            {/* View Mode Dropdown with Icons */}
            <Select
              className="custom-select"
              value={viewModes.find((m) => m.value === viewMode)}
              onChange={handleViewModeChange}
              options={viewModes}
            />

            <button
              onClick={handleRefresh}
              className="refresh-btn"
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {/* Search Row */}
          <div className="controls-row">
            <input
              className="search-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for news..."
            />
            <button
              className="search-btn"
              onClick={handleSearch}
              disabled={loading || !q.trim()}
            >
              Search
            </button>
          </div>

          {/* Categories */}
          <div className="categories">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`category-btn ${
                  selectedCategory === category.id ? "active" : ""
                }`}
              >
                <i className={`bi ${category.icon}`}></i> {category.name}
              </button>
            ))}
          </div>
        </div>

        {err && <div className="error-box">{err}</div>}
        {loading && <div className="loading-box">Loading the latest news...</div>}

        {!loading && !err && articles.length > 0 && (
          <div className={viewMode === "grid" ? "article-grid" : "article-list"}>
            {articleComponents}
          </div>
        )}
      </div>
    </div>
  );
}
