//create a nav bar component
import React from "react";
import "../styles/Nav.css";
import { useEffect, useState } from "react";
import logo from "../assets/logo192.png";

const Nav = ({ pageTitle = "EduAttend", userType = null }) => {
  // eslint-disable-next-line
  const [user, setuser] = useState({
    email: localStorage.getItem("email"),
    name: localStorage.getItem("name"),
    type: localStorage.getItem("type"),
  });

  const refresh = () => {
    setuser({
      email: localStorage.getItem("email"),
      name: localStorage.getItem("name"),
      type: localStorage.getItem("type"),
    });
  };

  useEffect(() => {
    refresh();
  }, []);

  // Determine what to show in the right corner based on user type or page
  const getRightContent = () => {
    // Always show user's name if available, regardless of type
    if (user.name) {
      return `${user.name}`;
    } else if (user.type === 'student' || userType === 'student') {
      return 'Student Profile';
    } else if (user.type === 'teacher' || userType === 'teacher') {
      return 'Teacher Profile';
    } else {
      return pageTitle;
    }
  };

  return (
    <div className="nav-container">
      <nav>
        <div className="nav-left">
          <a href="/" className="logo-link">
            <img style={{ width: "40px", height: "40px" }} src={logo} alt="EduAttend Logo" />
            <span className="logo-text">EduAttend</span>
          </a>
        </div>
        <div className="nav-right">
          <span className="page-title">{getRightContent()}</span>
        </div>
      </nav>
    </div>
  );
};

export default Nav;
