import React from "react";
import "./styles.css";
import { Line } from "react-lineto";
import Point from "./Point";
import CopyText from "./CopyText";
import Switch from "react-switch";

//TODO: selectively delete points and lines
//TODO: determine if adjusting existing point vs. adding new point
//TODO: point or line changes color when selected
//TODO: points should be stuck to image even when resizing page

export default class Overlay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      points: this.props.points,
      numPoints: 0,
      startPoints: this.props.points,
      anteriorLeft: true,
    };
    this.printPoints = this.printPoints.bind(this);
    this.updatePosition = this.updatePosition.bind(this);
    this.renderPoints = this.renderPoints.bind(this);
    this.onClick = this.onClick.bind(this);
    this.renderLumbar = this.renderLumbar.bind(this);
    this.renderS = this.renderS.bind(this);
    this.renderPTVertical = this.renderPTVertical.bind(this);
    this.renderFemToS = this.renderFemToS.bind(this);
    this.getAngles = this.getAngles.bind(this);
    this.anteriorSide = this.anteriorSide.bind(this);
  }

  anteriorSide(checked) {
    this.setState({ anteriorLeft: checked });
  }

  updateCount = 0;

  componentDidUpdate() {
    // Typical usage (don't forget to compare props):
    console.log(++this.updateCount + " overlay updated");
    this.printPoints();
  }

  getAngles() {
    let ll = null;
    let pi = null;
    let pt = null;

    if (this.state.points[2] && this.state.points[3]) {
      if (this.state.points[0] && this.state.points[1]) {
        //calculate angle LL
        let xSLeft;
        let ySLeft;
        let xSRight;
        let ySRight;
        let xLLeft;
        let yLLeft;
        let xLRight;
        let yLRight;
        if (this.state.points[2][0] < this.state.points[3][0]) {
          xSLeft = this.state.points[2][0];
          ySLeft = this.state.points[2][1];
          xSRight = this.state.points[3][0];
          ySRight = this.state.points[3][1];
        } else {
          xSRight = this.state.points[2][0];
          ySRight = this.state.points[2][1];
          xSLeft = this.state.points[3][0];
          ySLeft = this.state.points[3][1];
        }
        if (this.state.points[0][0] < this.state.points[1][0]) {
          xLLeft = this.state.points[0][0];
          yLLeft = this.state.points[0][1];
          xLRight = this.state.points[1][0];
          yLRight = this.state.points[1][1];
        } else {
          xLRight = this.state.points[0][0];
          yLRight = this.state.points[0][1];
          xLLeft = this.state.points[1][0];
          yLLeft = this.state.points[1][1];
        }

        let alpha0 = Math.atan2(yLRight - yLLeft, xLRight - xLLeft);
        let alpha1 = Math.atan2(ySRight - ySLeft, xSRight - xSLeft);
        if (this.state.anteriorLeft) {
          ll = Math.round(((alpha0 - alpha1) * 180) / Math.PI);
        } else {
          ll = -Math.round(((alpha0 - alpha1) * 180) / Math.PI);
        }
      }
    }

    if (this.state.points[2] && this.state.points[3]) {
      if (this.state.points[4] && this.state.points[5]) {
        //calculate angle PI
        let x0 = (this.state.points[2][0] + this.state.points[3][0]) / 2; //x of midpoint between points 2 and 3
        let y0 = (this.state.points[2][1] + this.state.points[3][1]) / 2;
        let x1 = (this.state.points[4][0] + this.state.points[5][0]) / 2; //x of midpoint between femoral head centerss
        let y1 = (this.state.points[4][1] + this.state.points[5][1]) / 2;
        let rise = this.state.points[3][1] - this.state.points[2][1];
        let run = this.state.points[3][0] - this.state.points[2][0];
        if (run < 0) {
          rise = this.state.points[2][1] - this.state.points[3][1];
          run = this.state.points[2][0] - this.state.points[3][0];
        }
        let x2 = x0 - 3 * rise;
        let y2 = y0 + 3 * run;

        // let alpha0 = Math.atan2(y0 - y1, x0 - x1); //line from femoral head midpoint to sacral midpoint
        let alpha1 = Math.atan2(Math.abs(y0 - y2), Math.abs(x0 - x2)); //perpendicular bisect of sacral line
        let alpha3 = Math.atan2(Math.abs(y1 - y0), Math.abs(x1 - x0)); //line from femoral head midpoint to sacral midpoint
        pi = 180 - Math.round(((alpha3 + alpha1) * 180) / Math.PI);
        pt = 90 - Math.round((alpha3 * 180) / Math.PI);
      }
    }
    return <CopyText LL={ll} PI={pi} PT={pt} />;
  }

  onClick(e) {
    console.log("Overlay mouse click location " + e.clientX + ", " + e.clientY);
    console.log(this.state.points.toString());
    let index = 0;
    let empty = false;
    while (!empty && index < this.state.startPoints.length) {
      if (!this.state.startPoints[index]) empty = true;
      else index++;
    }
    if (empty) {
      console.log(
        "adding point " + index + " at " + e.clientX + ", " + e.clientY
      );
      this.updatePosition(true, index, e.clientX, e.clientY);
    }
  }

  //console log all points
  printPoints = () => {
    console.log("points stored in Overlay state");
    this.state.points.forEach((item) => console.log(item));
  };

  // //call setState to re-render component after updating coordinate of one point
  updatePosition(initial, index, x, y) {
    if (initial) {
      let iPoints = new Array(this.state.startPoints.length);

      for (let i = 0; i < this.state.startPoints.length; i++)
        if (this.state.startPoints[i]) {
          iPoints[i] = { ...this.state.startPoints[i] };
        }

      iPoints[index] = [x, y];

      this.setState({ startPoints: iPoints });
    }
    let updatedPoints = new Array(this.state.points.length);

    for (let i = 0; i < this.state.points.length; i++)
      if (this.state.points[i]) {
        updatedPoints[i] = { ...this.state.points[i] };
      }

    updatedPoints[index] = [x, y];

    this.setState({ points: updatedPoints });
  }

  renderPoints = () => {
    return this.state.startPoints.map((point, index) => {
      return (
        <Point
          key={index}
          x={point[0]}
          y={point[1]}
          updatePos={this.updatePosition}
          index={index}
        />
      );
    });
  };

  renderLumbar = () => {
    // console.log("attempting to draw lumbar disc line");
    if (this.state.points[0] && this.state.points[1]) {
      let x0 = this.state.points[0][0];
      let y0 = this.state.points[0][1];
      let x1 = this.state.points[1][0];
      let y1 = this.state.points[1][1];
      return <Line x0={x0} y0={y0} x1={x1} y1={y1} zIndex={3} />;
    }
  };

  renderS = () => {
    // console.log("attempting to draw sacral line");
    if (this.state.points[2] && this.state.points[3]) {
      let xm = (this.state.points[2][0] + this.state.points[3][0]) / 2;
      let ym = (this.state.points[2][1] + this.state.points[3][1]) / 2;
      let rise = this.state.points[3][1] - this.state.points[2][1];
      let run = this.state.points[3][0] - this.state.points[2][0];
      if (run < 0) {
        rise = this.state.points[2][1] - this.state.points[3][1];
        run = this.state.points[2][0] - this.state.points[3][0];
      }

      return (
        <div>
          <Line
            x0={this.state.points[2][0]}
            y0={this.state.points[2][1]}
            x1={this.state.points[3][0]}
            y1={this.state.points[3][1]}
            zIndex={3}
          />
          <Line
            x0={xm}
            y0={ym}
            x1={xm - 3 * rise}
            y1={ym + 3 * run}
            zIndex={3}
          />
        </div>
      );
    }
  };

  renderPTVertical = () => {
    // console.log("attempting to draw vertical from femoral head midpoint");
    if (this.state.points[4] && this.state.points[5]) {
      let x = (this.state.points[4][0] + this.state.points[5][0]) / 2;
      let y = (this.state.points[4][1] + this.state.points[5][1]) / 2;
      return <Line x0={x} y0={y} x1={x} y1={Math.max(y - 300, 0)} zIndex={3} />;
    }
  };

  renderFemToS = () => {
    // console.log(
    //   "attempting to draw line from femoral head midpoint to sacrum midpoint"
    // );
    if (
      this.state.points[2] &&
      this.state.points[3] &&
      this.state.points[4] &&
      this.state.points[5]
    ) {
      let x = (this.state.points[2][0] + this.state.points[3][0]) / 2;
      let y = (this.state.points[2][1] + this.state.points[3][1]) / 2;
      let x2 = (this.state.points[4][0] + this.state.points[5][0]) / 2;
      let y2 = (this.state.points[4][1] + this.state.points[5][1]) / 2;
      return <Line x0={x} y0={y} x1={x2} y1={y2} zIndex={3} />;
    }
  };

  render() {
    return (
      <div>
        <div onClick={this.onClick} className="Overlay">
          {this.renderPoints()}
          {this.renderLumbar()}
          {this.renderS()}
          {this.renderPTVertical()}
          {this.renderFemToS()}
        </div>
        <div>{this.getAngles()}</div>
        <div className="switch">
          <label>
            <Switch
              onChange={this.anteriorSide}
              checked={this.state.anteriorLeft}
              onColor="#9A97AD"
              offColor="#000000"
            />
            <div>Anterior on Left?</div>
          </label>
        </div>
      </div>
    );
  }
}
