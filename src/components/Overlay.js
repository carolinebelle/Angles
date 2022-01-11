import React from "react";
import "./styles.css";
import { Line } from "react-lineto";
import Point from "./Point";
import Landmarks from "./Landmarks";
import CopyText from "./CopyText";
import Switch from "react-switch";
import Mask from "./Mask";
import LevelButton from "./LevelButton";
import { Stage, Layer } from "react-konva";

//TODO: selectively delete points and lines

//TODO: retain scaling of positions even when image size changes (also in correct format for mask rcnn)
const order = [5, 4, 3, 2, 1, 0];

export default class Overlay extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      landmarks: this.props.data,
      currentLevel: -1, //default to L5

      anteriorLeft: true,

      draw: false, //can the user draw another point, displays grey square under cursor
      active: false, //is the user actively drawing a line, displays red square
      mouseX: null,
      mouseY: null,

      points: new Array(8),
      startPoints: new Array(8),
    };

    this.lineBorderWidth = 2;

    this.onClick = this.onClick.bind(this);
    this.onDoubleClick = this.onDoubleClick.bind(this);

    this.onMouseMove = this.onMouseMove.bind(this);
    this.anteriorSide = this.anteriorSide.bind(this);
    this.activeDraw = this.activeDraw.bind(this);
    this.renderLines = this.renderLines.bind(this);

    this.printPoints = this.printPoints.bind(this);
    this.updatePosition = this.updatePosition.bind(this);
    this.renderPoints = this.renderPoints.bind(this);

    this.renderLandmarks = this.renderLandmarks.bind(this);
    this.renderMasks = this.renderMasks.bind(this);

    this.toggleLevel = this.toggleLevel.bind(this);
    this.canDraw = this.canDraw.bind(this);
  }

  maxPoints = 8;

  updateCount = 0;

  /* Image formating **********************************************/
  anteriorSide(checked) {
    this.setState({ anteriorLeft: checked });
  }

  /* Level control **********************************************/

  toggleLevel(level) {
    let toSave = new Array(this.maxPoints); // data to save to landmarks
    let toLoad = new Array(this.maxPoints); // data to pull from landmarks to load into startpoints
    let newCurrent = new Array(this.maxPoints); // same as toLoad, data to pull from landmarks to load for active position tracking

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
        newLandmarks[i] = new Array(this.maxPoints);
      }
    }

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

  /* Editing current level **********************************/

  canDraw(level, points) {
    let currentLevel = level || level == 0 ? level : this.state.currentLevel;
    let currentPoints = points ? points : this.state.startPoints;

    if (currentLevel != -1) {
      let empty = -1;
      const order = [0, 2, 6, 4];
      order.forEach((num) => {
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
    } else {
      this.setState({ draw: false, active: false });
    }

    this.printPoints(points);
  }

  onClick(e) {
    if (this.state.draw) {
      if (this.state.active) {
        //second point of line
        let index;

        if (!this.state.startPoints[2]) index = 2;
        else if (!this.state.startPoints[4]) index = 4;
        else index = -1; //no empty slot

        if (index == 2) {
          let mx = (this.state.points[0][0] + e.clientX) / 2;
          let my = (this.state.points[0][1] + e.clientY) / 2;
          let midpoint = [true, 1, mx, my];
          let endpoint = [true, 2, e.clientX, e.clientY];
          this.updateManyPositions([midpoint, endpoint]);
          this.setState({ active: false }); //no longer actively drawing a line segment
        } else if (index == 4) {
          let mx = (this.state.points[6][0] + e.clientX) / 2;
          let my = (this.state.points[6][1] + e.clientY) / 2;
          let midpoint = [true, 5, mx, my];
          let endpoint = [true, 4, e.clientX, e.clientY];

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
              let mx = (this.state.points[2][0] + e.clientX) / 2;
              let my = (this.state.points[2][1] + e.clientY) / 2;
              addPoints.push([true, 3, mx, my]);
            }
            if (!this.state.startPoints[7]) {
              //midpoint not already added
              let mx = (this.state.points[0][0] + this.state.points[6][0]) / 2;
              let my = (this.state.points[0][1] + this.state.points[6][1]) / 2;
              addPoints.push([true, 7, mx, my]);
            }
          }
          this.updateManyPositions(addPoints);
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
          this.updatePosition(true, index, e.clientX, e.clientY); //added a point
          this.setState({ active: true }); //actively drawing a line segment
        }
      }
    }
  }

  onMouseMove(e) {
    if (this.state.draw) {
      this.setState({
        mouseX: e.clientX,
        mouseY: e.clientY,
      });
    }
  }

  activeLine = () => {
    if (this.state.active && this.state.mouseX && this.state.mouseY) {
      let x0;
      let y0;
      let x1;
      let y1;
      if (!this.state.points[2] && this.state.points[0]) {
        x0 = this.state.points[0][0];
        y0 = this.state.points[0][1];
        x1 = this.state.mouseX;
        y1 = this.state.mouseY;
      } else if (!this.state.points[4] && this.state.points[6]) {
        x0 = this.state.points[6][0];
        y0 = this.state.points[6][1];
        x1 = this.state.mouseX;
        y1 = this.state.mouseY;
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
  updatePosition(initial, index, x, y) {
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

  //console log all points
  printPoints = (array) => {
    console.log(JSON.stringify(array));
    console.log(
      "Drawing: " + this.state.draw + "/ Active: " + this.state.active
    );
  };

  /* Display componenets ***********************/

  renderPoints = () => {
    return this.state.startPoints.map((point, index) => {
      return (
        <Point
          key={index.toString() + this.state.currentLevel.toString()}
          x={point[0]}
          y={point[1]}
          updatePos={this.updatePosition}
          index={index}
        />
      );
    });
  };

  onDoubleClick(e) {
    console.log("double click");
    let index = order.indexOf(this.state.currentLevel);
    if (index == -1) {
      index = 5;
    } else {
      if (index == 5) {
        index = order[0];
      } else {
        index = order[index + 1];
      }
    }
    this.toggleLevel(index);
  }

  onClick(e) {
    console.log("click");
    if (this.state.draw) {
      if (this.state.active) {
        //second point of line
        let index;

        if (!this.state.startPoints[2]) index = 2;
        else if (!this.state.startPoints[4]) index = 4;
        else index = -1; //no empty slot

        if (index == 2) {
          let mx = (this.state.points[0][0] + e.clientX) / 2;
          let my = (this.state.points[0][1] + e.clientY) / 2;
          let midpoint = [true, 1, mx, my];
          let endpoint = [true, 2, e.clientX, e.clientY];
          this.updateManyPositions([midpoint, endpoint]);
          this.setState({ active: false }); //no longer actively drawing a line segment
        } else if (index == 4) {
          let mx = (this.state.points[6][0] + e.clientX) / 2;
          let my = (this.state.points[6][1] + e.clientY) / 2;
          let midpoint = [true, 5, mx, my];
          let endpoint = [true, 4, e.clientX, e.clientY];

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
              let mx = (this.state.points[2][0] + e.clientX) / 2;
              let my = (this.state.points[2][1] + e.clientY) / 2;
              addPoints.push([true, 3, mx, my]);
            }
            if (!this.state.startPoints[7]) {
              //midpoint not already added
              let mx = (this.state.points[0][0] + this.state.points[6][0]) / 2;
              let my = (this.state.points[0][1] + this.state.points[6][1]) / 2;
              addPoints.push([true, 7, mx, my]);
            }
          }
          this.updateManyPositions(addPoints);
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
          this.updatePosition(true, index, e.clientX, e.clientY); //added a point
          this.setState({ active: true }); //actively drawing a line segment
        }
      }
    }
  }

  onMouseMove(e) {
    if (this.state.draw) {
      this.setState({
        mouseX: e.clientX,
        mouseY: e.clientY,
      });
    }
  }

  renderLines = () => {
    let lines = [];
    let x0;
    let y0;
    let x1;
    let y1;
    let a = 0;
    let b = 1;
    while (b < this.state.points.length) {
      if (this.state.points[a] && this.state.points[b]) {
        x0 = this.state.points[a][0];
        y0 = this.state.points[a][1];
        x1 = this.state.points[b][0];
        y1 = this.state.points[b][1];
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
      x0 = this.state.points[a][0];
      y0 = this.state.points[a][1];
      x1 = this.state.points[0][0];
      y1 = this.state.points[0][1];
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
  };

  renderLandmarks = () => {
    if (this.state.landmarks) {
      let vertebra = [];
      let i = 0;
      while (i < this.state.landmarks.length) {
        if (i != this.state.currentLevel && this.state.landmarks[i]) {
          vertebra.push(
            <Landmarks
              key={i}
              points={this.state.landmarks[i]}
              toggleLevel={this.toggleLevel}
              level={i}
            />
          );
        }
        i += 1;
      }
      return <div>{vertebra}</div>;
    }
  };

  renderMasks = () => {
    if (this.state.landmarks) {
      let vertebra = [];
      let i = 0;
      while (i < this.state.landmarks.length) {
        if (i != this.state.currentLevel && this.state.landmarks[i]) {
          vertebra.push(
            <Mask key={i} points={this.state.landmarks[i]} active={false} />
          );
        }
        i += 1;
      }
      return <>{vertebra}</>;
    }
  };

  render() {
    return (
      <div>
        <div
          onClick={this.onClick}
          onDoubleClick={this.onDoubleClick}
          onMouseMove={this.onMouseMove}
          className="Overlay"
        >
          {this.renderPoints()}
          {this.activeDraw()}
          {this.activeLine()}
          {this.renderLines()}
          {this.renderLandmarks()}
          <Stage
            width={window.innerWidth}
            height={window.innerHeight}
            x={0}
            y={0}
          >
            <Layer>
              <Mask
                key={new Date().getTime()}
                points={this.state.points}
                active={true}
              />
              {this.renderMasks()}
            </Layer>
          </Stage>
        </div>
        <div>{this.getAngles()}</div>
        <div className="switch">
          <label>
            <Switch
              onChange={this.anteriorSide}
              checked={this.state.anteriorLeft}
              onColor="#809be6"
              offColor="#000000"
            />
            <div>Anterior on Left?</div>
          </label>
        </div>
        <div className="rightPanel">
          <LevelButton
            index={1}
            level={"L1"}
            active={1 == this.state.currentLevel ? true : false}
            toggleLevel={this.toggleLevel}
          />
          <LevelButton
            index={2}
            level={"L2"}
            active={2 == this.state.currentLevel ? true : false}
            toggleLevel={this.toggleLevel}
          />
          <LevelButton
            index={3}
            level={"L3"}
            active={3 == this.state.currentLevel ? true : false}
            toggleLevel={this.toggleLevel}
          />
          <LevelButton
            index={4}
            level={"L4"}
            active={4 == this.state.currentLevel ? true : false}
            toggleLevel={this.toggleLevel}
          />
          <LevelButton
            index={5}
            level={"L5"}
            active={5 == this.state.currentLevel ? true : false}
            toggleLevel={this.toggleLevel}
          />
          <LevelButton
            index={0}
            level={"S1"}
            active={0 == this.state.currentLevel ? true : false}
            toggleLevel={this.toggleLevel}
          />
        </div>
      </div>
    );
  }
}
