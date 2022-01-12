import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import UploadImage from "./components/UploadImage.js";

const Scan = () => {
  return <UploadImage />;
};

ReactDOM.render(<Scan />, document.getElementById("root"));
