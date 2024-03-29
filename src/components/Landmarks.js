// TODO: Creates 8 landmarks, must be able to receive positions and export positions

import React from "react";
import "./styles.css";
import { Line } from "react-lineto";
import Circle from "./Circle";

//receives coordinates relative to size of image on screen (imgCoords)
export default class Landmarks extends React.Component {
  constructor(props) {
    super(props);
    this.renderPoints = this.renderPoints.bind(this);
    this.onClick = this.onClick.bind(this);
    this.renderLines = this.renderLines.bind(this);
    this.renderLabel = this.renderLabel.bind(this);
  }

  onClick(e) {
    this.props.toggleLevel(this.props.level);
  }

  renderPoints = () => {
    if (this.props.points) {
      let points = [];
      let count = 0;
      let i = 0;
      while (i + 1 < this.props.points.length) {
        if (this.props.points[i] && this.props.points[i + 1]) {
          points.push(
            <div
              key={i}
              className="pointInactive"
              style={{
                top: this.props.points[i + 1] - 7,
                left: this.props.points[i] - 7,
              }}
              onClick={this.onClick}
            />
          );
          count += 1;
        }
        i += 2;
      }

      if (count > 0) {
        return (
          <div>
            {points}
            {this.renderLabel()}
          </div>
        );
      }
    }
  };

  renderLines = () => {
    let x0;
    let y0;
    let x1;
    let y1;
    if (this.props.level == 6 || this.props.level == 7) {
      if (
        this.props.points[0] &&
        this.props.points[1] &&
        this.props.points[2] &&
        this.props.points[3]
      ) {
        x0 = this.props.points[0];
        y0 = this.props.points[1];
        x1 = this.props.points[2];
        y1 = this.props.points[3];
        return (
          <Circle
            key={x0 + ", " + y0 + " and " + x1 + ", " + y1}
            x0={x0}
            y0={y0}
            x1={x1}
            y1={y1}
            color="blue"
          />
        );
      }
    } else {
      let lines = [];
      let coords;
      let a = 0;
      while (a + 3 < this.props.points.length) {
        if (
          this.props.points[a] &&
          this.props.points[a + 1] &&
          this.props.points[a + 2] &&
          this.props.points[a + 3]
        ) {
          coords = this.props.translator(
            this.props.points[a],
            this.props.points[a + 1]
          );
          x0 = coords.x;
          y0 = coords.y;
          coords = this.props.translator(
            this.props.points[a + 2],
            this.props.points[a + 3]
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
              borderWidth={2}
              borderColor="blue"
            />
          );
        }
        a += 4;
      }
      if (
        this.props.points[a] &&
        this.props.points[a + 1] &&
        this.props.points[0] &&
        this.props.points[1]
      ) {
        coords = this.props.translator(
          this.props.points[a],
          this.props.points[a + 1]
        );
        x0 = coords.x;
        y0 = coords.y;
        coords = this.props.translator(
          this.props.points[0],
          this.props.points[1]
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
            borderWidth={2}
            borderColor="blue"
          />
        );
      }
      return <div>{lines}</div>;
    }
  };

  renderLabel = () => {
    let x = 0;
    let y = 0;
    let n = 0;
    for (let i = 0; i + 1 < this.props.points.length; i += 2) {
      if (this.props.points[i] && this.props.points[i + 1]) {
        n += 1;
        x += this.props.points[i];
        y += this.props.points[i + 1];
      }
    }
    x /= n;
    y /= n;

    const styleObj = {
      position: "absolute",
      top: y - 10,
      left: x - 10,
      textAlign: "center",
      fontSize: 20,
      fontWeight: "bold",
      color: "white",
      zIndex: 4,
      cursor: "pointer",
    };

    const translator = ["S1", "L1", "L2", "L3", "L4", "L5", "F1", "F2"];
    return (
      <div style={styleObj} onClick={this.onClick}>
        {translator[this.props.level]}
      </div>
    );
  };

  render() {
    return (
      <div>
        {this.renderLines()}
        {this.renderPoints()}
      </div>
    );
  }
}
