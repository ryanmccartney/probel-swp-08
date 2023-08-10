const Probel = require("../index");

const port = 8910;
const host = "172.26.108.80";

const sourceTotal = 1329;
const destinationTotal = 188;
const levelTotal = 17;

const probel = new Probel(host, port, sourceTotal, destinationTotal, levelTotal);

//Turn on debug mode so we can see what's being sent and received in bytes
probel.debug = true;

//Make a single crosspoint Probel.route(LEVEL_NUMBER,SOURCE_NUMBER, LABEL_TEXT)
const status = probel.setSourceLabel(0, 1, "ABCDEFGH");

console.log(status);
