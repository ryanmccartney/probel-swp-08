//NAME: message.js
//AUTH: Ryan McCartney (rmccartney856@gmail.com)
//DESC: Takes a command number and asscoicated data in a buffer as defined by SW-P-88 and converts it to a message
//DATE: 07/03/2022

const cmd = require("./cmd");
const btc = require("./btc");
const chk = require("./chk");
const constant = require("./constants");

// Forms the full message as expected by Probel SW-P-88 SOM-DATA-BTC-CHK-EOM
const pack = (data) => {
    const array = [constant.som(), data, btc(data), chk(Buffer.concat([data, btc(data)])), constant.eom()];
    const buffer = Buffer.concat(array);
    return buffer;
};

module.exports = (commandNumber, dataBytes) => {
    const cmdBytes = cmd(commandNumber);
    let dataBuffer = cmdBytes;
    if (dataBytes) {
        const array = [cmdBytes, dataBytes];
        dataBuffer = Buffer.concat(array);
    }
    return pack(dataBuffer);
};
