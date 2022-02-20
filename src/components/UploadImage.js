import React, { useState, useRef } from "react";
import "./styles.css";
import Uploady, { useBatchAddListener } from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";
import Overlay from "./Overlay.js";
import { HiOutlineLogout, HiTrash } from "react-icons/hi";
import { logout } from "../Firebase";
import Drawer from "./Drawer";
import Confirmation from "./Confirmation";

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

const UploadWithProgressPreview = () => {
  const [itemNum, setItemNum] = useState(0);
  const [x0, setX0] = useState(0);
  const [y0, setY0] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [realWidth, setRealWidth] = useState(0);
  const [realHeight, setRealHeight] = useState(0);
  const [percent, setPercent] = useState(null);

  const [filename, setFilename] = useState(null);
  const [file, setFile] = useState(null);
  const [accession, setAccession] = useState(null);
  const [xray, setXray] = useState(null);
  const [data, setData] = useState(new Array(8));

  const [addAccession, setAddAccession] = useState(false);
  const [addXray, setAddXray] = useState(false);
  const [unsavedChanges, setunsavedChanges] = useState(false);
  const [confirmation, setConfirmation] = useState(false);

  const emptyData = () => {
    setData(new Array(8));
  };

  React.useEffect(() => {
    reset();
  }, [file]);

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
    if (!file) {
      return <div>Choose</div>;
    }
  };

  return (
    <div className="App">
      <div className="Header">
        <div className="TitleBox">
          <Drawer
            file={setFile}
            accession={setAccession}
            add={setAddAccession}
            xray={setXray}
            masks={setData}
            emptyData={emptyData}
            request={(func) => confirm(func)}
            unsaved={unsavedChanges}
          />
          Research
          <HiOutlineLogout className="click_icon" onClick={logout} />
        </div>
        {accession == null ? null : (
          <UploadButton className="upload">Upload Files</UploadButton>
        )}
      </div>
      <div className="Content">
        <div className="Announcements">
          {accession
            ? accession +
              " (" +
              (xray ? xray : "UPLOAD AN IMAGE TO BEGIN MASKING") +
              ")"
            : "Draw a line segment to indicate the endplate."}
        </div>
        <div className="dropzone">
          <CustomImagePreview
            file={file}
            handler={setCoords}
            scaler={setReal}
          />
          {file == null ? (
            placeholder()
          ) : (
            <Overlay
              file={file}
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
