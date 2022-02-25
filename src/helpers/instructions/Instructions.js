export default class Instructions {
  constructor() {
    this.name = "participant";

    this.toEdit =
      "Click EDIT to begin drawing line segments to annotate the endplates.";

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

  farewell() {
    return `Session complete, ${this.name}!`;
  }

  set(str) {
    switch (str.toLowerCase()) {
      case "greeting":
        this.setText(this.greeting());
        break;
      case "farewell":
        this.setText(this.farewell());
        break;
      default:
        this.setText(str);
        break;
    }
  }

  setText(str) {
    if (this.setText) {
      this.setText(str);
    }
    this.text = str;
  }
}
