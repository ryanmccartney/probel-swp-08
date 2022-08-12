const Probel = require("../index");

const port = 8910;
//const host = "172.24.51.74";
const host = "172.26.182.8";

const sourceTotal = 1005;
const destinationTotal = 1005;
const levelTotal = 16;

const probel = new Probel(host, port, sourceTotal, destinationTotal, levelTotal);

//Turn on debug mode so we can see what's being sent and received in bytes
probel.debug = true;

//Make a single crosspoint Probel.route(DESTINATION_LEVEL_NUMBER,SOURCE_NUMBER, DESTINATION_NUMBER)
probel.route(12, 2, 2);

//'Married Route' route all levels of one source to a destination Probel.routeAllLevels(SOURCE_NUMBER, DESTINATION_NUMBER)
probel.routeAllLevels(2, 2);
