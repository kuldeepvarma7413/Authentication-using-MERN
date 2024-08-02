import React, { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

const ResetPassword = () => {
  const params = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  const [message, setMessage] = useState("");

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword === "" || confirmPassword === "") {
      setMessage("Both fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    if (!passwordRegex.test(newPassword)) {
      setMessage(
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character"
      );
      return;
    }
    setIsRequesting(true);
    setMessage("");
    try {
      const res = await axios.post(
        `http://localhost:3001/api/auth/reset-password`,
        { password: newPassword, token: params.token}
      );
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password has been reset successfully.");
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="reset-container">
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "10px",
        }}
      >
        <h2>Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={newPassword}
              onChange={handleNewPasswordChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
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

export default ResetPassword;
