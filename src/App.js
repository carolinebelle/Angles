import React from "react";
import "./index.css";
import { Route, Routes } from "react-router-dom";
import Login from "./routes/Login";
import Segment from "./routes/Segment";
import Reset from "./routes/Reset";

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/Segmentation/" element={<Login />} />
        <Route path="/Segmentation/segment" element={<Segment />} />
        <Route path="/Segmentation/reset" element={<Reset />} />
      </Routes>
    </div>
  );
}
export default App;
