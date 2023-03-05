const Probel = require("./../index");

const port = 8910;
const host = "172.24.51.74";

const sourceTotal = 1560;
const destinationTotal = 360;
const levelTotal = 15;

const probel = new Probel(host, port, sourceTotal, destinationTotal, levelTotal);

//Turn on debug mode so we can see what's being sent and received in bytes
probel.debug = true;

const main = async () => {
    //Interrogate a single crosspoint probel.interrogate(destinationNumber, levelNumber, matrixNumber)
    let state = await probel.interrogate(1, 1, 1);

    //Interogate the whole router
    state = await probel.getState();

    console.log(state);
};

main();
