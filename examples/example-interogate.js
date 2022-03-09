const Probel = require("./probel");

const port = 8910;
const host = "172.24.51.74";

const sourceTotal = 1005;
const destinationTotal = 1005;
const levelTotal = 16;

const probel = new Probel(host, port, sourceTotal, destinationTotal, levelTotal);

//probel.interrogate(12);

//probel.getState();

//Make a single crosspoint
//probel.route(1, 1, 1);
