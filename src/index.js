import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import UploadImage from "./components/UploadImage.js";

const Scan = () => {
  return (
    <div className="body">
      <UploadImage />
    </div>
  );
};

ReactDOM.render(<Scan />, document.getElementById("root"));
