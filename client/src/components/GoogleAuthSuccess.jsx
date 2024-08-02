import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Cookies from "js-cookie";

function GoogleAuthSuccess() {
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");
  useEffect(() => {
    Cookies.set("token", token);
  }, [token]);
  return <h1>Google authentication successful</h1>;
}

export default GoogleAuthSuccess;
