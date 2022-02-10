import UploadImage from "../components/UploadImage";
import React, { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../Firebase";

function Segment() {
  const [user, loading, error] = useAuthState(auth);

  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) return navigate("/Segmentation/");
  }, [user, loading]);

  return <UploadImage />;
}
export default Segment;
