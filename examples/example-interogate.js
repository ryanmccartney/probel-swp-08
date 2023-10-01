const Probel = require("./../index");

const port = 8910;
const host = "172.26.108.80";
const levelTotal = 17;

//Example config object
const config = {
    port: port,
    extended: true,
    levels: levelTotal,
};

const probel = new Probel(config, { port: port });

//Turn on debug mode so we can see what's being sent and received in bytes
probel.debug = true;

const main = async () => {
    //Interrogate a single crosspoint probel.interrogate(destinationNumber, levelNumber, matrixNumber)
    //let state = await probel.interrogate(12, 1, 0);

    //Interogate the whole router
    state = await probel.getState();

    console.log(state);
};

main();
