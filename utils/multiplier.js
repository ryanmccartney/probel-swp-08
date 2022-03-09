//NAME: multiplier.js
//AUTH: Ryan McCartney (rmccartney856@gmail.com)
//DESC: Multiplier function as specied in the Probel SW-P-88 8.1.1
//DATE: 07/03/2022

const div = require("./div");

module.exports = (dstNumber, srcNumber = 0) => {
    const buffer = Buffer.alloc(1);
    buffer.writeUInt8((div(dstNumber, 128)[0] << 4) + div(srcNumber, 128)[0]);
    return buffer;
};
