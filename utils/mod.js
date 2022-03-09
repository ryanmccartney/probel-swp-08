//NAME: mod.js
//AUTH: Ryan McCartney (rmccartney856@gmail.com)
//DESC: x MOD y = the value (less than unity) which is left when `y' is multiplied by z and subtracted from `x'.
//DATE: 07/03/2022

module.exports = (x, y) => {
    const buffer = Buffer.alloc(1);
    buffer.writeUInt8(x % y, 0);
    return buffer;
};
