import * as React from "react";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { HiMenu } from "react-icons/hi";
import { GrChapterAdd } from "react-icons/gr";
import ListItemButton from "@mui/material/ListItemButton";
import Confirmation from "./Confirmation";
import sample1 from "../images/sample1.jpeg";
import { FiCheckCircle, FiCircle } from "react-icons/fi";

export default function Drawer(props) {
  const [state, setState] = React.useState(false);
  const [confirmation, setConfirmation] = React.useState(false);
  const files = props.images;
  const [complete, setComplete] = React.useState(
    props.complete ? props.complete : new Array(files.length)
  );

  const toggleDrawer = (open) => (event) => {
    if (
      event &&
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setState(open);
  };

  const samples = () => {
    return files.map((file, index) => {
      return (
        <ListItem key={index} disablePadding>
          <ListItemButton
            onClick={
              props.unsaved
                ? () => setConfirmation(true)
                : () => {
                    console.log("set file index to: " + index);
                    setState(false);
                    props.file(index);
                  }
            }
          >
            <ListItemIcon>
              {complete[index] ? <FiCheckCircle /> : <FiCircle />}
            </ListItemIcon>
            <ListItemText primary={"Sample " + (index + 1)} />
          </ListItemButton>
        </ListItem>
      );
    });
  };

  const add = () => {
    return (
      <ListItem key={"add"} disablePadding>
        <ListItemButton
          divider={true}
          onClick={
            props.unsaved ? () => setConfirmation(true) : () => addAccession()
          }
        >
          <ListItemIcon>
            <GrChapterAdd />
          </ListItemIcon>
          <ListItemText primary={"Add"} />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <>
      <HiMenu className="click_icon" onClick={toggleDrawer(true)} />
      <SwipeableDrawer
        anchor="left"
        open={state}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
      >
        <List
          sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
        >
          {samples()}
        </List>
      </SwipeableDrawer>
      <Confirmation
        open={confirmation}
        function={() => addAccession()}
        question={"Unsaved changes."}
        explanation={
          "You have unsaved edits. Are you sure you wish to load a new x-ray without first saving your edits?"
        }
        confirm={"Discard Edits"}
        cancel={"Return to Edits"}
        handler={setConfirmation}
      />
    </>
  );
}
