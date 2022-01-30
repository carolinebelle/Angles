import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { collection, addDoc, db } from "../Firebase";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

export default function AddXray(props) {
  const [open, setOpen] = React.useState(props.open);
  const [bodypart, setBodypart] = React.useState("Unspecified");
  const [viewType, setViewType] = React.useState("Unspecified");

  const handleChangeBodypart = (event) => {
    setBodypart(event.target.value);
  };

  const handleChangeViewType = (event) => {
    setViewType(event.target.value);
  };
  const cancel = () => {
    props.handler(false);
  };

  const handleClose = async () => {
    //TODO: validate data

    //send to firestore
    try {
      const docRef = await addDoc(
        collection(db, "accessions/" + props.accession + "/X-rays"),
        {
          file: props.file,
          region: bodypart,
          type: viewType,
        }
      );

      console.log("Document written with ID: ", docRef.id);
      props.updater(docRef.id);
    } catch (e) {
      console.log({
        file: props.file,
        region: bodypart,
        type: viewType,
      });
      console.error("Error adding document: ", e);
    }

    props.handler(false);
  };

  React.useEffect(() => {
    setOpen(props.open);
  }, [props.open]);

  return (
    <Dialog open={open}>
      <DialogTitle>X-Ray Info</DialogTitle>
      <DialogContent>
        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="body-part">Body Part</InputLabel>
          <Select
            labelId="body-part-label"
            id="body-part-select"
            value={bodypart}
            label="Body Part"
            onChange={handleChangeBodypart}
          >
            <MenuItem value={"Unspecified"}>Unspecified</MenuItem>
            <MenuItem value={"Lumbar"}>Lumbar</MenuItem>
            <MenuItem value={"Thoracic"}>Thoracic</MenuItem>
            <MenuItem value={"Cervical"}>Cervical</MenuItem>
            <MenuItem value={"Whole Spine"}>Whole Spine</MenuItem>
          </Select>
        </FormControl>
        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="view-type">Body Part</InputLabel>
          <Select
            labelId="bview-type-label"
            id="view-type-select"
            value={viewType}
            label="View Type"
            onChange={handleChangeViewType}
          >
            <MenuItem value={"Unspecified"}>Unspecified</MenuItem>
            <MenuItem value={"AP"}>AP</MenuItem>
            <MenuItem value={"LAT (left)"}>LAT (left)</MenuItem>
            <MenuItem value={"LAT (right)"}>LAT (right)</MenuItem>
            <MenuItem value={"Flex"}>Flex</MenuItem>
            <MenuItem value={"Ext"}>Ext</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={cancel}>Cancel</Button>
        <Button onClick={handleClose}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
