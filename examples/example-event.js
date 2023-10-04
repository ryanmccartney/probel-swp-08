const Probel = require("../index");

const port = 8910;
const host = "192.168.x.x";

const probel = new Probel(host, { port: port });

//Turn on debug mode so we can see what's being sent and received in bytes
probel.debug = true;

const callback = (data) => {
    console.log("Some routing has happened");
    console.log(data);
};

const main = async () => {
    //Add a function that triggers whenver new crosspoint information is received from the router.
    state = await probel.on("crosspoint", callback);
};

main();
