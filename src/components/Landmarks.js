// TODO: Creates 8 landmarks, must be able to receive positions and export positions

import React from "react";
import Draggable from "react-draggable";
import "./styles.css";
import Point from "./Point";

export default class Landmarks extends React.Component {
  constructor(props) {
    super(props);
    console.log("point created with props: " + props);
    this.state = {
      deltaPosition: {
        x: this.props.x,
        y: this.props.y,
      },
    };
  }

  handleDrag = (e, ui) => {
    const { x, y } = this.state.deltaPosition;
    this.setState({
      deltaPosition: {
        x: x + ui.deltaX,
        y: y + ui.deltaY,
      },
    });

    this.props.updatePos(
      false,
      this.props.index,
      this.state.deltaPosition.x,
      this.state.deltaPosition.y
    );
  };

  render() {
    // const { deltaPosition } = this.state;
    return (
      <div>
        <Draggable onDrag={this.handleDrag}>
          <div
            className="point"
            style={{
              top: this.props.y - 7,
              left: this.props.x - 7,
            }}
          ></div>
        </Draggable>
      </div>
    );
  }
}
