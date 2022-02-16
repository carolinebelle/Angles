import React from "react";
import "./styles.css";
import { Line } from "react-lineto";
import Point from "./Point";
import Landmarks from "./Landmarks";
import CopyText from "./CopyText";
import Mask from "./Mask";
import { Stage, Layer } from "react-konva";
import Confirmation from "./Confirmation";
import ControlPanel from "./ControlPanel";

import { updateDoc, deleteField } from "../Firebase";

//TODO: selectively delete points and lines

// Start at S1, then L5, then L4, L3, L2, L1, Femoral head 1 and Femoral head 2
const order = [0, 5, 4, 3, 2, 1];

export default class GUI extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      landmarks: this.toNestedArray(this.props.data), //this.props.data is a flat array
      currentLevel: -1,

      draw: false, //can the user draw another point, displays grey square under cursor

      editing: false,

      //confirmation control
      needConfirmation: false,
      functionToConfirm: null,
      question: "Confirm [action]",
      explantaion: "Would you like to confirm [action]",
      confirm: "Confirm",
      cancel: "Cancel",
    };

    this.activeDraw = this.activeDraw.bind(this);

    this.toggleLevel = this.toggleLevel.bind(this);
    this.canDraw = this.canDraw.bind(this);

    this.completeDelete = this.completeDelete.bind(this);
    this.levelDelete = this.levelDelete.bind(this);
    this.confirmedDelete = this.confirmedDelete.bind(this);
    this.save = this.save.bind(this);

    this.draw = this.draw.bind(this);
  }

  maxPoints = 4;

  updateCount = 0;

  /* Level control **********************************************/

  completeDelete() {
    this.setState({
      needConfirmation: true,
      functionToConfirm: this.confirmedDelete,
      question: "Delete all mask data?",
      explantaion: "This action is irreversible.",
      confirm: "Delete All",
      cancel: "Cancel",
    });
  }

  levelDelete(index) {
    if (this.state.currentLevel == index) {
      const femHeads = index == 6 || index == 7;
      this.setState({
        points: femHeads ? new Array(4) : new Array(this.maxPoints * 2),
        startPoints: femHeads ? new Array(4) : new Array(this.maxPoints * 2),
        draw: true,
        active: false,
      });
    }
  }

  confirmedDelete() {
    this.toggleLevel(-1);
    this.setState({
      landmarks: new Array(this.state.landmarks.length),
      points: new Array(this.maxPoints * 2),
      startPoints: new Array(this.maxPoints * 2),
    });
  }

  toggleLevel(level) {
    console.log("toggle: " + level);
    if (!this.state.active) {
      if (this.state.currentLevel == -1 && level != -1) {
        this.setState({ editing: true });
        this.props.edits(true);
      } else if (level == -1) {
        this.setState({ editing: false });
      }

      let newLandmarks = this.copyLandmarks();

      if (this.state.currentLevel != -1) {
        newLandmarks[this.state.currentLevel] = [...this.state.points];
      }

      let toLoad;
      let newCurrent;

      if (level == this.state.currentLevel) {
        //toggle off
        //do not load new, do save old
        //set current level to -1
        this.setState({
          landmarks: newLandmarks,
          points: null,
          startPoints: null,
          currentLevel: -1,
        });
      } else {
        if (this.state.landmarks[level]) {
          toLoad = [...this.state.landmarks[level]];
          newCurrent = [...this.state.landmarks[level]];
        } else {
          toLoad =
            level == 6 || level == 7
              ? new Array(4)
              : new Array(this.maxPoints * 2);
          newCurrent =
            level == 6 || level == 7
              ? new Array(4)
              : new Array(this.maxPoints * 2);
        }

        //load new, save old
        this.setState({
          landmarks: newLandmarks,
          points: newCurrent,
          startPoints: toLoad,
          currentLevel: level,
        });
      }

      if (level == -1 || this.state.currentLevel == level) {
        this.setState({ active: false, draw: false });
      } else {
        this.canDraw(level, toLoad);
      }
    } else {
      alert(
        "You are actively drawing. Do not attempt to switch masks while actively drawing."
      );
    }
  }

  copyLandmarks() {
    let newLandmarks = new Array(this.state.landmarks.length);

    //copy landmarks
    for (let i = 0; i < newLandmarks.length; i++) {
      if (this.state.landmarks[i]) {
        newLandmarks[i] = [...this.state.landmarks[i]];
      } else {
        newLandmarks[i] = new Array(this.maxPoints * 2);
      }
    }

    return newLandmarks;
  }

  /* Editing current level **********************************/

  canDraw(level, points) {
    console.log("can draw");
    let currentLevel = level || level == 0 ? level : this.state.currentLevel;
    let currentPoints = points ? points : this.state.startPoints;

    if (currentLevel != -1) {
      let empty = -1;
      const pOrder = [0, 1, 3, 2];
      pOrder.forEach((num) => {
        if (!currentPoints[num * 2]) {
          //does not exist
          if (empty == -1) {
            empty = num;
          }
        }
      });

      if (empty == 0 || empty == 3) {
        this.setState({ draw: true, active: false });
      } else if (empty == 1 || empty == 2) {
        this.setState({ draw: true, active: true });
      } else {
        this.setState({ draw: false, active: false });
      }
    } else {
      this.setState({ draw: false, active: false });
    }
  }

  async save() {
    let landmarks = this.copyLandmarks();
    if (this.state.currentLevel != -1)
      landmarks[this.state.currentLevel] = [...this.state.points];

    try {
      await updateDoc(this.props.xray, {
        masks: deleteField(),
      });
    } catch (e) {
      console.error("Error deleting masks field for document: ", e);
    }

    let save = this.fromNestedArray(landmarks);
    console.log("to save: " + save);
    if (save) {
      try {
        await updateDoc(this.props.xray, {
          masks: save,
        });
      } catch (e) {
        console.error("Error updating masks for document: ", e);
      }
    }

    this.toggleLevel(-1);
    this.props.edits(false);
  }

  render() {
    return (
      <>
        <Overlay
          onClick={this.onClick}
          onDoubleClick={this.onDoubleClick}
          onMouseMove={this.onMouseMove}
          className="Overlay"
          style={{
            top: this.props.top,
            left: this.props.left,
            width: this.props.imgWidth,
            height: this.props.imgHeight,
          }}
        />
        <ControlPanel
          open={this.state.editing}
          save={this.save}
          completeDelete={this.completeDelete}
          toggleLevel={this.toggleLevel}
          levelDelete={this.levelDelete}
          currentLevel={this.state.currentLevel}
          edits={() => {
            this.setState({ editing: true });
            this.props.edits(true);
          }}
        />
        <Confirmation
          open={this.state.needConfirmation}
          function={this.state.functionToConfirm}
          question={this.state.question}
          explanation={this.state.explantaion}
          confirm={this.state.confirm}
          cancel={this.state.cancel}
          handler={(bool) => this.setState({ needConfirmation: bool })}
        />
      </>
    );
  }
}
