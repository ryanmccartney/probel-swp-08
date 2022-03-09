const Probel = require("../index");

const port = 8910;
const host = "172.24.51.74";

const sourceTotal = 1005;
const destinationTotal = 1005;
const levelTotal = 16;

const probel = new Probel(host, port, sourceTotal, destinationTotal, levelTotal);

//Turn on debug mode so we can see what's being sent and received in bytes
probel.debug = true;

//Make a single crosspoint Probel.route(SOURCE_NUMBER, DESTINATION_NUMBER, DESTINATION_LEVEL_NUMBER)
probel.route(1, 1, 1);
