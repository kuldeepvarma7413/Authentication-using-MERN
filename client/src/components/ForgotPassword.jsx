import React, { useState } from "react";
import axios from "axios";

const ForgotPassword = () => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    setEmailOrUsername(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emailOrUsername === "") {
      setMessage("Email or Username is required");
      return;
    }
    setIsRequesting(true);
    setMessage("");
    try {
      const res = await axios.post(
        "http://localhost:3001/api/auth/forgot-password",
        { emailOrUsername }
      );
      setMessage(
        "If an account with that email or username exists, a password reset link has been sent."
      );
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="forgot-container">
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "10px",
        }}
      >
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="emailOrUsername">Email or Username</label>
            <input
              type="text"
              id="emailOrUsername"
              name="emailOrUsername"
              value={emailOrUsername}
              onChange={handleInputChange}
            />
          </div>
          <button type="submit" disabled={isRequesting}>
            {isRequesting ? "Requesting..." : "Submit"}
          </button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;
