const Probel = require("./../index");

const port = 8910;
const host = "172.26.108.80";

const sourceTotal = 1329;
const destinationTotal = 188;
const levelTotal = 17;

//Example config object
const config = {
    port: port,
    destinations: destinationTotal,
    sources: sourceTotal,
    levels: levelTotal,
};

const probel = new Probel(host, config);

//Turn on debug mode so we can see what's being sent and received in bytes
probel.debug = true;

const main = async () => {
    //Get source labels (8 chars long) and return them in an object
    const sourceNames = await probel.getSourceNames();
    console.log(sourceNames);

    //Get destination labels (8 chars long) and return them in an object
    const destinationNames = await probel.getDestinationNames();
    console.log(destinationNames);
};

main();
