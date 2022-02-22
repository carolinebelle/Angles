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

export default class Overlay extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      landmarks: this.toNestedArray(this.props.data), //this.props.data is a flat array
      currentLevel: -1,

      draw: false, //can the user draw another point, displays grey square under cursor
      active: false, //is the user actively drawing a line, displays red square
      mouseX: null,
      mouseY: null,

      points: null,
      startPoints: null,
      editing: false,

      //confirmation control
      needConfirmation: false,
      functionToConfirm: null,
      question: "Confirm [action]",
      explantaion: "Would you like to confirm [action]",
      confirm: "Confirm",
      cancel: "Cancel",

      pointRefresh: 0,
    };

    this.lineBorderWidth = 2;

    this.onClick = this.onClick.bind(this);
    this.onDoubleClick = this.onDoubleClick.bind(this);
    this.toImgCoords = this.toImgCoords.bind(this);
    this.fromImgCoords = this.fromImgCoords.bind(this);
    this.imgToRealCoords = this.imgToRealCoords.bind(this);
    this.realToImgCoords = this.realToImgCoords.bind(this);
    this.screenToRealCoords = this.screenToRealCoords.bind(this);
    this.realToScreenCoords = this.realToScreenCoords.bind(this);

    this.onMouseMove = this.onMouseMove.bind(this);
    this.activeDraw = this.activeDraw.bind(this);
    this.renderLines = this.renderLines.bind(this);

    this.updatePosition = this.updatePosition.bind(this);
    this.renderPoints = this.renderPoints.bind(this);

    this.renderLandmarks = this.renderLandmarks.bind(this);
    this.renderMasks = this.renderMasks.bind(this);

    this.toggleLevel = this.toggleLevel.bind(this);
    this.canDraw = this.canDraw.bind(this);

    this.fromNestedArray = this.fromNestedArray.bind(this);
    this.toNestedArray = this.toNestedArray.bind(this);
    this.copyLandmarks = this.copyLandmarks.bind(this);

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
      this.setState({
        points: new Array(this.maxPoints * 2),
        startPoints: new Array(this.maxPoints * 2),
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
          toLoad = new Array(this.maxPoints * 2);
          newCurrent = new Array(this.maxPoints * 2);
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
      const pOrder = currentLevel == 0 ? [0, 1] : [0, 1, 3, 2];
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

  // sets mouseX and mouseY to imgCoords
  onMouseMove(e) {
    if (this.state.draw) {
      let { x, y } = this.toImgCoords(e.clientX, e.clientY);
      this.setState({
        mouseX: x,
        mouseY: y,
      });
    }
  }

  activeLine = () => {
    if (this.state.active && this.state.mouseX && this.state.mouseY) {
      let coords;
      let x0;
      let y0;
      let x1;
      let y1;
      if (!this.state.points[2] && this.state.points[0]) {
        coords = this.realToScreenCoords(
          this.state.points[0],
          this.state.points[1]
        );
        x0 = coords.x;
        y0 = coords.y;
        coords = this.fromImgCoords(this.state.mouseX, this.state.mouseY);
        x1 = coords.x;
        y1 = coords.y;
      } else if (!this.state.points[4] && this.state.points[6]) {
        coords = this.realToScreenCoords(
          this.state.points[6],
          this.state.points[7]
        );
        x0 = coords.x;
        y0 = coords.y;
        coords = this.fromImgCoords(this.state.mouseX, this.state.mouseY);
        x1 = coords.x;
        y1 = coords.y;
      }
      return (
        <Line
          x0={x0}
          y0={y0}
          x1={x1}
          y1={y1}
          className="line"
          borderWidth={this.lineBorderWidth}
        />
      );
    }
  };

  activeDraw = () => {
    if (this.state.draw) {
      if (this.state.mouseX && this.state.mouseY) {
        if (this.state.active) {
          return (
            <div
              className="point"
              style={{
                top: this.state.mouseY - 6.5,
                left: this.state.mouseX - 7.5,
                border: "2px solid red",
                cursor: "none",
              }}
            />
          );
        } else {
          return (
            <div
              className="point"
              style={{
                top: this.state.mouseY - 6.5,
                left: this.state.mouseX - 7.5,
                border: "2px solid grey",
                cursor: "none",
              }}
            />
          );
        }
      }
    }
  };

  // //call setState to re-render component after updating coordinate of one point
  updatePosition(initial, index, xCoord, yCoord, imgCoords = false) {
    let x = xCoord;
    let y = yCoord;
    if (imgCoords) {
      //convert from img coords to real coords
      let { realX, realY } = this.imgToRealCoords(x, y);
      x = realX;
      y = realY;
    }
    let iPoints = [...this.state.startPoints];
    let updatedPoints = [...this.state.points];

    if (initial) {
      iPoints[index] = x;
      iPoints[index + 1] = y;
      updatedPoints[index] = x;
      updatedPoints[index + 1] = y;

      this.setState({ startPoints: iPoints, points: updatedPoints }); //possible
    } else {
      updatedPoints[index] = x;
      updatedPoints[index + 1] = y;

      this.setState({ points: updatedPoints }); //possible
    }
  }

  updateManyPositions(updates) {
    //deep copy of points and startPoints
    let iPoints = [...this.state.startPoints];
    let updatedPoints = [...this.state.points];

    updates.forEach((element) => {
      //[initial, index, x, y]
      let initial = element[0];
      let index = element[1];
      let x = element[2];
      let y = element[3];

      if (initial) {
        //add to startPoints and points
        iPoints[index] = x;
        iPoints[index + 1] = y;
        updatedPoints[index] = x;
        updatedPoints[index + 1] = y;
      } else {
        // only add to points
        updatedPoints[index] = x;
        updatedPoints[index + 1] = y;
      }
    });

    this.setState({ startPoints: iPoints, points: updatedPoints }); //possible
  }

  /* Statistics **********************************************/

  getAngles() {
    let ll = null;
    let pi = null;
    let pt = null;

    return <CopyText LL={ll} PI={pi} PT={pt} />;
  }

  /* Display componenets ***********************/

  //converts realCoords to imgCoords
  renderPoints = () => {
    if (this.state.startPoints) {
      return [0, 2, 4, 6].map((val) => {
        if (this.state.startPoints[val] && this.state.startPoints[val + 1]) {
          let { imgX, imgY } = this.realToImgCoords(
            this.state.startPoints[val],
            this.state.startPoints[val + 1]
          );
          // return this.state.startPoints.map((point, index) => {
          //   let { imgX, imgY } = this.realToImgCoords(point[0], point[1]);
          return (
            <Point
              key={val + ": " + imgX + "," + imgY}
              x={imgX}
              y={imgY}
              updatePos={this.updatePosition}
              index={val}
            />
          );
        }
      });
    }
  };

  onDoubleClick(e) {
    let index = order.indexOf(this.state.currentLevel);
    if (index == -1) {
      index = order[0];
    } else {
      if (index == order.length - 1) {
        index = -1;
      } else {
        index = order[index + 1];
      }
    }
    this.toggleLevel(index);
  }

  // passes real coords
  onClick(e) {
    let { realX, realY } = this.screenToRealCoords(e.clientX, e.clientY);
    let x = realX;
    let y = realY;
    if (this.state.draw) {
      if (this.state.active) {
        //second point of line
        let index;
        if (!this.state.startPoints[2]) index = 2;
        else if (!this.state.startPoints[4]) index = 4;
        else index = -1; //no empty slot

        if (index == 2) {
          //add midpoints
          this.updatePosition(true, index, x, y);
          this.setState({ active: false }); //no longer actively drawing a line segment
        } else if (index == 4) {
          this.updatePosition(true, index, x, y);
          this.setState({ draw: false, active: false }); //no longer actively drawing a line segment, done adding points
        } else {
          this.setState({ draw: false, active: false }); //no more slots to fill, done adding points
        }
      } else {
        //first point of line
        let index;

        if (!this.state.startPoints[0]) index = 0;
        else if (!this.state.startPoints[6]) index = 6;
        else index = -1; //no empty slot

        if (index != -1) {
          this.updatePosition(true, index, x, y); //added a point
          this.setState({ active: true }); //actively drawing a line segment
        }
      }
    }
  }

  renderLines = () => {
    if (this.state.points) {
      let coords;
      let x0;
      let y0;
      let x1;
      let y1;

      let a = 0;
      let b = 2;
      let lines = [];

      while (b < this.state.points.length) {
        if (this.state.points[a] && this.state.points[b]) {
          coords = this.realToScreenCoords(
            this.state.points[a],
            this.state.points[a + 1]
          );
          x0 = coords.x;
          y0 = coords.y;
          coords = this.realToScreenCoords(
            this.state.points[b],
            this.state.points[b + 1]
          );
          x1 = coords.x;
          y1 = coords.y;
          lines.push(
            <Line
              key={a}
              x0={x0}
              y0={y0}
              x1={x1}
              y1={y1}
              className="line"
              borderWidth={this.lineBorderWidth}
            />
          );
        }
        a += 4;
        b += 4;
      }

      return <div>{lines}</div>;
    }
  };

  renderLandmarks = () => {
    if (this.state.landmarks) {
      let vertebra = [];
      let i = 0;
      while (i < this.state.landmarks.length) {
        if (i != this.state.currentLevel && this.state.landmarks[i]) {
          let points = new Array(this.state.landmarks[i].length);
          let countEl = 0;
          for (let j = 0; j < this.state.landmarks[i].length; j += 2) {
            if (this.state.landmarks[i][j] && this.state.landmarks[i][j + 1]) {
              let { imgX, imgY } = this.realToImgCoords(
                this.state.landmarks[i][j],
                this.state.landmarks[i][j + 1]
              );
              countEl += 1;
              points[j] = imgX;
              points[j + 1] = imgY;
            }
          }
          if (countEl > 0) {
            vertebra.push(
              <Landmarks
                key={i}
                points={points}
                toggleLevel={this.toggleLevel}
                level={i}
                translator={this.fromImgCoords}
              />
            );
          }
        }
        i += 1;
      }
      return <div>{vertebra}</div>;
    }
  };

  renderMasks = () => {
    if (this.props.imgWidth != 0 && this.props.imgHeight != 0) {
      if (this.state.landmarks) {
        let vertebra = [];
        if (this.state.points) {
          let imgCoordPoints;
          imgCoordPoints = new Array(this.state.points.length);
          for (let j = 0; j < this.state.points.length; j += 2) {
            if (this.state.points[j] & this.state.points[j + 1]) {
              let { imgX, imgY } = this.realToImgCoords(
                this.state.points[j],
                this.state.points[j + 1]
              );
              imgCoordPoints[j] = imgX;
              imgCoordPoints[j + 1] = imgY;
            }
          }
          vertebra.push(
            <Mask
              key={new Date().getTime()}
              points={imgCoordPoints}
              active={true}
            />
          );
        }

        let i = 0;
        while (i < this.state.landmarks.length) {
          if (i != this.state.currentLevel && this.state.landmarks[i]) {
            let points = new Array(this.state.landmarks[i].length);
            for (let j = 0; j < this.state.landmarks[i].length; j += 2) {
              if (
                this.state.landmarks[i][j] &&
                this.state.landmarks[i][j + 1]
              ) {
                let { imgX, imgY } = this.realToImgCoords(
                  this.state.landmarks[i][j],
                  this.state.landmarks[i][j + 1]
                );
                points[j] = imgX;
                points[j + 1] = imgY;
              }
            }
            vertebra.push(<Mask key={i} points={points} active={false} />);
          }
          i += 1;
        }

        return (
          <Stage
            id="stage"
            width={this.props.imgWidth}
            height={this.props.imgHeight}
          >
            <Layer id="layer">{vertebra}</Layer>
          </Stage>
        );
      }
    }
  };

  /** Coordinate converters */
  imgToRealCoords(imgX, imgY) {
    let realX = (imgX / this.props.imgWidth) * this.props.realWidth;
    let realY = (imgY / this.props.imgHeight) * this.props.realHeight;
    return { realX, realY };
  }

  realToImgCoords(realX, realY) {
    let imgX = (realX / this.props.realWidth) * this.props.imgWidth;
    let imgY = (realY / this.props.realHeight) * this.props.imgHeight;
    return { imgX, imgY };
  }

  realToScreenCoords(realX, realY) {
    let { imgX, imgY } = this.realToImgCoords(realX, realY);
    let { x, y } = this.fromImgCoords(imgX, imgY);
    return { x, y };
  }

  screenToRealCoords(screenX, screenY) {
    let { x, y } = this.toImgCoords(screenX, screenY);
    let { realX, realY } = this.imgToRealCoords(x, y);
    return { realX, realY };
  }

  toImgCoords(screenX, screenY) {
    let x = screenX - this.props.left;
    let y = screenY - this.props.top;
    return { x, y };
  }

  fromImgCoords(imgX, imgY) {
    let x = imgX + this.props.left;
    let y = imgY + this.props.top;
    return { x, y };
  }

  fromNestedArray(arr) {
    let flatArray = [];
    for (let i = 0; i < arr.length; i++) {
      flatArray = [...flatArray, ...arr[i]];
    }
    return flatArray;
  }

  toNestedArray(arr) {
    const splits = [4, 4, 4, 4, 4, 2];
    const total = splits.reduce((partialSum, a) => partialSum + a) * 2;
    const valid = total == arr.length;
    let nestedArray = new Array(splits.length);
    let index = 0;

    for (let i = 0; i < nestedArray.length; i++) {
      if (valid) {
        nestedArray[i] = arr.slice(index, index + splits[i] * 2);
      } else {
        nestedArray[i] = new Array(splits[i] * 2);
      }
      index += splits[i] * 2;
    }

    if (!valid) console.log("error: length of array is unexpected");

    return nestedArray;
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

  draw() {
    return (
      <>
        {this.renderPoints()}
        {this.activeDraw()}
        {this.activeLine()}
        {this.renderLines()}
        {this.renderLandmarks()}
        {/* {this.renderMasks()} */}
      </>
    );
  }

  render() {
    return (
      <>
        <div
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
        >
          {this.draw()}
        </div>
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
