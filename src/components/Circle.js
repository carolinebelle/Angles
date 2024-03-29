import React from "react";

//receives coordinates relative to size of image on screen (imgCoords)
export default class Circle extends React.Component {
  constructor(props) {
    super(props);
    let a = this.props.x0 - this.props.x1;
    let b = this.props.y0 - this.props.y1;
    let radius = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
    let diameter = radius * 2;
    let border = this.props.color
      ? "2px solid " + this.props.color
      : "2px solid red";

    this.style = {
      position: "absolute",
      width: diameter,
      height: diameter,
      borderRadius: "50%",
      border: border, //this.props.borderWidth + " solid red",
      top: this.props.y1 - radius,
      left: this.props.x1 - radius,
      pointerEvents: "none",
    };
  }
  render() {
    return <div style={this.style}></div>;
  }
}
