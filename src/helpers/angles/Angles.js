export function calcAngle(x1, y1, x2, y2) {
  let leftX;
  let leftY;
  let rightX;
  let rightY;

  if (x1 < x2) {
    leftX = x1;
    leftY = y1;
    rightX = x2;
    rightY = y2;
  } else {
    leftX = x2;
    leftY = y2;
    rightX = x1;
    rightY = y1;
  }

  return Math.atan2(rightY - leftY, rightX - leftX);
}

export function unscramble(x1, y1, x2, y2, x3, y3, x4, y4) {
  const map = new Map();

  if (y1 < y3) {
    if (x1 < x2) {
      map.set("SupL", [x1, y1]);
      map.set("SupR", [x2, y2]);
    } else {
      map.set("SupR", [x1, y1]);
      map.set("SupL", [x2, y2]);
    }
    if (x3 < x4) {
      map.set("InfL", [x3, y3]);
      map.set("InfR", [x4, y4]);
    } else {
      map.set("InfR", [x3, y3]);
      map.set("InfL", [x4, y4]);
    }
  } else {
    if (x1 < x2) {
      map.set("InfL", [x1, y1]);
      map.set("InfR", [x2, y2]);
    } else {
      map.set("InfR", [x1, y1]);
      map.set("InfL", [x2, y2]);
    }
    if (x3 < x4) {
      map.set("SupL", [x3, y3]);
      map.set("SupR", [x4, y4]);
    } else {
      map.set("SupR", [x3, y3]);
      map.set("SupL", [x4, y4]);
    }
  }
  return map;
}

export function toCSV(arr) {
  let csvContent =
    "data:text/csv;charset=utf-8," + arr.map((e) => e.join(",")).join("\n");

  return csvContent;
}

export function downloadCSV(csvContent) {
  const date = new Date();
  const yyyy = date.getFullYear();
  let mm = date.getMonth() + 1; // Months start at 0!
  let dd = date.getDate();

  if (dd < 10) dd = "0" + dd;
  if (mm < 10) mm = "0" + mm;

  const today = dd + "/" + mm + "/" + yyyy;

  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "endplate_data_" + today + ".csv");
  document.body.appendChild(link); // Required for FF

  link.click(); // This will download the data file named "my_data.csv".
}

/** given a specific imageID retrieves data from all sessions and returns a 2d array in CSV format */
export function getDataFromFirebase() {
  return null;
}

/** will download a CSV with data from every image on firebase */
function downloadAllCSVS() {
  return null;
}
