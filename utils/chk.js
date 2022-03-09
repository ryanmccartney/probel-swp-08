//NAME: chk.js
//AUTH: Ryan McCartney (rmccartney856@gmail.com)
//DESC: CHK - 1 Byte Checksum of DATA and BTC based on 2's compliment
//DATE: 07/03/2022

module.exports = (data) => {
    let sum = 0;
    const checksumBuffer = Buffer.alloc(1);
    for (let value of data.values()) {
        sum += value;
    }

    sum = sum % 128;
    checksum = ~parseInt(sum) + 1;
    checksumBuffer.writeInt8(checksum, 0);
    return checksumBuffer;
};
