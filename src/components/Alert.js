import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { getDoc, updateDoc } from "../Firebase";

export default function Alert(props) {
  const [foundError, setError] = useState(null);
  const [needForm, setNeedForm] = useState(null);

  const handleClose = () => {
    if (needForm) {
      const type = document.getElementById("type").value;
      const size = document.getElementById("size").value;
      const mouse = document.getElementById("mouse").value;
      if (type === "" || size === "" || mouse === "") {
        if (foundError) setError(foundError + 1);
        else setError(1);
      } else {
        // send to firebase
        console.log(type + ", " + size + ", " + mouse);
        saveResponses(type, size, mouse);
        props.handler(false);
      }
    } else {
      props.handler(false);
    }
  };

  const needResponses = async () => {
    const docSnap = await getDoc(props.session.ref);
    const data = docSnap.data();
    console.log(data);
    console.log("computer" in data);
    console.log("size" in data);
    console.log("mouse" in data);
    console.log(
      !("computer" in data) || !("size" in data) || !("mouse" in data)
    );
    setNeedForm(
      !("computer" in data) || !("size" in data) || !("mouse" in data)
    );
  };

  const saveResponses = async (type, size, mouse) => {
    await updateDoc(props.session.ref, {
      computer: type,
      size: size,
      mouse: mouse,
    });
  };

  useEffect(() => {
    if (props.open) needResponses();
  }, [props.open]);

  // console.log(props.session.data());

  // const needResponses =
  //   !props.session.data().has("type") || !props.session.data().has("size");

  return (
    <div>
      <Dialog
        open={props.open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{props.title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            You will measure the angles as you would normally in a clinical
            setting. Please mark both the upper and lower endplate for each
            vertebra (S1 to L1) to measure the lordosis angles.
          </DialogContentText>
        </DialogContent>
        {needForm ? (
          <Box
            component="form"
            sx={{
              "& .MuiTextField-root": { m: 3, width: "25ch" },
            }}
            noValidate
            autoComplete="off"
          >
            <TextField
              error={
                foundError
                  ? document.getElementById("type").value === ""
                  : false
              }
              required
              margin="dense"
              id="type"
              label="Computer Type"
              helperText="ex: Mac, PC"
              variant="standard"
            />
            <TextField
              error={
                foundError
                  ? document.getElementById("size").value === ""
                  : false
              }
              required
              margin="dense"
              id="size"
              label="Screen Diagonal"
              helperText='ex: 13", 15"'
              variant="standard"
            />
            <TextField
              error={
                foundError
                  ? document.getElementById("mouse").value === ""
                  : false
              }
              required
              margin="dense"
              id="mouse"
              label="Mouse"
              helperText="ex: mouse, trackpad"
              variant="standard"
            />
          </Box>
        ) : null}
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            Proceed
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
