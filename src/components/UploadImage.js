import React, { useState, useRef } from "react";
import "./styles.css";
import Uploady, { useBatchAddListener } from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";
import Overlay from "./Overlay.js";
import { HiOutlineLogout, HiTrash } from "react-icons/hi";
import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";
import { logout, doc, getDoc, db } from "../Firebase";
import Drawer from "./Drawer";
import Confirmation from "./Confirmation";
import sample1 from "../images/sample1.jpeg";

const images = [sample1, sample1, sample1];

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
  const [accession, setAccession] = useState(null);
  const [xray, setXray] = useState(null);
  const [data, setData] = useState(new Array(8));

  const [unsavedChanges, setunsavedChanges] = useState(false);
  const [confirmation, setConfirmation] = useState(false);

  const [sessionNum, setSessionNum] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [next, setNext] = useState(null);

  const emptyData = () => {
    setData(new Array(8));
  };

  React.useEffect(() => {
    const userDoc = await getDoc(doc(db, "users", props.uid));
  }, []);

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

  return (
    <div className="App">
      <div className="Header">
        <div className="TitleBox">
          <Drawer
            images={images}
            file={setFileIndex}
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
        <button className="upload">
          {sessionNum ? "Save & Exit" : "Begin Session"}
        </button>
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
