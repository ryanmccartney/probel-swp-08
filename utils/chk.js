//NAME: chk.js
//AUTH: Ryan McCartney (rmccartney856@gmail.com)
//DESC: CHK - 1 Byte Checksum of DATA and BTC based on 2's compliment
//DATE: 07/03/2022

module.exports = (data) => {
    let sum = 0;
    for (let value of data.values()) {
        sum += value;
    }
    // sum = sum % 128;
    //checksumBuffer.writeInt8(checksum, 0);

    const strHex = ((~sum + 1) >>> 0).toString(16);
    const checksumBuffer = Buffer.from(strHex, "hex");
    return checksumBuffer.slice(checksumBuffer.length - 1, checksumBuffer.length);
};
