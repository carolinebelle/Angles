import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import {
  db,
  collection,
  onSnapshot,
  getStorage,
  ref,
  getDownloadURL,
} from "../Firebase";
import { FiCheckCircle, FiCircle } from "react-icons/fi";
import { GrChapterAdd } from "react-icons/gr";
import ListItemButton from "@mui/material/ListItemButton";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { BsFillFileImageFill } from "react-icons/bs";
import Confirmation from "./Confirmation";

export default function Accession(props) {
  const [expand, setExpand] = React.useState(false);
  const [done, setDone] = React.useState(props.done);
  const [xrays, setXrays] = React.useState(null);

  const onClick = () => {
    setExpand(!expand);
  };

  const setImage = async (id, file, masks) => {
    console.log("set image");
    props.accession(props.id);
    props.xray(id);

    const storage = getStorage();
    getDownloadURL(ref(storage, file))
      .then((url) => {
        props.url(url);
      })
      .catch((error) => {
        // Handle any errors
        console.error("Could not get download url for " + file + ": " + error);
      });

    if (!masks) {
      props.emptyData();
    } else {
      props.masks(masks);
    }
    props.drawer(false);
  };

  const addImage = () => {
    props.accession(props.id);
    props.xray(null);
    props.url(null);
    props.emptyData();
    props.drawer(false);
  };

  const list = () => {
    if (expand) {
      let items = [];
      xrays.forEach((doc) => {
        items.push(
          <ListItemButton
            sx={{ pl: 4 }}
            key={doc.id}
            onClick={() => setImage(doc.id, doc.data().file, doc.data().masks)}
          >
            <ListItemIcon>
              <BsFillFileImageFill />
            </ListItemIcon>
            <ListItemText
              primary={doc.data().type}
              secondary={doc.data().region}
            />
          </ListItemButton>
        );
      });
      return items;
    }
  };

  const add = () => {
    return (
      <ListItem key={"add"} disablePadding>
        <ListItemButton sx={{ pl: 4 }} onClick={() => addImage()}>
          <ListItemIcon>
            <GrChapterAdd />
          </ListItemIcon>
          <ListItemText primary={"Add"} />
        </ListItemButton>
      </ListItem>
    );
  };

  React.useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "accessions/" + props.id + "/X-rays"),
      (QuerySnapshot) => {
        setXrays(QuerySnapshot);
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <>
      <ListItem disablePadding>
        <ListItemButton
          selected={expand}
          onClick={() => {
            onClick();
          }}
        >
          <ListItemIcon>{done ? <FiCheckCircle /> : <FiCircle />}</ListItemIcon>
          <ListItemText
            primary={props.id}
            secondary={
              props.date ? props.date.toDate().toLocaleDateString("en-US") : ""
            }
          />
          {expand ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
      </ListItem>
      <Collapse in={expand} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {add()}
          {list()}
        </List>
      </Collapse>
    </>
  );
}
