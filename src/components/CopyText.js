import React, { useState, useCallback } from "react";
import "./styles.css";

export default class CopyText extends React.Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    let textToCopy =
      "LL: " +
      this.props.LL +
      "\nPT: " +
      this.props.PT +
      "\nPI: " +
      this.props.PI +
      "\n";
    navigator.clipboard.writeText(textToCopy);
    //TODO: some kind of visual notification that text has been copied
  }

  render() {
    return (
      <div onClick={this.onClick} className="TextBox">
        <div>
          LL: {this.props.LL}
          <br />
          PT: {this.props.PT}
          <br />
          PI: {this.props.PI}
        </div>
      </div>
    );
  }
}
