import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default function Confirmation(props) {
  const handleClose = () => {
    props.handler(false);
  };

  const confirm = () => {
    props.function();
    props.handler(false);
  };

  const cancel = () => {
    props.handler(false);
  };

  return (
    <div>
      <Dialog
        open={props.open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{props.question}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {props.explanation ? props.explanation : ""}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancel}>{props.cancel}</Button>
          <Button onClick={confirm} autoFocus>
            {props.confirm}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
