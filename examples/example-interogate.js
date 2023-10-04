const Probel = require("./../index");

const port = 8910;
const host = "192.168.x.x";
const levelTotal = 17;

//Example config object
const config = {
    port: port,
    extended: true,
    levels: levelTotal,
};

const probel = new Probel(host, config);

//Turn on debug mode so we can see what's being sent and received in bytes
probel.debug = true;

const main = async () => {
    //Interrogate a single crosspoint probel.interrogate(destinationNumber, levelNumber, matrixNumber)
    let state = await probel.interrogate(12, 1, 0);
    console.log(state);

    //Interogate the whole router
    state = await probel.getState();
    console.log(state);
};

main();
