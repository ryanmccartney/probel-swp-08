const Probel = require("./../index");

const port = 8910;
const host = "172.26.108.80";

const sourceTotal = 1329;
const destinationTotal = 188;
const levelTotal = 17;

const probel = new Probel(host, port, sourceTotal, destinationTotal, levelTotal);

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
