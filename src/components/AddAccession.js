import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Timestamp, doc, setDoc, db } from "../Firebase";
import DesktopDatePicker from "@mui/lab/DesktopDatePicker";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";

export default function AddAccession(props) {
  const [open, setOpen] = React.useState(props.open);
  const [value, setValue] = React.useState(null);

  const cancel = () => {
    props.handler(false);
  };

  const handleClose = async () => {
    //TODO: validate data

    //send to firestore
    try {
      // const docRef = await addDoc(collection(db, "accessions"), {
      let dateVal = document.getElementById("date").value;
      let patientVal = document.getElementById("patient").value;
      await setDoc(doc(db, "accessions", document.getElementById("id").value), {
        created: Timestamp.now(),
        date: dateVal ? Timestamp.fromDate(new Date(dateVal)) : null,
        done: false,
        patient: patientVal ? patientVal : null,
      });

      props.updater(document.getElementById("id").value);
    } catch (e) {
      if (!document.getElementById("id").value) {
        console.log("You must provide an accession ID");
      }
      console.error("Error adding document: ", e);
    }

    props.handler(false);
  };

  React.useEffect(() => {
    setOpen(props.open);
  }, [props.open]);

  return (
    <Dialog open={open}>
      <DialogTitle>Accession Info</DialogTitle>
      <img src={props.url} />
      <DialogContent>
        <TextField
          required
          autoFocus
          margin="dense"
          id="id"
          label="Accession ID"
          fullWidth
          variant="standard"
        />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DesktopDatePicker
            disableFuture
            label="Accession Date"
            value={value}
            onChange={(newValue) => {
              setValue(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                margin="dense"
                id="date"
                fullWidth
                variant="standard"
              />
            )}
          />
        </LocalizationProvider>
        <TextField
          margin="dense"
          id="patient"
          label="Patient ID"
          fullWidth
          variant="standard"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={cancel}>Cancel</Button>
        <Button onClick={handleClose}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
