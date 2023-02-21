const Probel = require("./../index");

const port = 8910;
const host = "172.26.182.100";

const sourceTotal = 1000;
const destinationTotal = 1000;
const levelTotal = 16;

const probel = new Probel(host, port, sourceTotal, destinationTotal, levelTotal);

//Turn on debug mode so we can see what's being sent and received in bytes
probel.debug = true;

//Get source labels (8 chars long) and return them in an object
const sourceNames = probel.getSourceNames();
console.log(sourceNames);

//Get destination labels (8 chars long) and return them in an object
const destinationNames = probel.getDestinationNames();
