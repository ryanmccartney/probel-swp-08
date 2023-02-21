const Probel = require("./../index");

const port = 8910;
const host = "172.26.182.100";

const sourceTotal = 1004;
const destinationTotal = 1004;
const levelTotal = 15;

const probel = new Probel(host, port, sourceTotal, destinationTotal, levelTotal);

//Turn on debug mode so we can see what's being sent and received in bytes
probel.debug = true;

//Interrogate a single crosspoint probel.interrogate(destinationNumber, sourceNumber, levelNumber)
probel.interrogate(1, 1, 1);

//Interogate the whole router
probel.getState();
