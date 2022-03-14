import UploadImage from "../../components/UploadImage";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { auth, doc, db, collection, getDoc } from "../../Firebase";
import { Instructions } from "../../helpers";
import { FiDownloadCloud } from "react-icons/fi";
import "./style.css";

// import { useDispatch } from "react-redux";
const officialImages = true;

function Segment() {
  const [user, loading, error] = useAuthState(auth);
  const [uid, setUid] = useState(null);
  const [instructions, setInstructions] = useState(null);
  const [admin, setAdmin] = useState(null);
  // const dispatch = useDispatch();

  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setUid(null);
      // dispatch(authLogout());
      return navigate("/");
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
      const data = uDoc.data();

      instr.setName(data.last, data.title, data.first);
      setAdmin(data.admin);
    } catch (e) {
      console.error("Error retrieving user firebase doc: ", e);
    }
    setInstructions(instr);
  };

  if (user && uid && instructions) {
    return (
      <div>
        <UploadImage
          uid={uid}
          instructions={instructions}
          sessions={collection(db, "users/" + uid + "/sessions")}
          officialImages={officialImages}
        />
        {admin ? (
          <div className="download">
            <FiDownloadCloud
              onClick={() => {
                alert("TODO: download");
              }}
            />
          </div>
        ) : null}
      </div>
    );
  } else {
    return null;
  }
}
export default Segment;
