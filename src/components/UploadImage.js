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
  collection,
  query,
  getDocs,
  addDoc,
} from "../Firebase";
import Drawer from "./Drawer";
import Confirmation from "./Confirmation";
import sample0 from "../images/sample1.jpeg";
import sample1 from "../images/sample2.jpeg";
import sample2 from "../images/sample3.png";
import { Timestamp } from "@firebase/firestore";
import { createSlice } from "@reduxjs/toolkit";

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
  const [accession, setAccession] = useState(null);
  const [xray, setXray] = useState(null);
  const [data, setData] = useState(new Array(8));

  const [unsavedChanges, setunsavedChanges] = useState(false);
  const [confirmation, setConfirmation] = useState(false);

  const [session, setSession] = useState(null);
  const [userSessions, setUserSessions] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [next, setNext] = useState(null);
  const [userDoc, setUserDoc] = useState(null);

  const emptyData = () => {
    setData(new Array(8));
  };

  const loadFile = async (fileNum) => {
    console.log("load file");
    if (!session && userSessions) {
      let q = query(userSessions, where("index", "==", currentSession));
      let snapshots = await getDocs(q);
      let retrievedSession = null;
      snapshots.forEach((doc) => {
        if (!retrievedSession) retrievedSession = doc;
      });
      if (retrievedSession) {
        //resume old session
        console.log("Session ID: " + retrievedSession.id);
        setSession(retrievedSession);
        alert("resuming old session");
      } else if (userSessions) {
        //create new session
        const docRef = await addDoc(userSessions, {
          start: Timestamp.now(),
          index: currentSession,
        });
        let createdSession = await getDoc(docRef);
        setSession(createdSession);
        console.log("created session ID: " + createdSession.id);
      }
      setFileIndex(fileNum);
    } else if (session) {
      setFileIndex(fileNum);
      return;
    }
  };

  const firebaseUser = async () => {
    console.log("hello");
    try {
      console.log("try");
      const uRef = doc(db, "users", props.uid);
      const uDoc = await getDoc(uRef);
      setUserDoc(uDoc);
      setUserSessions(collection(db, "users/" + props.uid + "/sessions"));
    } catch (e) {
      console.error("Error retrieving user firebase doc: ", e);
    }
  };

  React.useEffect(() => {
    if (props.uid) {
      firebaseUser();
    }
  }, [props.uid]);

  React.useEffect(() => {
    reset();
  }, [fileIndex]);

  const reset = () => {
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
    if (fileIndex == null) {
      return;
    }
  };

  const previousImage = () => {
    if (fileIndex !== null && fileIndex > 0) {
      setFileIndex(fileIndex - 1);
    }
  };

  const nextImage = () => {
    if (fileIndex !== null && fileIndex < images.length - 1) {
      setFileIndex(fileIndex + 1);
    }
  };

  const button = () => {
    let text;
    let click;
    if (session) {
      text = "Save & Exit";
      click = () => {
        alert("Save & exit not implemented.");
        //reset session to null
        //save data
        //update end timestamp
      };
    } else {
      text = "Begin Session";
      click = () => {
        console.log("begin session");
        loadFile(0);
      };
    }
    return (
      <button className="upload" onClick={click}>
        {text}
      </button>
    );
  };

  return (
    <div className="App">
      <div className="Header">
        <div className="TitleBox">
          <Drawer
            images={images}
            file={loadFile}
            accession={setAccession}
            xray={setXray}
            masks={setData}
            emptyData={emptyData}
            request={(func) => confirm(func)}
            unsaved={unsavedChanges}
          />
          Research
          <HiOutlineLogout className="click_icon" onClick={logout} />
        </div>
        {button()}
      </div>
      <div className="Content">
        <div className="Announcements">
          {accession
            ? accession +
              " (" +
              (xray ? xray : "UPLOAD AN IMAGE TO BEGIN MASKING") +
              ")"
            : "Click to set an endpoint for a line segment, indicating the endplate."}
        </div>
        {fileIndex !== null && fileIndex > 0 ? (
          <div className="button-previous" onClick={previousImage}>
            Previous
          </div>
        ) : (
          <div className="button-previous-disabled">Previous</div>
        )}
        {fileIndex !== null && fileIndex < images.length - 1 ? (
          <div className="button-next" onClick={nextImage}>
            Next
          </div>
        ) : (
          <div className="button-next-disabled">Next</div>
        )}
        <div className="dropzone">
          <CustomImagePreview
            file={fileIndex !== null ? images[fileIndex] : null}
            handler={setCoords}
            scaler={setReal}
          />
          {fileIndex == null ? (
            placeholder()
          ) : (
            <Overlay
              file={images[fileIndex]}
              key={itemNum}
              data={data}
              top={y0}
              left={x0}
              imgWidth={width}
              imgHeight={height}
              realWidth={realWidth}
              realHeight={realHeight}
              edits={setunsavedChanges}
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
