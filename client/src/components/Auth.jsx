// src/Auth.js
import React, { useState } from "react";
import axios from "axios";
import "./Auth.css";
import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import Cookies from "js-cookie";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
const usernameRegex = /^[a-z0-9_.]{2,}$/;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const [errors, setErrors] = useState({});

  const [isRequesting, setIsRequesting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    } else if (name === "username") {
      setUsername(value);
    }
  };

  const resetData = () => {
    setEmail("");
    setPassword("");
    setUsername("");
  };

  const validate = () => {
    const newErrors = {};
    if (!emailRegex.test(email) && !isLogin) {
      newErrors.email = "Invalid email address";
    }
    if (email.length <= 0 && isLogin) {
      newErrors.email = "Email or Username is required";
    }
    if (!passwordRegex.test(password)) {
      newErrors.password =
        "Password must be at least 8 characters long, contain at least one number, one special character, one uppercase and one lowercase letter";
    }
    if (!isLogin && !usernameRegex.test(username)) {
      newErrors.username =
        "Username must be at least 2 characters long and can contain only letters, numbers, underscores, and periods";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      // Handle form submission
      if (isLogin) {
        try {
          setIsRequesting(true);
          const res = await axios({
            url: "http://localhost:3001/api/auth/login",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            data: {
              emailOrUsername: email,
              password: password,
            },
          });
          //   print token
          //   console.log(res.data.token);
          if (res.status === 200) {
            alert("Login successful");
            // TO DO (perform any task on login)
            Cookies.set("token", res.data.token, { expires: 1 });
          }
        } catch (err) {
          console.log(err.response.data.message);
          alert(err.response.data.message);
        } finally {
          setIsRequesting(false);
        }
      } else {
        try {
          setIsRequesting(true);
          const res = await axios({
            url: "http://localhost:3001/api/auth/register",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            data: {
              username: username,
              email: email,
              password: password,
            },
          });
          if (res.status === 201 || res.status === 200) {
            alert(res.data.message);
            console.log(res.data.message);
          }
        } catch (err) {
          console.log(err.response.data.message);
          alert(err.response.data.message);
        } finally {
          setIsRequesting(false);
        }
      }
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/auth/google-request");
      console.log(res.data);
      window.location.href = res.data.url;
    } catch (err) {
      console.log(err.response.data.message);
      alert(err.response.data.message);
    }
  };

  return (
    <div className="auth-form-container">
      <div
        className={`auth-form-wrapper ${
          isLogin ? "login-view" : "register-view"
        }`}
      >
        <div className="auth-form login">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email or Username</label>
              <input
                type="text"
                name="email"
                value={email}
                onChange={handleChange}
              />
              {errors.email && <p className="error">{errors.email}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="password" className="password-label">
                Password<Link to={"/forgot-password"}>Forgot password?</Link>
              </label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={handleChange}
              />
              {errors.password && <p className="error">{errors.password}</p>}
            </div>
            <button type="submit">
              {isRequesting ? "loading..." : "Login"}
            </button>
          </form>
          <p
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors({});
              resetData();
            }}
          >
            {isLogin
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </p>
          <p style={{ fontSize: ".75rem" }}>Or Continue with Google</p>
          <p>
            <Link onClick={handleGoogleAuth} style={{ fontSize: "2rem" }}>
              <FcGoogle />
            </Link>
          </p>
        </div>
        <div className="auth-form register">
          <h2>Register</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={handleChange}
              />
              {errors.username && <p className="error">{errors.username}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="text"
                name="email"
                value={email}
                onChange={handleChange}
              />
              {errors.email && <p className="error">{errors.email}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={handleChange}
              />
              {errors.password && <p className="error">{errors.password}</p>}
            </div>
            <button type="submit">{isRequesting ? "loading..." : "Register"}{" "}</button>
          </form>
          <p
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors({});
              resetData();
            }}
          >
            {isLogin
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </p>
          <p style={{ fontSize: ".75rem" }}>Or Continue with Google</p>
          <p>
            <Link onClick={handleGoogleAuth} style={{ fontSize: "2rem" }}>
              <FcGoogle />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
