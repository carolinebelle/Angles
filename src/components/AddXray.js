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
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import "./styles.css";

export default function AddXray(props) {
  const [open, setOpen] = React.useState(props.open);
  const [bodypart, setBodypart] = React.useState("Unspecified");
  const [viewType, setViewType] = React.useState("Unspecified");
  const [side, setSide] = React.useState("Unspecified");

  const handleChangeBodypart = (event) => {
    setBodypart(event.target.value);
  };

  const handleChangeViewType = (event) => {
    setViewType(event.target.value);
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
          side: side,
        }
      );

      console.log("Document written with ID: ", docRef.id);
      props.updater(docRef.id);
    } catch (e) {
      console.log({
        file: props.file,
        region: bodypart,
        type: viewType,
        side: side,
      });
      console.error("Error adding document: ", e);
    }

    // reset to defaults
    setBodypart("Unspecified");
    setViewType("Unspecified");
    setSide("Unspecified");

    props.handler(false);
  };

  const handleSide = (event, newSide) => {
    console.log(newSide);
    setSide(newSide);
  };

  const sideSelect = () => {
    if (["LAT", "Flex", "Ext"].indexOf(viewType) != -1) {
      return (
        <ToggleButtonGroup
          value={side}
          exclusive
          onChange={handleSide}
          aria-label="Side"
        >
          <ToggleButton value="left" aria-label="Left">
            L
          </ToggleButton>
          <ToggleButton value="right" aria-label="Right">
            R
          </ToggleButton>
        </ToggleButtonGroup>
      );
    }
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
        <div className="viewType">
          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="view-type">View Type</InputLabel>
            <Select
              labelId="view-type-label"
              id="view-type-select"
              value={viewType}
              label="View Type"
              onChange={handleChangeViewType}
            >
              <MenuItem value={"Unspecified"}>Unspecified</MenuItem>
              <MenuItem value={"AP"}>AP</MenuItem>
              <MenuItem value={"LAT"}>LAT</MenuItem>
              <MenuItem value={"Flex"}>Flex</MenuItem>
              <MenuItem value={"Ext"}>Ext</MenuItem>
            </Select>
          </FormControl>
          {sideSelect()}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
