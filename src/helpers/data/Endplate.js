export default class Endplate {
  constructor(array) {
    if (array) this.points = array;
    else this.points = new Array(4).fill(null);
  }

  getPoint(index) {
    let start = index * 2;
    return this.points.slice(start, start + 2);
  }

  addPoint(x, y) {
    if (!this.points[0]) {
      this.points[0] = x;
      this.points[1] = y;
    } else if (!this.points[2]) {
      //always make sure lower x value is stored index=0;
      if (this.points[0] > x) {
        this.points[2] = this.points[0];
        this.points[3] = this.points[1];
        this.points[0] = x;
        this.points[1] = y;
      } else {
        this.points[2] = x;
        this.points[3] = y;
      }
    }
  }

  setPoint(index, x, y) {
    if (index > 1) {
      return;
    }
    let start = index * 2;
    this.points[start] = x;
    this.points[start + 1] = y;
  }

  get array() {
    return this.points;
  }

  findEmpty() {
    let empty = null;
    for (let i = 0; i < this.points.length; i++) {
      if (!empty && !this.points[i]) {
        empty = i;
      }
    }
    return empty;
  }

  get complete() {
    return !this.points.includes(null);
  }
}
