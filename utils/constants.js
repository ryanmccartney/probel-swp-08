//NAME: constants.js
//AUTH: Ryan McCartney (rmccartney856@gmail.com)
//DESC: Constants for the Probel SW-P-88
//DATE: 07/03/2022

//Constant Bytes for Packing
const dle = Buffer.from("10", "hex");
const stx = Buffer.from("02", "hex");
const etx = Buffer.from("03", "hex");
const ack = Buffer.from("06", "hex");
const nak = Buffer.from("15", "hex");

// SOM - Start of Message for Probel SW-P-88
const som = () => {
    const array = [dle, stx];
    const buffer = Buffer.concat(array);
    return buffer;
};

// EOM - End of Message for Probel SW-P-88
const eom = () => {
    const array = [dle, etx];
    const buffer = Buffer.concat(array);
    return buffer;
};

// ACK - Acknowledge for Probel SW-P-88 message
const ackMessage = () => {
    const array = [dle, ack];
    const buffer = Buffer.concat(array);
    return buffer;
};

// NAK -  Non Acknowledge for Probel SW-P-88 messages
const nakMessage = () => {
    const array = [dle, nak];
    const buffer = Buffer.concat(array);
    return buffer;
};

module.exports = {
    ackMessage,
    nakMessage,
    som,
    eom,
};
