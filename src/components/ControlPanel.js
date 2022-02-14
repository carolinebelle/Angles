import React from "react";
import LevelButton from "./LevelButton";
import "./styles.css";

export default function ControlPanel(props) {
  const [open, setOpen] = React.useState(props.isEditing);
  const [currentLevel, setCurrentLevel]

  if (open) {
    return (
      <div className="rightPanel">
        <LevelButton
          index={100}
          level={"SAVE"}
          active={open}
          toggleLevel={props.save}
          controller={true}
          delete={props.completeDelete}
        />
        <LevelButton
          index={1}
          level={"L1"}
          active={1 == this.state.currentLevel ? true : false}
          toggleLevel={this.toggleLevel}
          delete={this.levelDelete}
        />
        <LevelButton
          index={2}
          level={"L2"}
          active={2 == this.state.currentLevel ? true : false}
          toggleLevel={this.toggleLevel}
          delete={this.levelDelete}
        />
        <LevelButton
          index={3}
          level={"L3"}
          active={3 == this.state.currentLevel ? true : false}
          toggleLevel={this.toggleLevel}
          delete={this.levelDelete}
        />
        <LevelButton
          index={4}
          level={"L4"}
          active={4 == this.state.currentLevel ? true : false}
          toggleLevel={this.toggleLevel}
          delete={this.levelDelete}
        />
        <LevelButton
          index={5}
          level={"L5"}
          active={5 == this.state.currentLevel ? true : false}
          toggleLevel={this.toggleLevel}
          delete={this.levelDelete}
        />
        <LevelButton
          index={0}
          level={"S1"}
          active={0 == this.state.currentLevel ? true : false}
          toggleLevel={this.toggleLevel}
          delete={this.levelDelete}
        />
        <LevelButton
          index={6}
          level={"F1"}
          active={6 == this.state.currentLevel ? true : false}
          toggleLevel={this.toggleLevel}
          delete={this.levelDelete}
        />
        <LevelButton
          index={7}
          level={"F2"}
          active={7 == this.state.currentLevel ? true : false}
          toggleLevel={this.toggleLevel}
          delete={this.levelDelete}
        />
      </div>
    );
  } else {
    return (
      <div className="rightPanel">
        <LevelButton
          index={101}
          level={"EDIT"}
          active={false}
          toggleLevel={() => {
            this.setState({ editing: true });
            this.props.edits(true);
          }}
          controller={true}
        />
      </div>
    );
  }
}
