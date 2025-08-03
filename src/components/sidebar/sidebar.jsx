import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/client";
import {
  LayoutDashboard,
  School,
  SheetIcon,
  UserRound,
  UserRoundPen,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";
import "./sidebar.css";

const SideBar = ({ name }) => {
  const location = useLocation();
  const [selectedNav, setSelectedNav] = useState("dashboard");

  // Update selected nav based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") {
      setSelectedNav("dashboard");
    } else if (path === "/search") {
      setSelectedNav("search");
    } else if (path === "/profile") {
      setSelectedNav("profile");
    } else if (path === "/export") {
      setSelectedNav("export");
    }
  }, [location.pathname]);

  const handleLogOut = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Error logging out");
    } else {
      alert("Signed Out");
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <UserRound size={24} color="#123458" />
        <h3>Welcome, {name}</h3>
      </div>
      <nav className="sidebar-nav">
        <Link
          to="/"
          className={`nav-div ${selectedNav === "dashboard" ? "selected" : ""}`}
          onClick={() => setSelectedNav("dashboard")}
        >
          <LayoutDashboard />
          <span className="nav-link">Home</span>
        </Link>

        <Link
          to="/search"
          className={`nav-div ${selectedNav === "search" ? "selected" : ""}`}
          onClick={() => setSelectedNav("search")}
        >
          <School />
          <span className="nav-link">Search</span>
        </Link>

        <Link
          to="/profile"
          className={`nav-div ${selectedNav === "profile" ? "selected" : ""}`}
          onClick={() => setSelectedNav("profile")}
        >
          <UserRoundPen />
          <span className="nav-link">Profile</span>
        </Link>

        <Link
          to="/export"
          className={`nav-div ${selectedNav === "export" ? "selected" : ""}`}
          onClick={() => setSelectedNav("export")}
        >
          <SheetIcon />
          <span className="nav-link">Export</span>
        </Link>
      </nav>

      <button onClick={handleLogOut} className="logout-btn">
        Log Out
      </button>
    </div>
  );
};

export default SideBar;
