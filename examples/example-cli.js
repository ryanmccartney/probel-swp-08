const Probel = require("../index");
const argv = require("minimist")(process.argv.slice(2));

const port = 8910;
const host = "192.168.x.x";
const levelTotal = 17;

//Example config object
const config = {
    port: port,
    extended: true,
    levels: levelTotal,
    sources: 1329,
    destinations: 188,
};

const probel = new Probel(host, config);

//Turn on debug mode so we can see what's being sent and received in bytes
probel.debug = false;

const route = async (source, destination) => {
    //'Married Route' route all levels of one source to a destination Probel.routeAllLevels(SOURCE_NUMBER, DESTINATION_NUMBER)
    await probel.routeAllLevels(source, destination);
    console.log(`Routed all levels of a source #${source} to destination #${destination}`);
    process.exit();
};

if (argv?.source && argv?.destination) {
    route(argv?.source, argv?.destination);
}
