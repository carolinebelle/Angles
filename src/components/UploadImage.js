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
import { Timestamp } from "@firebase/firestore";
import { Data, getWeeksDiff } from "../helpers";
import Alert from "./Alert";

// //sample images
// import sample0 from "../images/sample1.jpeg";
// import sample1 from "../images/sample2.jpeg";
// import sample2 from "../images/sample3.png";

/*
//real images - old
import image0 from "../images/09d6d661-5c96-475f-84fc-a396f7dbf751.png";
import image1 from "../images/19c4762b-25a3-4f75-9289-70c5ea396271.png";
import image2 from "../images/1cfe0593-7a26-483f-afb4-a304387971f2.png";
import image3 from "../images/3147ba94-28ec-4420-9412-2c203b7c759d.png";
import image4 from "../images/31e885e5-5267-44b5-aa66-843b2754f549.png";
import image5 from "../images/3546267a-20dc-432e-aad6-736f1d11b3dd.png";
import image6 from "../images/49f9e813-66bf-46e1-a0d9-45e658398f4a.png";
import image7 from "../images/4e0255c7-1a07-4840-9120-660faf66fa13.png";
import image8 from "../images/69c34174-48a2-4014-9696-7ad97bf05686.png";
import image9 from "../images/7854ec4b-85f2-4e9c-8235-a16fc6111065.png";
import image10 from "../images/9b5b6e19-1eef-4dde-a176-777bd4d1b216.png";
import image11 from "../images/9e8a4fb5-c624-40d1-9659-b2bd4da44c4f.png";
import image12 from "../images/a9ba5695-4d0f-4878-8ac7-57307d41a6f4.png";
import image13 from "../images/ac99a706-6115-419d-b27b-5dac8ebca73c.png";
import image14 from "../images/c4f8667e-7d92-4cbf-9485-8a146834a1bc.png";
import image15 from "../images/ced9c518-4815-4e8f-b6db-f6bd8a73b675.png";
import image16 from "../images/d03d9a81-464e-4180-a12e-828c4594d066.png";
import image17 from "../images/d70e08df-2a7b-4d8c-a290-3cff5f137346.png";
import image18 from "../images/e59efe16-df24-4d9e-b8e1-0848880cc200.png";
import image19 from "../images/e76df50f-60e2-419c-87bc-3806b3343afd.png";
import image20 from "../images/efe2ce5c-0fd2-42cd-98d6-4f88ce290d2a.png";
import image21 from "../images/f6198cca-b03c-431c-9ba2-445470a15c54.png";
import image22 from "../images/f983cf99-7aaf-4f16-b2be-58ba83770755.png";

const n = 23;

//test images
// const images = [sample0, sample1, sample2];
// const docKeys = [
//   "sSqhk7NRwn5ZqKUwS9BQ",
//   "flhHBeFxP8lyvHPcZiPt",
//   "gKWMYvxTDzyP8F7yF8Th",
// ];

//official images
const images = [
  image0,
  image1,
  image2,
  image3,
  image4,
  image5,
  image6,
  image7,
  image8,
  image9,
  image10,
  image11,
  image12,
  image13,
  image14,
  image15,
  image16,
  image17,
  image18,
  image19,
  image20,
  image21,
  image22,
];

const docKeys = [
  "09d6d661-5c96-475f-84fc-a396f7dbf751",
  "19c4762b-25a3-4f75-9289-70c5ea396271",
  "1cfe0593-7a26-483f-afb4-a304387971f2",
  "3147ba94-28ec-4420-9412-2c203b7c759d",
  "31e885e5-5267-44b5-aa66-843b2754f549",
  "3546267a-20dc-432e-aad6-736f1d11b3dd",
  "49f9e813-66bf-46e1-a0d9-45e658398f4a",
  "4e0255c7-1a07-4840-9120-660faf66fa13",
  "69c34174-48a2-4014-9696-7ad97bf05686",
  "7854ec4b-85f2-4e9c-8235-a16fc6111065",
  "9b5b6e19-1eef-4dde-a176-777bd4d1b216",
  "9e8a4fb5-c624-40d1-9659-b2bd4da44c4f",
  "a9ba5695-4d0f-4878-8ac7-57307d41a6f4",
  "ac99a706-6115-419d-b27b-5dac8ebca73c",
  "c4f8667e-7d92-4cbf-9485-8a146834a1bc",
  "ced9c518-4815-4e8f-b6db-f6bd8a73b675",
  "d03d9a81-464e-4180-a12e-828c4594d066",
  "d70e08df-2a7b-4d8c-a290-3cff5f137346",
  "e59efe16-df24-4d9e-b8e1-0848880cc200",
  "e76df50f-60e2-419c-87bc-3806b3343afd",
  "efe2ce5c-0fd2-42cd-98d6-4f88ce290d2a",
  "f6198cca-b03c-431c-9ba2-445470a15c54",
  "f983cf99-7aaf-4f16-b2be-58ba83770755",
];
*/

//images 2024
import image0 from "../images2024/Degenspondy1_Lat.png"
import image1 from "../images2024/Degenspondy2_Lat.png"
import image2 from "../images2024/DLS1_Lat.png"
import image3 from "../images2024/DLS2_Lat.png"
import image4 from "../images2024/Normal1_L.png"
import image5 from "../images2024/Normal2_L.png"
import image6 from "../images2024/PriorPSF1_Lat.png"
import image7 from "../images2024/PriorPSF2_Lat.png"
import image8 from "../images2024/PriorTLIF1_Lat.png"
import image9 from "../images2024/PriorTLIF2_Lat.png"
import image10 from "../images2024/Spondy1_Lat.png"
import image11 from "../images2024/Spondy2_Lat.png"

const n = 12;

const images = [
  image0,
  image1,
  image2,
  image3,
  image4,
  image5,
  image6,
  image7,
  image8,
  image9,
  image10,
  image11,
];

const docKeys = [
  "Degenspondy1_Lat",
  "Degenspondy2_Lat",
  "DLS1_Lat",
  "DLS2_Lat",
  "Normal1_L",
  "Normal2_L",
  "PriorPSF1_Lat",
  "PriorPSF2_Lat",
  "PriorTLIF1_Lat",
  "PriorTLIF2_Lat",
  "Spondy1_Lat",
  "Spondy2_Lat",
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

  const [fileIndex, setFileIndex] = useState(null);

  const [unsavedChanges, setunsavedChanges] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [confirmation, setConfirmation] = useState(false);

  const [session, setSession] = useState(null);
  // const [userDoc, setUserDoc] = useState(null);
  const [dataDoc, setDataDoc] = useState(null);

  const [savedData, setSavedData] = useState(null);
  const [isAlert, setIsAlert] = useState(null);
  const [isResuming, setIsResuming] = useState(null);

  const [text, setText] = useState(props.instructions.greeting());
  props.instructions.displayText(setText); //enable Instructions object to display text

  const loadSession = async (currentSession = 1) => {
    let q = query(props.sessions, where("index", "==", currentSession));
    let snapshots = await getDocs(q);
    let retrievedSession = snapshots.docs[0];
    if (retrievedSession) {
      const data = retrievedSession.data();
      if (data && data.end && getWeeksDiff(data.end.toDate(), Date.now()))
        return await loadSession(2);
      setSession(retrievedSession);
      setIsAlert(true);
      setIsResuming(true);
      return retrievedSession.id;
    } else if (props.sessions) {
      //create new session
      const docRef = await addDoc(props.sessions, {
        start: Timestamp.now(),
        index: currentSession,
      });
      let createdSession = await getDoc(docRef);
      setSession(createdSession);
      setIsAlert(true);
      setIsResuming(false);
      return createdSession.id;
    }
  };

  const retrieveData = async (fileNum, sessionID) => {
    const docRef = doc(
      db,
      "images2024/" + docKeys[fileNum] + "/sessions2024",
      sessionID
    );
    setDataDoc(docRef);
    const docSnap = await getDoc(docRef);
    let data;
    if (docSnap.exists()) {
      let retrievedData = docSnap.data().data;
      if (!retrievedData) {
        data = new Data();
      } else {
        data = new Data(retrievedData);
      }
    } else {
      data = new Data();
      await setDoc(docRef, { user: props.uid, data: null });
    }
    setSavedData(data);
    setIsComplete(data.isComplete);
  };

  const loadFile = async (fileNum) => {
    let sessionID;
    if (!session && props.sessions) {
      sessionID = await loadSession();
    } else {
      sessionID = session.id;
    }

    if (sessionID) {
      retrieveData(fileNum, sessionID);
      setFileIndex(fileNum);
    }
  };

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
    let text;
    let click;
    if (session == null) {
      text = "Begin Session";
      click = () => {
        props.instructions.set("select level");
        loadFile(0);
      };
    } else {
      text = "Finish Session";
      click = () => {
        closeSession();
        props.instructions.set("Farewell");
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
      props.instructions.set("select level");
    }
  };

  const nextImage = () => {
    if (
      !unsavedChanges &&
      isComplete &&
      fileIndex !== null &&
      fileIndex < images.length - 1
    ) {
      clearOverlay();
      loadFile(fileIndex + 1);
      props.instructions.set("select level");
    } else if (fileIndex == images.length - 1) {
      setDataDoc(null);
      setSavedData(null);
      setFileIndex(fileIndex + 1);
      props.instructions.set("end");
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

  const nextPrevButtons = () => {
    let buttons = [];
    if (fileIndex !== null && !unsavedChanges && fileIndex > 0) {
      buttons.push(
        <div className="button-previous" onClick={previousImage}>
          Previous
        </div>
      );
    } else {
      buttons.push(<div className="button-previous-disabled">Previous</div>);
    }
    if (
      fileIndex !== null &&
      !unsavedChanges &&
      isComplete &&
      fileIndex < images.length
    ) {
      buttons.push(
        <div className="button-next" onClick={nextImage}>
          Next
        </div>
      );
    } else {
      buttons.push(<div className="button-next-disabled">Next</div>);
    }
    return buttons;
  };

  const button = () => {
    let text;
    let click;
    let className;
    if (session) {
      if (unsavedChanges) {
        className = "upload-disabled";
        text = "Unsaved Changes";
      } else if (fileIndex !== images.length) {
        className = "upload";
        text = "Pause Session";
        click = () => {
          closeSession();
          props.instructions.set("Pause");
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
        <div className="counter">
          {session == null || fileIndex >= images.length
            ? ""
            : "(" + (fileIndex + 1) + "/" + images.length + ")"}
          {button()}
        </div>
      </div>
      <div className="Content">
        <div className="Announcements">{text}</div>
        {session == null ? null : nextPrevButtons()}
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
              isComplete={setIsComplete}
              instructions={props.instructions}
              alert={
                <Alert
                  session={session}
                  open={isAlert}
                  title={
                    isResuming
                      ? "Resuming Session " + session.data().index
                      : "Beginning Session " + session.data().index
                  }
                  handler={setIsAlert}
                />
              }
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
