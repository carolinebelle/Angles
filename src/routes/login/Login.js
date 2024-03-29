import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, logInWithEmailAndPassword } from "../../Firebase.js";
import { useAuthState } from "react-firebase-hooks/auth";
import "./login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();

  const onClick = (e) => {
    var email = document.createElement("a");
    email.href = "mailto:caroline.yoon@me.com";
    email.click();
  };

  useEffect(() => {
    if (loading) {
      // maybe trigger a loading screen
      return;
    }
    if (user) navigate("/segment");
  }, [user, loading]);
  return (
    <div className="login">
      <div className="login__container">
        <input
          type="text"
          className="login__textBox"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail Address"
        />
        <input
          type="password"
          className="login__textBox"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button
          className="login__btn"
          onClick={() => logInWithEmailAndPassword(email, password)}
        >
          Login
        </button>
        <div>
          <Link to="/reset">Forgot Password</Link>
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
export default Login;
