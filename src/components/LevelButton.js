//TODO: polygon shaded in based on set of vertices (display only)
import React, { Component } from "react";
import "./styles.css";
import { HiTrash } from "react-icons/hi";

export default class Mask extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: this.props.active ? this.props.active : false,
      controller: this.props.controller ? true : false,
    };

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    if (this.state.controller) {
      this.props.toggleLevel();
    } else {
      this.setState({ active: !this.state.active });
      this.props.toggleLevel(this.props.index);
    }
  }

  render() {
    return (
      <div className="level">
        <div
          className={this.props.active ? "buttonLevelSelected" : "buttonLevel"}
          onClick={this.onClick}
        >
          {this.props.level}
        </div>
        {this.props.active && this.props.delete ? (
          <div
            onClick={
              this.props.index == 100
                ? () => this.props.delete()
                : () => this.props.delete(this.props.index)
            }
            className="reset"
          >
            <HiTrash />
          </div>
        ) : null}
      </div>
    );
  }
}
