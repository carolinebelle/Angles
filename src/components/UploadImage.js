import React, { useState, useCallback } from "react";
import "./styles.css";
import styled from "styled-components";
import Uploady, {
  useItemProgressListener,
  useItemStartListener,
} from "@rpldy/uploady";
import { getMockSenderEnhancer } from "@rpldy/mock-sender";
import UploadButton from "@rpldy/upload-button";
import UploadPreview from "@rpldy/upload-preview";
import withPasteUpload from "@rpldy/upload-paste";
import UploadDropZone from "@rpldy/upload-drop-zone";
import { Line } from "rc-progress";
import Overlay from "./Overlay.js";
import { FaTrashAlt } from "react-icons/fa";

const StyledDropZone = styled(UploadDropZone)`n
  width: 100vw;
  display: flex;
  border: 1px solid rgb(154, 151, 173);
  height: 90vh;
  justify-content: center;
  align-items: center;
  z-index=2;
`;

const StyledProgress = styled.div`
  position: absolute;
  width: 100%;
  z-index=3;
`;

const PreviewContainer = styled.div`
  width: auto;
  height: 100%;
  z-index=1
`;

const PreviewImage = styled.img`
  display: block;
  height: 100%;
  width: 100%;
  object-fit: contain;
  transition: opacity 0.4s;

  ${({ completed }) => `opacity: ${completed / 100}`}
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

  useItemProgressListener((item) => {
    if (item.id === id) {
      setCompleted(item.completed);
    }
  });

  return <PreviewImage src={url} completed={completed}></PreviewImage>;
};

const UploadWithProgressPreview = () => {
  const [itemNum, setItemNum] = useState(0);
  const getPreviewProps = useCallback((item) => ({ id: item.id }), []);

  useItemStartListener(() => {
    reset();
  });

  function reset() {
    console.log("wiping points");
    setItemNum(itemNum + 1);
  }

  return (
    <div className="App">
      <div className="Header">
        <div className="TitleBox">Rad Reader</div>
        <div className="spacer" />
        <UploadButton>Upload Files</UploadButton>
      </div>
      <div className="Content">
        <StyledProgress>
          <UploadProgress />
        </StyledProgress>
        <PasteUploadDropZone params={{ test: "paste" }}>
          <PreviewContainer>
            <UploadPreview
              previewComponentProps={getPreviewProps}
              PreviewComponent={CustomImagePreview}
            />
            <Overlay key={itemNum} points={new Array(6)} />
          </PreviewContainer>
        </PasteUploadDropZone>
      </div>
      <div onClick={reset} className="reset">
        <FaTrashAlt />
      </div>
    </div>
  );
};

const mockSenderEnhancer = getMockSenderEnhancer();

export default function UploadImage() {
  return (
    <Uploady
      debug
      destination={{ url: "upload-url" }}
      enhancer={mockSenderEnhancer}
    >
      <UploadWithProgressPreview />
    </Uploady>
  );
}
