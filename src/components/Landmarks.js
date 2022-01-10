// TODO: Creates 8 landmarks, must be able to receive positions and export positions

import React from "react";
import "./styles.css";
import { Line } from "react-lineto";

export default class Landmarks extends React.Component {
  constructor(props) {
    super(props);
    this.renderPoints = this.renderPoints.bind(this);
    this.onClick = this.onClick.bind(this);
    this.renderLines = this.renderLines.bind(this);
    this.renderLabel = this.renderLabel.bind(this);

    this.yOffset = Math.max(50, window.innerHeight * 0.1);
  }

  componentDidUpdate() {}

  onClick(e) {
    this.props.toggleLevel(this.props.level);
  }

  renderPoints = () => {
    if (this.props.points) {
      let points = [];
      let count = 0;
      let i = 0;
      while (i < this.props.points.length) {
        if (this.props.points[i]) {
          points.push(
            <div
              key={i}
              className="pointInactive"
              style={{
                top: this.props.points[i][1] - 7,
                left: this.props.points[i][0] - 7,
              }}
            ></div>
          );
          count += 1;
        }
        i += 1;
      }

      if (count > 0) {
        return (
          <div>
            {points}
            {this.renderLabel()}
          </div>
        );
      } else {
        return <div>{points}</div>;
      }
    }
  };

  renderLines = () => {
    let lines = [];
    let x0;
    let y0;
    let x1;
    let y1;
    let a = 0;
    let b = 1;
    while (b < this.props.points.length) {
      if (this.props.points[a] && this.props.points[b]) {
        x0 = this.props.points[a][0];
        y0 = this.props.points[a][1];
        x1 = this.props.points[b][0];
        y1 = this.props.points[b][1];
        lines.push(
          <Line
            key={a}
            x0={x0}
            y0={y0}
            x1={x1}
            y1={y1}
            className="line"
            borderWidth={2}
            borderColor={"blue"}
          />
        );
      }
      a += 1;
      b += 1;
    }
    if (this.props.points[a] && this.props.points[0]) {
      x0 = this.props.points[a][0];
      y0 = this.props.points[a][1];
      x1 = this.props.points[0][0];
      y1 = this.props.points[0][1];
      lines.push(
        <Line
          key={a}
          x0={x0}
          y0={y0}
          x1={x1}
          y1={y1}
          className="line"
          borderWidth={2}
          borderColor={"blue"}
        />
      );
    }

    return <div>{lines}</div>;
  };

  renderLabel = () => {
    let x = 0;
    let y = 0;
    let n = 0;
    this.props.points.forEach((point) => {
      if (point && point[0] && point[1]) {
        n += 1;
        x += point[0];
        y += point[1];
      }
    });
    x /= n;
    y /= n;

    const styleObj = {
      position: "absolute",
      top: y - this.yOffset - 10,
      left: x - 10,
      textAlign: "center",
      fontSize: 20,
      fontWeight: "bold",
      color: "white",
      zIndex: 2,
      cursor: "pointer",
    };

    const translator = ["S1", "L1", "L2", "L3", "L4", "L5"];
    return (
      <div style={styleObj} onClick={this.onClick}>
        {translator[this.props.level]}
      </div>
    );
  };

  render() {
    return (
      <div>
        {this.renderPoints()}
        {this.renderLines()}
      </div>
    );
  }
}
