import UploadImage from "../components/UploadImage";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { auth, logout } from "../Firebase";
// import { authLogin, authLogout } from "../features";

// import { useDispatch } from "react-redux";

function Segment() {
  const [user, loading, error] = useAuthState(auth);
  const [uid, setUid] = useState(null);
  // const dispatch = useDispatch();

  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setUid(null);
      // dispatch(authLogout());
      return navigate("/Segmentation/");
    } else {
      setUid(user.uid);
      // dispatch(authLogin(user.uid));
    }
  }, [user, loading]);

  return <UploadImage uid={uid} />;
}
export default Segment;
