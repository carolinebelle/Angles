//TODO: polygon shaded in based on set of vertices (display only)
import React, { Component } from "react";
import { Shape, Group } from "react-konva";

export default class Mask extends Component {
  constructor(props) {
    super(props);
    this.validPoints = this.validPoints.bind(this);
    this.customShape = this.customShape.bind(this);
  }

  customShape = (context, shape) => {
    context.beginPath();
    context.moveTo(this.props.points[0], this.props.points[1]);
    let i = 2;
    while (i + 1 < this.props.points.length) {
      context.lineTo(this.props.points[i], this.props.points[i + 1]);
      i += 2;
    }
    context.closePath();
    // (!) Konva specific method, it is very important
    context.fillStrokeShape(shape);
  };

  validPoints() {
    console.log("mask points: " + this.props.points);
    if (!this.props.points) {
      return;
    } else if (this.props.points.includes(null)) {
      return;
    } else if (this.props.points.includes(undefined)) {
      return;
    } else {
      let fill;
      if (this.props.active) {
        fill = "rgba(255, 0, 0, 0.15)";
      } else {
        fill = "rgba(0, 0, 255, 0.15";
      }
      return <Shape sceneFunc={this.customShape} fill={fill} />;
    }
  }

  render() {
    return <Group>{this.validPoints()}</Group>;
  }
}
