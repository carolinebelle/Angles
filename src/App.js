import "./index.css";
import { Route, Routes } from "react-router-dom";
import { Login, Segment, Reset } from "./routes/index.js";

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/segment" element={<Segment />} />
        <Route path="/reset" element={<Reset />} />
      </Routes>
    </div>
  );
}
export default App;
