//NAME: btc.js
//AUTH: Ryan McCartney (ryan@mccartney.info)
//DESC: BTC - Byte Count for the data section of the message
//DATE: 07/03/2022

module.exports = (data) => {
    const length = Buffer.byteLength(data);
    const buffer = Buffer.alloc(1);
    buffer.writeUInt8(length, 0);
    return buffer;
};
