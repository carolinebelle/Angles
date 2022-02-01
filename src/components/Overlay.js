import React from "react";
import "./styles.css";
import { Line } from "react-lineto";
import Point from "./Point";
import Landmarks from "./Landmarks";
import Circle from "./Circle";
import CopyText from "./CopyText";
import Switch from "react-switch";
import Mask from "./Mask";
import LevelButton from "./LevelButton";
import { Stage, Layer } from "react-konva";
import Confirmation from "./Confirmation";

import { updateDoc, deleteField } from "../Firebase";

//TODO: selectively delete points and lines

// Start at L5 then L4, L3, L2, L1, S1, Femoral head 1 and Femoral head 2
const order = [0, 5, 4, 3, 2, 1, 6, 7];

export default class Overlay extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      landmarks: this.toNestedArray(this.props.data),
      currentLevel: -1, //default to L5

      anteriorLeft: true,

      draw: false, //can the user draw another point, displays grey square under cursor
      active: false, //is the user actively drawing a line, displays red square
      mouseX: null,
      mouseY: null,

      points: new Array(8),
      startPoints: new Array(8),
      editing: false,

      //confirmation control
      needConfirmation: false,
      functionToConfirm: null,
      question: "Confirm [action]",
      explantaion: "Would you like to confirm [action]",
      confirm: "Confirm",
      cancel: "Cancel",
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
    this.anteriorSide = this.anteriorSide.bind(this);
    this.activeDraw = this.activeDraw.bind(this);
    this.renderLines = this.renderLines.bind(this);

    this.updatePosition = this.updatePosition.bind(this);
    this.renderPoints = this.renderPoints.bind(this);

    this.renderLandmarks = this.renderLandmarks.bind(this);
    this.renderMasks = this.renderMasks.bind(this);

    this.toggleLevel = this.toggleLevel.bind(this);
    this.canDraw = this.canDraw.bind(this);

    //femoral heads
    this.activeCircle = this.activeCircle.bind(this);

    this.isEditing = this.isEditing.bind(this);
    this.fromNestedArray = this.fromNestedArray.bind(this);
    this.toNestedArray = this.toNestedArray.bind(this);
    this.copyLandmarks = this.copyLandmarks.bind(this);

    this.completeDelete = this.completeDelete.bind(this);
    this.levelDelete = this.levelDelete.bind(this);
    this.confirmedDelete = this.confirmedDelete.bind(this);
  }

  maxPoints = 8;

  updateCount = 0;

  /* Image formating **********************************************/
  anteriorSide(checked) {
    this.setState({ anteriorLeft: checked });
  }

  /* Level control **********************************************/

  completeDelete() {
    console.log("complete delete");
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
    console.log("level delete");
    if (this.state.currentLevel == index) {
      const femHeads = index == 6 || index == 7;
      let landmarks = this.copyLandmarks();
      landmarks[index] = femHeads ? new Array(2) : new Array(this.maxPoints);
      this.setState({
        landmarks: landmarks,
        points: femHeads ? new Array(2) : new Array(this.maxPoints),
        startPoints: new Array(this.maxPoints),
      });
    }
  }

  confirmedDelete() {
    console.log("confirmed delete");
    this.setState({
      landmarks: new Array(8),
      points: new Array(this.maxPoints),
      startPoints: new Array(this.maxPoints),
    });
  }

  toggleLevel(level) {
    console.log("toggle level: " + level);
    let toSave =
      this.state.currentLevel == 6 || this.state.currentLevel == 7
        ? new Array(2)
        : new Array(this.maxPoints); // data to save to landmarks
    let toLoad =
      level == 6 || level == 7 ? new Array(2) : new Array(this.maxPoints); // data to pull from landmarks to load into startpoints
    let newCurrent =
      level == 6 || level == 7 ? new Array(2) : new Array(this.maxPoints); // same as toLoad, data to pull from landmarks to load for active position tracking

    let existingData = this.state.landmarks[level]; //does data already exist for this level?

    for (let i = 0; i < this.state.points.length; i++) {
      if (this.state.points[i]) {
        //creating copy of current set of points
        toSave[i] = [...this.state.points[i]];
      }
      if (existingData) {
        if (this.state.landmarks[level][i]) {
          toLoad[i] = [...this.state.landmarks[level][i]];
          newCurrent[i] = [...this.state.landmarks[level][i]];
        }
      }
    }

    let newLandmarks = this.copyLandmarks();

    if (this.state.currentLevel != -1) {
      newLandmarks[this.state.currentLevel] = toSave;
    }

    if (level == this.state.currentLevel) {
      //toggle off
      //do not load new, save old
      //set current level to -1
      this.setState({
        landmarks: newLandmarks,
        points: new Array(this.maxPoints),
        startPoints: new Array(this.maxPoints),
        currentLevel: -1,
      });
    } else {
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
  }

  copyLandmarks() {
    let newLandmarks = new Array(this.state.landmarks.length);

    //copy landmarks
    for (let i = 0; i < newLandmarks.length; i++) {
      if (this.state.landmarks[i]) {
        let vert = new Array(this.state.landmarks[i].length);
        for (let j = 0; j < this.state.landmarks[i].length; j++) {
          if (this.state.landmarks[i][j]) {
            vert[j] = [...this.state.landmarks[i][j]];
          }
        }
        newLandmarks[i] = vert;
      } else {
        if (i == 6 || i == 7) {
          newLandmarks[i] = new Array(2); //only need 2 points for femoral heads
        } else {
          newLandmarks[i] = new Array(this.maxPoints);
        }
      }
    }

    return newLandmarks;
  }

  /* Editing current level **********************************/

  canDraw(level, points) {
    let currentLevel = level || level == 0 ? level : this.state.currentLevel;
    let currentPoints = points ? points : this.state.startPoints;

    if (currentLevel != -1) {
      if (currentLevel == 6 || currentLevel == 7) {
        if (!currentPoints[0]) {
          //no first point yet
          this.setState({ draw: true, active: false });
        } else if (!currentPoints[1]) {
          this.setState({ draw: true, active: true });
        } else {
          this.setState({ draw: false, active: false });
        }
      } else {
        let empty = -1;
        const pOrder = [0, 2, 6, 4];
        pOrder.forEach((num) => {
          if (!currentPoints[num]) {
            //does not exist
            if (empty == -1) {
              empty = num;
            }
          }
        });

        if (empty == 0 || empty == 6) {
          this.setState({ draw: true, active: false });
        } else if (empty == 2 || empty == 4) {
          this.setState({ draw: true, active: true });
        } else {
          this.setState({ draw: false, active: false });
        }
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

  // dynamically draws circle based on mouse position and first point of femoral head
  activeCircle = () => {
    console.log("active circle being called");
    let coords;
    let x0;
    let y0;
    if (!this.state.points[1] && this.state.points[0]) {
      coords = this.realToImgCoords(
        this.state.points[0][0],
        this.state.points[0][1]
      );
      x0 = coords.imgX;
      y0 = coords.imgY;
    }
    return (
      <Circle
        key={this.state.mouseX + "," + this.state.mouseY}
        x0={x0}
        y0={y0}
        x1={this.state.mouseX}
        y1={this.state.mouseY}
      />
    );
  };

  activeLine = () => {
    if (this.state.active && this.state.mouseX && this.state.mouseY) {
      let coords;
      if (this.state.currentLevel == 6 || this.state.currentLevel == 7) {
        console.log("state current level: " + this.state.currentLevel);
        return this.activeCircle();
      } else {
        let x0;
        let y0;
        let x1;
        let y1;
        if (!this.state.points[2] && this.state.points[0]) {
          coords = this.realToScreenCoords(
            this.state.points[0][0],
            this.state.points[0][1]
          );
          x0 = coords.x;
          y0 = coords.y;
          coords = this.fromImgCoords(this.state.mouseX, this.state.mouseY);
          x1 = coords.x;
          y1 = coords.y;
        } else if (!this.state.points[4] && this.state.points[6]) {
          coords = this.realToScreenCoords(
            this.state.points[6][0],
            this.state.points[6][1]
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
    let iPoints = new Array(this.state.startPoints.length);
    let updatedPoints = new Array(this.state.points.length);

    for (let i = 0; i < this.state.startPoints.length; i++) {
      if (this.state.startPoints[i]) {
        iPoints[i] = [...this.state.startPoints[i]];
      }
      if (this.state.points[i]) {
        updatedPoints[i] = [...this.state.points[i]];
      }
    }

    if (initial) {
      iPoints[index] = [x, y];
      updatedPoints[index] = [x, y];

      this.setState({ startPoints: iPoints, points: updatedPoints });
    } else {
      updatedPoints[index] = [x, y];

      this.setState({ points: updatedPoints });
    }
  }

  updateManyPositions(updates) {
    //deep copy of points and startPoints
    let iPoints = new Array(this.state.startPoints.length);
    let updatedPoints = new Array(this.state.points.length);

    for (let i = 0; i < this.state.startPoints.length; i++) {
      if (this.state.startPoints[i]) {
        iPoints[i] = [...this.state.startPoints[i]];
      }
      if (this.state.points[i]) {
        updatedPoints[i] = [...this.state.points[i]];
      }
    }

    updates.forEach((element) => {
      //[initial, index, x, y]
      let initial = element[0];
      let index = element[1];
      let x = element[2];
      let y = element[3];

      if (initial) {
        //add to startPoints and points
        iPoints[index] = [x, y];
        updatedPoints[index] = [x, y];
      } else {
        // only add to points
        updatedPoints[index] = [x, y];
      }
    });

    this.setState({ startPoints: iPoints, points: updatedPoints });
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
    return this.state.startPoints.map((point, index) => {
      let { imgX, imgY } = this.realToImgCoords(point[0], point[1]);
      return (
        <Point
          key={index.toString() + this.state.currentLevel.toString()}
          x={imgX}
          y={imgY}
          updatePos={this.updatePosition}
          index={index}
        />
      );
    });
  };

  onDoubleClick(e) {
    this.setState({ editing: true });
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
      let femHead =
        this.state.currentLevel == 6 || this.state.currentLevel == 7;
      if (this.state.active) {
        //second point of line
        if (femHead) {
          this.updatePosition(true, 1, x, y);
          this.setState({ draw: false, active: false }); //no longer actively drawing a line segment, done adding points
        } else {
          let index;
          if (!this.state.startPoints[2]) index = 2;
          else if (!this.state.startPoints[4]) index = 4;
          else index = -1; //no empty slot

          if (index == 2) {
            let mx = (this.state.points[0][0] + x) / 2;
            let my = (this.state.points[0][1] + y) / 2;
            let midpoint = [true, 1, mx, my];
            let endpoint = [true, 2, x, y];
            this.updateManyPositions([midpoint, endpoint]);
            this.setState({ active: false }); //no longer actively drawing a line segment
          } else if (index == 4) {
            let mx = (this.state.points[6][0] + x) / 2;
            let my = (this.state.points[6][1] + y) / 2;
            let midpoint = [true, 5, mx, my];
            let endpoint = [true, 4, x, y];

            let addPoints = [midpoint, endpoint];

            //add vertical midpoints
            if (
              //all other corners present
              this.state.startPoints[0] &&
              this.state.startPoints[2] &&
              this.state.startPoints[6]
            ) {
              if (!this.state.startPoints[3]) {
                //midpoint not already added
                let mx = (this.state.points[2][0] + x) / 2;
                let my = (this.state.points[2][1] + y) / 2;
                addPoints.push([true, 3, mx, my]);
              }
              if (!this.state.startPoints[7]) {
                //midpoint not already added
                let mx =
                  (this.state.points[0][0] + this.state.points[6][0]) / 2;
                let my =
                  (this.state.points[0][1] + this.state.points[6][1]) / 2;
                addPoints.push([true, 7, mx, my]);
              }
            }
            this.updateManyPositions(addPoints);
            this.setState({ draw: false, active: false }); //no longer actively drawing a line segment, done adding points
          } else {
            this.setState({ draw: false, active: false }); //no more slots to fill, done adding points
          }
        }
      } else {
        //first point of line
        let index;

        if (!this.state.startPoints[0]) index = 0;
        else if (!femHead && !this.state.startPoints[6]) index = 6;
        else index = -1; //no empty slot

        if (index != -1) {
          this.updatePosition(true, index, x, y); //added a point
          this.setState({ active: true }); //actively drawing a line segment
        }
      }
    }
  }

  renderLines = () => {
    let femHead = this.state.currentLevel == 6 || this.state.currentLevel == 7;
    let coords;
    let x0;
    let y0;
    let x1;
    let y1;
    let a = 0;
    let b = 1;
    if (femHead) {
      if (this.state.points[0] && this.state.points[1]) {
        coords = this.realToImgCoords(
          this.state.points[0][0],
          this.state.points[0][1]
        );
        x0 = coords.imgX;
        y0 = coords.imgY;
        coords = this.realToImgCoords(
          this.state.points[1][0],
          this.state.points[1][1]
        );
        x1 = coords.imgX;
        y1 = coords.imgY;
        return (
          <Circle
            key={x0 + ", " + y0 + " and " + x1 + ", " + y1}
            x0={x0}
            y0={y0}
            x1={x1}
            y1={y1}
          />
        );
      }
    } else {
      let lines = [];

      while (b < this.state.points.length) {
        if (this.state.points[a] && this.state.points[b]) {
          coords = this.realToScreenCoords(
            this.state.points[a][0],
            this.state.points[a][1]
          );
          x0 = coords.x;
          y0 = coords.y;
          coords = this.realToScreenCoords(
            this.state.points[b][0],
            this.state.points[b][1]
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
        a += 1;
        b += 1;
      }
      if (this.state.points[a] && this.state.points[0]) {
        coords = this.realToScreenCoords(
          this.state.points[a][0],
          this.state.points[a][1]
        );
        x0 = coords.x;
        y0 = coords.y;
        coords = this.realToScreenCoords(
          this.state.points[0][0],
          this.state.points[0][1]
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
          for (let j = 0; j < this.state.landmarks[i].length; j++) {
            if (
              this.state.landmarks[i][j] &&
              this.state.landmarks[i][j][0] &&
              this.state.landmarks[i][j][1]
            ) {
              let { imgX, imgY } = this.realToImgCoords(
                this.state.landmarks[i][j][0],
                this.state.landmarks[i][j][1]
              );
              countEl += 1;
              points[j] = [imgX, imgY];
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
        let i = 0;
        while (i < this.state.landmarks.length) {
          if (i != this.state.currentLevel && this.state.landmarks[i]) {
            let points = new Array(this.state.landmarks[i].length);
            for (let j = 0; j < this.state.landmarks[i].length; j++) {
              if (
                this.state.landmarks[i][j] &&
                this.state.landmarks[i][j][0] &&
                this.state.landmarks[i][j][1]
              ) {
                let { imgX, imgY } = this.realToImgCoords(
                  this.state.landmarks[i][j][0],
                  this.state.landmarks[i][j][1]
                );
                points[j] = [imgX, imgY];
              }
            }
            vertebra.push(<Mask key={i} points={points} active={false} />);
          }
          i += 1;
        }

        // translate points
        let imgCoordPoints = new Array(this.state.points.length);
        for (let j = 0; j < this.state.points.length; j++) {
          if (this.state.points[j]) {
            let { imgX, imgY } = this.realToImgCoords(
              this.state.points[j][0],
              this.state.points[j][1]
            );
            imgCoordPoints[j] = [imgX, imgY];
          }
        }

        return (
          <Stage
            id="stage"
            width={this.props.imgWidth}
            height={this.props.imgHeight}
          >
            <Layer id="layer">
              <Mask
                key={new Date().getTime()}
                points={imgCoordPoints}
                active={true}
              />
              {vertebra}
            </Layer>
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
    let flatArray = new Array(52);
    let index = 0;

    //vertebra
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 8; j++) {
        for (let k = 0; k < 2; k++) {
          if (arr[i] && arr[i][j] && arr[i][j][k]) {
            flatArray[index] = arr[i][j][k];
          } else {
            flatArray[index] = null;
          }
          index += 1;
        }
      }
    }
    //femoral heads
    for (let i = 6; i < 8; i++) {
      for (let j = 0; j < 2; j++) {
        for (let k = 0; k < 2; k++) {
          if (arr[i] && arr[i][j] && arr[i][j][k]) {
            flatArray[index] = arr[i][j][k];
          } else {
            flatArray[index] = null;
          }
          index += 1;
        }
      }
    }

    return flatArray;
  }

  toNestedArray(arr) {
    let nestedArray = new Array(8);
    let index = 0;

    //vertebra
    for (let i = 0; i < 6; i++) {
      nestedArray[i] = new Array(8);
      for (let j = 0; j < 8; j++) {
        nestedArray[i][j] = new Array(2);
        if (!arr[index] && !arr[index + 1]) {
          nestedArray[i][j] = null;
          index += 2;
        } else {
          for (let k = 0; k < 2; k++) {
            nestedArray[i][j][k] = arr[index] ? arr[index] : null;
            index += 1;
          }
        }
      }
    }

    //femoral heads
    for (let i = 6; i < 8; i++) {
      nestedArray[i] = new Array(2);
      for (let j = 0; j < 2; j++) {
        nestedArray[i][j] = new Array(2);
        if (!arr[index] && !arr[index + 1]) {
          nestedArray[i][j] = null;
          index += 2;
        } else {
          for (let k = 0; k < 2; k++) {
            nestedArray[i][j][k] = arr[index] ? arr[index] : null;
            index += 1;
          }
        }
      }
    }

    return nestedArray;
  }

  isEditing() {
    if (this.state.editing) {
      return (
        <div className="rightPanel">
          <LevelButton
            index={100}
            level={"SAVE"}
            active={this.state.editing}
            toggleLevel={async () => {
              console.log(this.state.landmarks);
              try {
                await updateDoc(this.props.xray, {
                  masks: deleteField(),
                });
              } catch (e) {
                console.error("Error deleting masks field for document: ", e);
              }
              try {
                await updateDoc(this.props.xray, {
                  masks: this.fromNestedArray(this.state.landmarks),
                });
              } catch (e) {
                console.error("Error updating masks for document: ", e);
              }
              this.setState({ editing: false });
            }}
            controller={true}
            delete={this.completeDelete}
          />
          <LevelButton
            index={1}
            level={"L1"}
            active={1 == this.state.currentLevel ? true : false}
            toggleLevel={this.toggleLevel}
            delete={this.levelDelete}
          />
          <LevelButton
            index={2}
            level={"L2"}
            active={2 == this.state.currentLevel ? true : false}
            toggleLevel={this.toggleLevel}
            delete={this.levelDelete}
          />
          <LevelButton
            index={3}
            level={"L3"}
            active={3 == this.state.currentLevel ? true : false}
            toggleLevel={this.toggleLevel}
            delete={this.levelDelete}
          />
          <LevelButton
            index={4}
            level={"L4"}
            active={4 == this.state.currentLevel ? true : false}
            toggleLevel={this.toggleLevel}
            delete={this.levelDelete}
          />
          <LevelButton
            index={5}
            level={"L5"}
            active={5 == this.state.currentLevel ? true : false}
            toggleLevel={this.toggleLevel}
            delete={this.levelDelete}
          />
          <LevelButton
            index={0}
            level={"S1"}
            active={0 == this.state.currentLevel ? true : false}
            toggleLevel={this.toggleLevel}
            delete={this.levelDelete}
          />
          <LevelButton
            index={6}
            level={"F1"}
            active={6 == this.state.currentLevel ? true : false}
            toggleLevel={this.toggleLevel}
            delete={this.levelDelete}
          />
          <LevelButton
            index={7}
            level={"F2"}
            active={7 == this.state.currentLevel ? true : false}
            toggleLevel={this.toggleLevel}
            delete={this.levelDelete}
          />
        </div>
      );
    } else {
      return (
        <div className="rightPanel">
          <LevelButton
            index={101}
            level={"EDIT"}
            active={false}
            toggleLevel={() => {
              this.setState({ editing: true });
            }}
            controller={true}
          />
        </div>
      );
    }
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
          {this.renderPoints()}
          {this.activeDraw()}
          {this.activeLine()}
          {this.renderLines()}
          {this.renderLandmarks()}
          {this.renderMasks()}
        </div>
        <div id="copytext">{this.getAngles()}</div>
        <div className="switch">
          <Switch
            onChange={this.anteriorSide}
            checked={this.state.anteriorLeft}
            onColor="#809be6"
            offColor="#000000"
          />
        </div>
        {this.isEditing()}
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
