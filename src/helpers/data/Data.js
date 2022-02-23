import Vertebra from "./Vertebra";

export default class Data {
  constructor(array) {
    this.vertebra = new Array(6);
    let index = 0;
    if (array) {
      for (let i = 0; i + 7 < array.length; i += 8) {
        this.vertebra[index] = new Vertebra(array.slice(i, i + 8));
        index++;
      }
    } else {
      for (let i = 0; i < this.vertebra.length; i++) {
        this.vertebra[i] = new Vertebra();
      }
    }
  }

  getVert(index) {
    return this.vertebra[index];
  }

  getVertArray(index) {
    return this.getVert(index).array;
  }

  setVert(index, array) {
    this.vertebra[index] = new Vertebra(array);
  }

  addPoint(x, y) {
    let incompleteVert = null;
    let i = 0;
    while (!incompleteVert && i < this.vertebra.length) {
      if (!this.vertebra[i].complete()) {
        incompleteVert = i;
      }
    }
    if (incompleteVert) {
      this.vertebra[incompleteVert].addPoint(x, y);
    }
  }

  copy() {
    return new Data(this.array);
  }

  /**
   *
   * @param {*} vertNum can range from 0 to 5; there are 6 vertebra
   * @param {*} plateNum can range from 0 to 1; each vertebra has two endplates
   * @param {*} pointNum can range from 0 to 1; each endplate is defined by two points
   * @param {*} x the x coordinate of the new point
   * @param {*} y the y coordinate of the new point
   */
  setPoint(vertNum, plateNum, pointNum, x, y) {
    this.vertebra[vertNum].setPoint(plateNum, pointNum, x, y);
  }

  get array() {
    let arr = [];
    this.vertebra.forEach((vert) => {
      arr = arr.concat(vert.array);
    });

    return arr;
  }

  get length() {
    return this.vertebra.length;
  }
}
