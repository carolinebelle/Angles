export default class Instructions {
  constructor() {
    this.name = "participant";

    const hour = new Date().getHours();
    this.timeOfDay =
      (hour < 12 && "morning") || (hour < 17 && "afternoon") || "evening";

    this.text = this.greeting();
  }

  setName(lastName, title, firstName) {
    if (lastName) {
      if (title) {
        //prioritize title
        this.name = `${title} ${lastName}`;
      } else {
        if (firstName) {
          this.name = `${firstName} ${lastName}`;
        } else {
          this.name = lastName;
        }
      }
    }
  }

  displayText(stateSetter) {
    this.setText = stateSetter;
  }

  greeting() {
    return `Good ${this.timeOfDay}, ${this.name}!`;
  }

  set(str, level) {
    const translate = ["S1", "L1", "L2", "L3", "L4", "L5"];
    switch (str.toLowerCase()) {
      case "greeting":
        this.updateText(this.greeting());
        break;
      case "farewell":
        this.updateText(`Session complete!`);
        break;
      case "to edit":
        this.updateText(
          "Click EDIT to begin drawing line segments to annotate the endplates."
        );
        break;
      case "begin annotate":
        this.updateText(
          `Click to place an endpoint for a line segment to indicate the superior or inferior endplate of ${translate[level]}.`
        );
        break;
      case "second point":
        this.updateText(
          `Click to place the second endpoint of the line segment indicating the endplate.`
        );
        break;
      case "drag edit":
        this.updateText(
          `Drag any of the red end squares of ${translate[level]} to fine tune.`
        );
        break;
      case "select level":
        this.updateText("Select a level from the right panel.");
        break;
      default:
        this.updateText(str);
        break;
    }
  }

  updateText(str) {
    if (this.setText) {
      this.setText(str);
    }
    this.text = str;
  }
}
