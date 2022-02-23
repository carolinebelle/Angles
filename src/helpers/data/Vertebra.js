import Endplate from "./Endplate";

export default class Vertebra {
  constructor(array) {
    this.endplates = new Array(2);
    let index = 0;
    if (array) {
      for (let i = 0; i + 3 < array.length; i += 4) {
        this.endplates[index] = new Endplate(array.slice(i, i + 4));
        index++;
      }
    } else {
      this.endplates[0] = new Endplate();
      this.endplates[1] = new Endplate();
    }
  }

  getPlate(index) {
    return this.endplates[index];
  }

  addPoint(x, y) {
    let incompletePlate = null;
    let i = 0;
    while (!incompletePlate && i < this.endplates.length) {
      if (!this.endplates[i].complete()) {
        incompletePlate = i;
      }
    }
    if (incompletePlate) {
      this.endplates[incompletePlate].addPoint(x, y);
    }
  }

  setPoint(plateNum, pointNum, x, y) {
    this.endplates[plateNum].setPoint(pointNum, x, y);
  }

  get array() {
    let arr = [];
    this.endplates.forEach((plate) => {
      arr = arr.concat(plate.array);
    });
    return arr;
  }

  findEmpty() {
    let foundIncomplete = null;
    for (let i = 0; i < this.endplates.length; i++) {
      if (!foundIncomplete && !this.endplates[i]) {
        if (!this.endplates[i]) foundIncomplete = i;
        else if (!this.endplates[i].complete) foundIncomplete = i;
      }
    }
    return foundIncomplete;
  }

  get complete() {
    return this.findEmpty() == null;
  }
}
