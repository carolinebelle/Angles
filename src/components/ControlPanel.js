import React from "react";
import LevelButton from "./LevelButton";
import "./styles.css";

export default function ControlPanel(props) {
  return (
    <div className="rightPanel">
      <LevelButton
        index={100}
        level={"CLEAR"}
        active={true}
        toggleLevel={props.completeDelete}
        controller={true}
      />
      <LevelButton
        index={1}
        level={"L1"}
        active={1 == props.currentLevel ? true : false}
        toggleLevel={props.toggleLevel}
        delete={props.levelDelete}
      />
      <LevelButton
        index={2}
        level={"L2"}
        active={2 == props.currentLevel ? true : false}
        toggleLevel={props.toggleLevel}
        delete={props.levelDelete}
      />
      <LevelButton
        index={3}
        level={"L3"}
        active={3 == props.currentLevel ? true : false}
        toggleLevel={props.toggleLevel}
        delete={props.levelDelete}
      />
      <LevelButton
        index={4}
        level={"L4"}
        active={4 == props.currentLevel ? true : false}
        toggleLevel={props.toggleLevel}
        delete={props.levelDelete}
      />
      <LevelButton
        index={5}
        level={"L5"}
        active={5 == props.currentLevel ? true : false}
        toggleLevel={props.toggleLevel}
        delete={props.levelDelete}
      />
      <LevelButton
        index={0}
        level={"S1"}
        active={0 == props.currentLevel ? true : false}
        toggleLevel={props.toggleLevel}
        delete={props.levelDelete}
      />
    </div>
  );
}
