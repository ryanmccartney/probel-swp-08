const Probel = require("./../index");

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
probel.debug = true;

const main = async () => {
    //Make a single crosspoint Probel.route(DESTINATION_LEVEL_NUMBER,SOURCE_NUMBER, DESTINATION_NUMBER)
    await probel.route(5, 16, 16);
    console.log("Routed an individual level");

    //'Married Route' route all levels of one source to a destination Probel.routeAllLevels(SOURCE_NUMBER, DESTINATION_NUMBER)
    await probel.routeAllLevels(12, 12);
    console.log("Routed all levels of a source and destination");

    //1 to 1 routing on matrix (DANGER - don't use on a live matrix)
    for (let i = 1; i < 20; i++) {
        await probel.routeAllLevels(i, i);
        console.log(`Routed all levels of a source ${i} to destination ${i}`);
    }
};

main();
