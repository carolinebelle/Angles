import { useEffect } from "react";
import { Prompt } from "react-router-dom";

const LeaveAlert = () => {
  useEffect(() => {
    window.addEventListener("beforeunload", alertUser);
    return () => {
      window.removeEventListener("beforeunload", alertUser);
    };
  }, []);
  const alertUser = (e) => {
    e.preventDefault();
    e.returnValue = "";
  };
  return (
    <div>
      <Prompt
        when={this.props} //navigation
        message={() => "Are you sure you want to leave this page?"}
      />
    </div>
  );
};

export default LeaveAlert;
