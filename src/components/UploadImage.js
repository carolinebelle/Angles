import React, { useState, useRef } from "react";
import "./styles.css";
import Overlay from "./Overlay.js";
import { HiOutlineLogout } from "react-icons/hi";
import {
  logout,
  doc,
  getDoc,
  db,
  where,
  query,
  getDocs,
  addDoc,
  updateDoc,
  setDoc,
} from "../Firebase";
import Confirmation from "./Confirmation";
import sample0 from "../images/sample1.jpeg";
import sample1 from "../images/sample2.jpeg";
import sample2 from "../images/sample3.png";
import { Timestamp } from "@firebase/firestore";
import { Data } from "../helpers";

//current sessionNum
const currentSession = 1; //number 1 session
const images = [sample0, sample1, sample2];
const docKeys = [
  "sSqhk7NRwn5ZqKUwS9BQ",
  "flhHBeFxP8lyvHPcZiPt",
  "gKWMYvxTDzyP8F7yF8Th",
];

const CustomImagePreview = ({ file, handler, scaler }) => {
  if (file) {
    const imgRef = useRef(null);

    const onImgLoad = ({ target: img }) => {
      handler(img.offsetLeft, img.offsetTop, img.width, img.height);
      scaler(img.naturalWidth, img.naturalHeight);
    };

    function handleResize() {
      if (imgRef && imgRef.current) {
        let rect = imgRef.current.getBoundingClientRect();
        if (rect) {
          handler(rect.left, rect.top, rect.width, rect.height);
        }
      }
    }

    window.addEventListener("resize", handleResize);

    return (
      <div className="PreviewContainer">
        <img
          ref={imgRef}
          className="PreviewImg"
          onLoad={onImgLoad}
          src={file}
        ></img>
      </div>
    );
  } else {
    return null;
  }
};

const UploadWithProgressPreview = (props) => {
  const [itemNum, setItemNum] = useState(0);
  const [x0, setX0] = useState(0);
  const [y0, setY0] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [realWidth, setRealWidth] = useState(0);
  const [realHeight, setRealHeight] = useState(0);

  //index of current file
  const [fileIndex, setFileIndex] = useState(null);

  const [unsavedChanges, setunsavedChanges] = useState(false);
  const [confirmation, setConfirmation] = useState(false);

  const [session, setSession] = useState(null);
  // const [userDoc, setUserDoc] = useState(null);
  const [dataDoc, setDataDoc] = useState(null);

  const [savedData, setSavedData] = useState(null);

  const [text, setText] = useState(props.instructions.greeting());
  props.instructions.displayText(setText); //enable Instructions object to display text

  const loadSession = async () => {
    let q = query(props.sessions, where("index", "==", currentSession));
    let snapshots = await getDocs(q);
    let retrievedSession = snapshots.docs[0];
    if (retrievedSession) {
      //resume old session
      console.log("Session ID: " + retrievedSession.id);
      setSession(retrievedSession);
      alert("Resuming previous session.");
      return retrievedSession.id;
    } else if (props.sessions) {
      //create new session
      const docRef = await addDoc(props.sessions, {
        start: Timestamp.now(),
        index: currentSession,
      });
      let createdSession = await getDoc(docRef);
      setSession(createdSession);
      console.log("created session ID: " + createdSession.id);
      return createdSession.id;
    }
  };

  const retrieveData = async (fileNum, sessionID) => {
    const docRef = doc(
      db,
      "images/" + docKeys[fileNum] + "/sessions",
      sessionID
    );
    console.log("file number: " + fileNum);
    setDataDoc(docRef);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      let retrievedData = docSnap.data().data;
      console.log("Document data:", retrievedData);
      if (!retrievedData) {
        setSavedData(new Data());
      } else {
        setSavedData(new Data(retrievedData));
      }
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
      let data = new Data();
      setSavedData(data);
      await setDoc(docRef, { user: props.uid, data: null });
    }
  };

  const loadFile = async (fileNum) => {
    let sessionID;
    console.log("load file");
    if (!session && props.sessions) {
      sessionID = await loadSession();
    } else {
      sessionID = session.id;
    }

    if (sessionID) {
      setFileIndex(fileNum);
      retrieveData(fileNum, sessionID);
    }
  };

  React.useEffect(() => {
    reset();
  }, [fileIndex]);

  const reset = () => {
    console.log("Reset overlay");
    setItemNum(itemNum + 1);
  };

  const setCoords = (x, y, width, height) => {
    setX0(x);
    setY0(y);
    setWidth(width);
    setHeight(height);
  };

  const setReal = (width, height) => {
    setRealWidth(width);
    setRealHeight(height);
  };

  const placeholder = () => {
    let text;
    let click;
    if (session == null) {
      text = "Begin Session";
      click = () => {
        console.log("begin session");
        props.instructions.set("To Edit");
        loadFile(0);
      };
    } else {
      text = "Finish Session";
      click = () => {
        closeSession();
        props.instructions.set("Farewell");
        alert("Session complete. Thank you for participating.");
      };
    }
    return (
      <div className="placeholder">
        <button
          className={"upload"}
          onClick={click}
          style={{ width: "30vw", height: "20vh", fontSize: "min(3vw,5vh)" }}
        >
          {text}
        </button>
      </div>
    );
  };

  const clearOverlay = () => {
    setDataDoc(null);
    setSavedData(null);
    setFileIndex(null);
  };

  const previousImage = () => {
    if (!unsavedChanges && fileIndex !== null && fileIndex > 0) {
      clearOverlay();
      loadFile(fileIndex - 1);
    }
  };

  const nextImage = () => {
    if (
      !unsavedChanges &&
      fileIndex !== null &&
      fileIndex < images.length - 1
    ) {
      clearOverlay();
      loadFile(fileIndex + 1);
    } else if (fileIndex == images.length - 1) {
      setDataDoc(null);
      setSavedData(null);
      setFileIndex(fileIndex + 1);
    }
  };

  const closeSession = async () => {
    clearOverlay();

    //update end timestamp
    await updateDoc(session.ref, {
      end: Timestamp.now(),
    });

    setSession(null);
  };

  const button = () => {
    let text;
    let click;
    let className;
    if (session) {
      if (unsavedChanges) {
        className = "upload-disabled";
        text = "Unsaved Changes";
        click = async () => {
          alert("You have unsaved changes.");
        };
      } else if (fileIndex !== images.length) {
        className = "upload";
        text = "Pause Session";
        click = () => {
          closeSession();
          props.instructions.set("Farewell");
          alert("Your progress has been saved.");
        };
      } else {
        return;
      }
    } else {
      return;
    }
    return (
      <button className={className} onClick={click}>
        {text}
      </button>
    );
  };

  return (
    <div className="App">
      <div className="Header">
        <div className="TitleBox">
          Research
          <HiOutlineLogout className="click_icon" onClick={logout} />
        </div>
        {button()}
      </div>
      <div className="Content">
        <div className="Announcements">{text}</div>
        {fileIndex !== null && !unsavedChanges && fileIndex > 0 ? (
          <div className="button-previous" onClick={previousImage}>
            Previous
          </div>
        ) : (
          <div className="button-previous-disabled">Previous</div>
        )}
        {fileIndex !== null && !unsavedChanges && fileIndex < images.length ? (
          <div className="button-next" onClick={nextImage}>
            Next
          </div>
        ) : (
          <div className="button-next-disabled">Next</div>
        )}
        <div className="dropzone">
          <CustomImagePreview
            file={
              fileIndex !== null && fileIndex < images.length
                ? images[fileIndex]
                : null
            }
            handler={setCoords}
            scaler={setReal}
          />
          {savedData == null ? (
            placeholder()
          ) : (
            <Overlay
              doc={dataDoc}
              key={itemNum}
              data={savedData}
              top={y0}
              left={x0}
              imgWidth={width}
              imgHeight={height}
              realWidth={realWidth}
              realHeight={realHeight}
              unsaved={unsavedChanges}
              edits={setunsavedChanges}
              instructions={props.instructions}
            />
          )}
        </div>
      </div>
      <Confirmation
        open={confirmation}
        function={(newFile) => setFile(newFile)}
        question={"Unsaved changes."}
        explanation={
          "You have unsaved edits. Are you sure you wish to load a new x-ray without first saving your edits?"
        }
        confirm={"Discard Edits"}
        cancel={"Return to Edits"}
        handler={setConfirmation}
      />
    </div>
  );
};

export default UploadWithProgressPreview;
