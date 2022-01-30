import * as React from "react";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { db, collection, onSnapshot } from "../Firebase";
import { HiMenu } from "react-icons/hi";
import { GrChapterAdd } from "react-icons/gr";
import ListItemButton from "@mui/material/ListItemButton";
import Accession from "./Accession";

export default function Drawer(props) {
  const [state, setState] = React.useState(false);
  const [list, setList] = React.useState([]);

  const addAccession = () => {
    setState(false);
    props.accession(null);
    props.xray(null);
    props.url(null);
    props.emptyData();
    props.add(true);
  };

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

  const load = async function () {
    console.log("initiating accessions");
    const unsubscribe = onSnapshot(
      collection(db, "accessions"),
      (QuerySnapshot) => {
        console.log("updating accessions");
        let listItems = [];
        QuerySnapshot.forEach((doc) => {
          let data = doc.data();
          listItems.push(
            <Accession
              key={doc.id}
              id={doc.id}
              done={data.done}
              date={data.date}
              drawer={setState}
              url={props.url}
              accession={props.accession}
              xray={props.xray}
              masks={props.masks}
              emptyData={props.emptyData}
            />
          );
        });
        setList(listItems);
      }
    );

    return () => unsubscribe();
  };

  const add = () => {
    return (
      <ListItem key={"add"} disablePadding>
        <ListItemButton divider={true} onClick={() => addAccession()}>
          <ListItemIcon>
            <GrChapterAdd />
          </ListItemIcon>
          <ListItemText primary={"Add"} />
        </ListItemButton>
      </ListItem>
    );
  };

  React.useEffect(() => {
    const unsubscribe = load();
    return unsubscribe;
  }, []);

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
          {add()}
          {list}
        </List>
      </SwipeableDrawer>
    </>
  );
}
