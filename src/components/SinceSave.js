import React from "react";

export default function SinceSave(props) {
  const [now, setNow] = React.useState(Date.now());
  const [interval, setInterval] = React.useState(1000);

  React.useEffect(() => {
    if (now - props.lastSave < 10000) {
      setInterval(1000);
    } else if (interval == 1000 && now - props.lastSave > 10000) {
      setInterval(10000);
    } else if (interval == 10000 && now - props.lastSave > 60000) {
      setInterval(60000);
    }
    setTimeout(() => setNow(Date.now()), interval);
  }, [now]);

  const formatTime = (millis) => {
    let seconds = Math.floor(millis / 1000);
    if (seconds > 59) {
      let minutes = Math.floor(seconds / 60);
      seconds = seconds % 60;
      if (minutes > 59) {
        let hours = Math.floor(minutes / 60);
        minutes = minutes % 60;
        if (hours > 23) {
          return `on ${new Date(props.lastSave).toLocaleDateString()}`;
        } else {
          return `${hours} hours ago`;
        }
      } else {
        if (minutes == 1) {
          return `1 minute ago`;
        } else {
          return `${minutes} minutes ago`;
        }
      }
    } else if (seconds < 1) {
      return "now";
    } else {
      if (seconds == 1) {
        return `1 second ago`;
      } else {
        return `${seconds} seconds ago`;
      }
    }
  };

  return (
    <div className="save-text">
      {props.unsaved
        ? `last saved ${formatTime(now - props.lastSave)}...`
        : `Up to date.`}
    </div>
  );
}
