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
    const packed = [];

    //GTOCHA - Replace byte value 10 (DLE) in data with 1010
    for (let byte of data.entries()) {
        packed.push(data.slice(byte[0], byte[0] + 1));
        if (byte[1] === 16) {
            packed.push(Buffer.from("10", "hex"));
        }
    }

    const packedData = Buffer.concat(packed);
    array[1] = packedData;

    const buffer = Buffer.concat(array);
    return buffer;
};

module.exports = (commandNumber, dataBytes, extended = false) => {
    const cmdBytes = cmd(commandNumber);
    let dataBuffer = cmdBytes;
    if (dataBytes) {
        const array = [cmdBytes, dataBytes];
        if (extended) {
            const array = [cmdBytes, dataBytes];
        }
        dataBuffer = Buffer.concat(array);
    }
    return pack(dataBuffer);
};
