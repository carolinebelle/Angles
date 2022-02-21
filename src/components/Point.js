import React from "react";
import Draggable from "react-draggable";
import "./styles.css";

//receives img coords of draggable points
export default class Point extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      deltaPosition: {
        x: this.props.x,
        y: this.props.y,
      },
    };
    this.yOffset = Math.max(50, window.innerHeight * 0.1);
  }

  handleDrag = (e, ui) => {
    document.onselectstart = function () {
      return false;
    };
    console.log(this.props.index);
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
      this.state.deltaPosition.y,
      true
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
