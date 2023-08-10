const Probel = require("./../index");

const port = 8910;
const host = "172.26.108.80";

const probel = new Probel(host, { port: port });

//Turn on debug mode so we can see what's being sent and received in bytes
probel.debug = true;

//Make a single crosspoint Probel.route(DESTINATION_LEVEL_NUMBER,SOURCE_NUMBER, DESTINATION_NUMBER)
probel.route(5, 16, 16);

//'Married Route' route all levels of one source to a destination Probel.routeAllLevels(SOURCE_NUMBER, DESTINATION_NUMBER)
probel.routeAllLevels(9, 9);
