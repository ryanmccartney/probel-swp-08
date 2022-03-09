//NAME: div.js
//AUTH: Ryan McCartney (rmccartney856@gmail.com)
//DESC: x DIV y= the integer (z) which is produced when `x' is divided by `y' and the digits after the decimal point are discarded.
//DATE: 07/03/2022

module.exports = (x, y) => {
    const xInt = parseInt(x);
    const yInt = parseInt(y);
    const zInt = parseInt(xInt / yInt);
    const buffer = Buffer.alloc(1);
    buffer.writeUInt8(zInt, 0);
    return buffer;
};
