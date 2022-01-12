import React, { useState, useCallback, useRef } from "react";
import "./styles.css";
import styled from "styled-components";
import Uploady, {
  useItemProgressListener,
  useItemStartListener,
} from "@rpldy/uploady";
import { getMockSenderEnhancer } from "@rpldy/mock-sender";
import UploadButton from "@rpldy/upload-button";
import UploadPreview from "@rpldy/upload-preview";
import withPasteUpload, { usePasteUpload } from "@rpldy/upload-paste";
import UploadDropZone from "@rpldy/upload-drop-zone";
import { Line } from "rc-progress";
import Overlay from "./Overlay.js";
import { FaTrashAlt } from "react-icons/fa";

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
];

const testData2 = new Array(6);

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
  border: 5px solid rgb(128, 155, 230);
  height: 100%;
  display: flex;
  justify-content: center;
`;

const PasteUploadDropZone = withPasteUpload(StyledDropZone);

const UploadProgress = () => {
  const [progress, setProgess] = useState(0);

  const progressData = useItemProgressListener();

  if (progressData && progressData.completed > progress) {
    setProgess(() => progressData.completed);
  }
  return (
    progressData && (
      <Line
        style={{ height: "10px", zIndex: 0 }}
        strokeWidth={2}
        strokeColor={progress === 100 ? "#00a626" : "#2db7f5"}
        opacity={progress === 100 ? 0 : 1}
        percent={progress}
      />
    )
  );
};

const CustomImagePreview = ({ id, url }) => {
  const [completed, setCompleted] = useState(0);

  const onImgLoad = ({ target: img }) => {
    console.log("height: " + img.offsetHeight + " / width: " + img.offsetWidth);
  };

  useItemProgressListener((item) => {
    if (item.id === id) {
      setCompleted(item.completed);
    }
  });

  return (
    <img
      className="PreviewImg"
      onLoad={onImgLoad}
      src={url}
      completed={completed}
    ></img>
  );
};

const UploadWithProgressPreview = (props) => {
  const [itemNum, setItemNum] = useState(0);
  const getPreviewProps = useCallback((item) => ({ id: item.id }), []);

  useItemStartListener(() => {
    reset();
  });

  const reset = () => {
    console.log("wiping points");
    setItemNum(itemNum + 1);
  };

  return (
    <div className="App">
      <div className="Header">
        <div className="TitleBox">Segment</div>
        <UploadButton className="upload">Upload Files</UploadButton>
      </div>
      <div className="Content">
        <div className="Announcements">
          PROTOTYPE: window cannot be resized while maintaining landmark
          accuracy
        </div>
        <div className="progressbar">
          <UploadProgress />
        </div>
        <PasteUploadDropZone params={{ test: "paste" }}>
          <UploadPreview
            previewComponentProps={getPreviewProps}
            PreviewComponent={CustomImagePreview}
          />
          <Overlay key={itemNum} data={testData2} points={new Array(8)} />
        </PasteUploadDropZone>
      </div>
      <div onClick={reset} className="reset">
        <FaTrashAlt />
      </div>
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
