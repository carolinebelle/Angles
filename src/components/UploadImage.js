import React, { useState, useRef } from "react";
import "./styles.css";
import styled from "styled-components";
import Uploady, { useBatchAddListener } from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";
import withPasteUpload from "@rpldy/upload-paste";
import UploadDropZone from "@rpldy/upload-drop-zone";
import { Line } from "rc-progress";
import Overlay from "./Overlay.js";
import { HiOutlineLogout, HiTrash } from "react-icons/hi";
import { logout, storageRef, doc, db } from "../Firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Drawer from "./Drawer";
import { GrChapterAdd } from "react-icons/gr";
import Button from "@mui/material/Button";
import AddAccession from "./AddAccession";
import AddXray from "./AddXray";
import { v4 as uuid } from "uuid";
import Confirmation from "./Confirmation";

const maxPoints = 8;

const testData1 = [
  [
    [653, 581],
    [683.5, 562],
    [714, 543],
    [731, 566],
    [748, 589],
    [729.5, 601.5],
    [711, 614],
    [682, 597.5],
  ],
  [
    [744, 155],
    [776, 174.5],
    [808, 194],
    [793.5, 219.5],
    [779, 245],
    [746.5, 230.5],
    [718, 210],
    [731, 182.5],
  ],
  [
    [706, 224],
    [739.5, 238.5],
    [779, 252],
    [766.5, 287],
    [745, 316],
    [713.5, 301],
    [679, 286],
    [692.5, 252.5],
  ],
  [
    [664, 301],
    [699.5, 311.5],
    [735, 322],
    [727.5, 353.5],
    [717, 388],
    [680, 378],
    [647, 370],
    [656, 334],
  ],
  [
    [640, 390],
    [675.5, 394.5],
    [711, 399],
    [708, 433.5],
    [705, 468],
    [668.5, 464],
    [632, 460],
    [636, 425],
  ],
  [
    [627, 492],
    [663.5, 486],
    [700, 480],
    [706, 507.5],
    [712, 535],
    [676, 544],
    [640, 557],
    [633.5, 522.5],
  ],
  [
    [627, 492],
    [663.5, 486],
  ],
  [
    [627, 492],
    [663.5, 486],
  ],
];

const empty = new Array(8);

const testData3 = [
  ,
  ,
  [
    [706, 224],
    [739.5, 238.5],
    [779, 252],
    [766.5, 287],
    [745, 316],
    [713.5, 301],
    [679, 286],
    [692.5, 252.5],
  ],
  ,
  [
    [640, 390],
    [675.5, 394.5],
    [711, 399],
    [708, 433.5],
    [705, 468],
    [668.5, 464],
    [632, 460],
    [636, 425],
  ],
];

const StyledDropZone = styled(UploadDropZone)`n
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
`;

const PasteUploadDropZone = withPasteUpload(StyledDropZone);

const UploadProgress = (progress) => {
  if (progress && progress < 100) {
    return (
      <Line
        style={{ height: "10px", zIndex: 0 }}
        strokeWidth={2}
        strokeColor={progress === 100 ? "#00a626" : "#2db7f5"}
        opacity={progress === 100 ? 0 : 1}
        percent={progress}
      />
    );
  }
  return null;
};

const CustomImagePreview = ({ url, handler, scaler }) => {
  if (url) {
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
          src={url}
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
  const [url, setUrl] = useState(null);
  const [accession, setAccession] = useState(null);
  const [xray, setXray] = useState(null);
  const [data, setData] = useState(empty);

  const [addAccession, setAddAccession] = useState(false);
  const [addXray, setAddXray] = useState(false);
  const [unsavedChanges, setunsavedChanges] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [pendingBatch, setPendingBatch] = useState(null);

  const emptyData = () => {
    setData(empty);
  };

  React.useEffect(() => {
    reset();
  }, [url]);

  const loadImg = (batch) => {
    if (accession) {
      setXray("new");

      let images = batch.items;
      images.forEach((image) => {
        let file = image.file;
        let fileName = file.name.split(".");
        let fileID = uuid() + "." + fileName[fileName.length - 1];
        let imageRef = ref(storageRef, fileID);
        let uploadTask = uploadBytesResumable(imageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            setPercent(progress);
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
            }
          },
          (error) => {
            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors
            switch (error.code) {
              case "storage/unauthorized":
                // User doesn't have permission to access the object
                break;
              case "storage/canceled":
                // User canceled the upload
                break;

              // ...

              case "storage/unknown":
                // Unknown error occurred, inspect error.serverResponse
                break;
            }
          },
          () => {
            // Upload completed successfully, now we can get the download URL
            setFilename(fileID);
            setAddXray(true);
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              console.log(fileID + " available at", downloadURL);
              setUrl(downloadURL);
            });
          }
        );

        console.log(image.file.name);
      });
      console.log(
        `batch ${batch.id} finished uploading with ${batch.items.length} items`
      );
      console.log("not uploading image with uploady");
    } else {
      alert(
        "Add an accession or choose to add to an existing accession to begin uploading."
      );
    }
  };

  useBatchAddListener((batch) => {
    if (unsavedChanges) {
      setConfirmation(true);
      setPendingBatch(batch);
    } else {
      loadImg(batch);
    }
  });

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
    if (!accession) {
      return (
        <Button
          variant="outlined"
          onClick={() => {
            setAddAccession(true);
          }}
        >
          <GrChapterAdd />
          Add Accession
        </Button>
      );
    }
  };

  // const confirm = (func) => {
  //   console.log("seeking confirmation");
  //   if (unsavedChanges) {
  //     console.log("unsaved changes detected");
  //     setPendingFunc(() => func);
  //     setConfirmation(true);
  //   } else {
  //     console.log("no unsaved changes");
  //     func();
  //   }
  // };

  return (
    <div className="App">
      <div className="Header">
        <div className="TitleBox">
          <Drawer
            url={setUrl}
            accession={setAccession}
            add={setAddAccession}
            xray={setXray}
            masks={setData}
            emptyData={emptyData}
            request={(func) => confirm(func)}
            unsaved={unsavedChanges}
          />
          Segment
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
            : "02/01/22 Bug fix and delete feature patch"}
        </div>
        <div className="progressbar">
          <UploadProgress progress={percent} />
        </div>
        <PasteUploadDropZone className="dropzone" params={{ test: "paste" }}>
          <CustomImagePreview url={url} handler={setCoords} scaler={setReal} />
          {accession == null || xray == null ? (
            placeholder()
          ) : (
            <Overlay
              xray={doc(db, "accessions/" + accession + "/X-rays", xray)}
              key={itemNum}
              data={data}
              points={new Array(maxPoints)}
              top={y0}
              left={x0}
              imgWidth={width}
              imgHeight={height}
              realWidth={realWidth}
              realHeight={realHeight}
              edits={setunsavedChanges}
            />
          )}
        </PasteUploadDropZone>
      </div>
      <AddAccession
        open={addAccession}
        handler={setAddAccession}
        updater={setAccession}
      />
      <AddXray
        open={addXray}
        handler={setAddXray}
        updater={setXray}
        accession={accession}
        file={filename}
      />
      <Confirmation
        open={confirmation}
        function={() => loadImg(pendingBatch)}
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

const UploadImage = () => {
  return (
    <Uploady>
      <UploadWithProgressPreview />
    </Uploady>
  );
};

export default UploadImage;
