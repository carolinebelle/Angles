import UploadImage from "../components/UploadImage";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { auth, doc, db, collection, getDoc } from "../Firebase";
import Instructions from "../helpers/instructions/Instructions";
// import { authLogin, authLogout } from "../features";

// import { useDispatch } from "react-redux";

function Segment() {
  const [user, loading, error] = useAuthState(auth);
  const [uid, setUid] = useState(null);
  const [instructions, setInstructions] = useState(null);
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
      firebaseUser(user.uid);
      // dispatch(authLogin(user.uid));
    }
  }, [user, loading]);

  const firebaseUser = async (userID) => {
    const instr = new Instructions();
    try {
      const uRef = doc(db, "users", userID);
      const uDoc = await getDoc(uRef);

      instr.setName(uDoc.data().last, uDoc.data().title, uDoc.data().first);
    } catch (e) {
      console.error("Error retrieving user firebase doc: ", e);
    }
    setInstructions(instr);
  };

  if (user && uid && instructions) {
    return (
      <UploadImage
        uid={uid}
        instructions={instructions}
        sessions={collection(db, "users/" + uid + "/sessions")}
      />
    );
  } else {
    return null;
  }
}
export default Segment;
