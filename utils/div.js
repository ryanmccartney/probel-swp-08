//NAME: div.js
//AUTH: Ryan McCartney (ryan@mccartney.info)
//DESC: x DIV y= the integer (z) which is produced when `x' is divided by `y' and the digits after the decimal point are discarded.
//DATE: 07/03/2022

module.exports = (x, y) => {
    const xInt = Math.floor(x);
    const yInt = Math.floor(y);
    const zInt = Math.floor(xInt / yInt);
    const buffer = Buffer.alloc(1);
    buffer.writeUInt8(zInt, 0);
    return buffer;
};
