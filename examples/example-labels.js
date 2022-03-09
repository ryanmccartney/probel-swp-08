const Probel = require("./../index");

const port = 8910;
const host = "172.24.51.74";

const sourceTotal = 1005;
const destinationTotal = 1005;
const levelTotal = 16;

const probel = new Probel(host, port, sourceTotal, destinationTotal, levelTotal);

//Get source labels (8 chars long) and return them in an object
const sourceNames = probel.getSourceNames();
console.log(sourceNames);

//Get destination labels (8 chars long) and return them in an object
const destinationNames = probel.getDestinationNames();
console.log(destinationNames);
