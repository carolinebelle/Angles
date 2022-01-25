import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { auth, sendPasswordReset } from "../Firebase";
import "./reset.css";
import "./login.css";

function Reset() {
  const [email, setEmail] = useState("");
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();

  const onClick = (e) => {
    var email = document.createElement("a");
    email.href = "mailto:caroline.yoon@me.com";
    email.click();
  };

  useEffect(() => {
    if (loading) return;
    if (user) navigate("/Segmentation/segment");
  }, [user, loading]);
  return (
    <div className="reset__page">
      <div className="reset__container">
        <input
          type="text"
          className="reset__textBox"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail Address"
        />
        <button className="reset__btn" onClick={() => sendPasswordReset(email)}>
          Send password reset email
        </button>
        <div>
          <Link to="/Segmentation/">Go to log in</Link>
        </div>
        <div className="login__text">
          <div>Don't have an account?&nbsp;</div>
          <div className="login__register" onClick={onClick}>
            Request access
          </div>
        </div>
      </div>
    </div>
  );
}
export default Reset;
