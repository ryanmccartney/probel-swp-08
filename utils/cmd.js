//NAME: cmd.js
//AUTH: Ryan McCartney (ryan@mccartney.info)
//DESC: Takes a command number for SW-P-88 as an int and converts it to a 1-byte buffer
//DATE: 07/03/2022

module.exports = (commandNumber) => {
    const buffer = Buffer.alloc(1);
    buffer.writeUInt8(commandNumber, 0);
    return buffer;
};
