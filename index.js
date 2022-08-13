//NAME: index.js
//AUTH: Ryan McCartney (rmccartney856@gmail.com)
//DESC: Main class for the Probel SW-P-88 client
//DATE: 07/03/2022

const Net = require("net");
const { mod, div, chk, matrixLevelByte, multiplier, message, ackMessage, nakMessage } = require("./utils/utils");
const merge = require("./utils/merge");

const charLengthLookup = [4, 8, 12];

const interrogateMessage = (destinationNumber, sourceNumber, levelNumber) => {
    const commandNumber = 1;
    const multiplierNumber = multiplier(destinationNumber, sourceNumber);
    const destNumber = mod(destinationNumber, 128);

    const array = [matrixLevelByte.encode(0, levelNumber), multiplierNumber, destNumber];
    const data = Buffer.concat(array);
    return message(commandNumber, data);
};

const crosspointMessage = (levelNumber, sourceNumber, destinationNumber, matrixNumber = 0) => {
    const commandNumber = 2;
    const multiplierNumber = multiplier(destinationNumber, sourceNumber);

    const destNumber = mod(destinationNumber, 128);
    const srcNumber = mod(sourceNumber, 128);

    const array = [matrixLevelByte.encode(matrixNumber, levelNumber), multiplierNumber, destNumber, srcNumber];
    const data = Buffer.concat(array);
    return message(commandNumber, data);
};

const crosspointMessageExtended = (levelNumber, sourceNumber, destinationNumber, matrixNumber = 0) => {
    const commandNumber = 130;

    const levelByte = Buffer.alloc(1);
    levelByte.writeUInt8(levelNumber, 0);

    const matrixByte = Buffer.alloc(1);
    matrixByte.writeUInt8(matrixNumber, 0);

    const destNumberMod = mod(destinationNumber, 256);
    const srcNumberMod = mod(sourceNumber, 256);

    const destNumberDiv = div(destinationNumber, 256);
    const srcNumberDiv = div(sourceNumber, 256);

    const array = [matrixByte, levelByte, destNumberDiv, destNumberMod, srcNumberDiv, srcNumberMod];
    const data = Buffer.concat(array);
    return message(commandNumber, data, true);
};

const sourceNamesRequest = (extended = false, matrix = 0, chars = 8) => {
    let commandNumber = 100;
    let array = [];

    const charBytes = Buffer.alloc(1);
    charBytes.writeUInt8(chars, 0);

    if (extended) {
        commandNumber = 228;

        const matrixByte = Buffer.alloc(1);
        matrixByte.writeUInt8(matrix, 0);

        array = [matrixByte, Buffer.alloc(1), charBytes];
    } else {
        array = [charBytes];
    }

    const data = Buffer.concat(array);

    return message(commandNumber, data);
};

const umdLabelRequest = () => {
    const commandNumber = 104;
    return message(commandNumber);
};

const destinationNamesRequest = (extended = false, matrix = 0, chars = 8) => {
    let commandNumber = 102;
    let array = [];

    const charBytes = Buffer.alloc(1);
    charBytes.writeUInt8(chars, 0);

    if (extended) {
        commandNumber = 230;

        const matrixByte = Buffer.alloc(1);
        matrixByte.writeUInt8(matrix, 0);

        array = [matrixByte, charBytes];
    } else {
        array = [charBytes];
    }

    const data = Buffer.concat(array);

    return message(commandNumber, data);
};

const tallyStateRequest = (level = 0, matrix = 0) => {
    let commandNumber = 21;
    if (this.extended) {
        commandNumber = 149;
    }
    return message(commandNumber, matrixLevelByte.encode(matrix, level));
};

const isAck = (response) => {
    if (!Buffer.compare(response, ackMessage())) {
        console.log("Message Acknowledged");
        return true;
    }
    if (!Buffer.compare(response, nakMessage())) {
        console.log("Message Not Acknowledged");
        return false;
    }
};

module.exports = class Probel {
    constructor(host, port, sources = 0, destinations = 0, levels = 17, matrix = 1, chars = 8) {
        this.debug = false;
        this.extended = false;
        this.host = host;
        this.port = port;
        this.sources = sources;
        this.destinations = destinations;
        this.levels = levels;
        this.matrix = matrix;
        this.chars = chars;
        this.client;
        this.tallies = {};
        this.sourceNames = {};
        this.destinationNames = {};
        this.umdLabels = {};
        this.connect();

        if (levels > 16 || sources > 1024 || destinations > 1024) {
            console.log("Probel: using extended commands");
            this.extended = true;
        }
    }

    log = (message) => {
        if (this.debug) {
            console.log(message);
        }
    };

    connect = () => {
        this.client = new Net.Socket();

        this.client.connect({ port: this.port, host: this.host }, () => {
            console.log("Connection established with the Probel SW-P-88 server.");
        });

        this.client.on("data", this.handleData);

        this.client.on("end", function () {
            console.log("Connection closed");
        });
    };

    send = (message) => {
        // Log bytes sent to router when in debug mode
        this.log(`Tx (${message.length}): ${message.toString("hex")}`);
        this.client.write(message);
    };

    handleData = (reply) => {
        // Log bytes recieved from the router when in debug mode
        this.log(`Rx (${reply.length}): ${reply.toString("hex")}`);

        if (isAck(reply)) {
        } else {
            const slice = reply.slice(2, Buffer.byteLength(reply) - 2);
            this.processData(slice);
        }
        this.send(ackMessage());
    };

    parseNames = (data) => {
        const matrixInfo = matrixLevelByte.decode(data[0]);
        const charLength = charLengthLookup[data[1]];
        const startIndex = 256 * data[2] + data[3] + 1;
        const nameCount = data[4];

        const names = {};

        //Some unexplained changing of bit positions based on the number of labels in  a message
        let startPosition = 6;
        if (nameCount < 16 || startIndex === 0) {
            startPosition = 5;
        }

        let namesBytes = data.slice(startPosition, Buffer.byteLength(data));

        for (let i = 0; i < nameCount; i++) {
            const nameBytes = namesBytes.slice(i * 8, i * 8 + 8);
            const name = nameBytes.toString();
            if (name) {
                names[startIndex + i] = name;
            }
        }
        return names;
    };

    parseNamesExt = (data) => {
        const matrixInfo = matrixLevelByte.decode(data[0]);
        const charLength = charLengthLookup[data[1]];
        const startIndex = 256 * data[2] + data[3] + 1;
        const nameCount = data[4];

        const names = {};

        //Some unexplained changing of bit positions based on the number of labels in  a message
        let startPosition = 6;
        if (nameCount < 16 || startIndex === 0) {
            startPosition = 5;
        }

        let namesBytes = data.slice(startPosition, Buffer.byteLength(data));

        for (let i = 0; i < nameCount; i++) {
            const nameBytes = namesBytes.slice(i * 8, i * 8 + 8);
            const name = nameBytes.toString();
            if (name) {
                names[startIndex + i] = name;
            }
        }
        return names;
    };

    parseTally = (data) => {
        const matrixInfo = matrixLevelByte.decode(data[0]);
        const tallyCount = data[1];

        const sourceBytes = data[3];
        const destinationBytes = data[4];

        //Create Object Structure
        const tallies = {};
        tallies[matrixInfo.matrix] = {};
        tallies[matrixInfo.matrix][matrixInfo.level] = {};

        const source = div(sourceBytes, 128).readUInt8(0);
        const destination = div(destinationBytes, 128).readUInt8(0);

        //Populte with tally data
        tallies[matrixInfo.matrix][matrixInfo.level][destination] = source;

        console.log(tallies);

        return tallies;
    };

    parseTallies = (data) => {
        const matrixInfo = matrixLevelByte.decode(data[0]);
        const tallyCount = data[1];

        const sourceBytes = data.slice(4, Buffer.byteLength(data));
        const startDestination = 256 * data[2] + data[3] + 1;

        //Create Object Structure
        const tallies = {};
        tallies[matrixInfo.matrix] = {};
        tallies[matrixInfo.matrix][matrixInfo.level] = {};

        //Populte with tally data
        for (let i = 0; i < tallyCount; i++) {
            const tally = sourceBytes.slice(i * 2, i * 2 + 2);
            const source = tally[0] * 256 + tally[1];
            const destination = startDestination + i;
            tallies[matrixInfo.matrix][matrixInfo.level][destination] = source;
        }
        return tallies;
    };

    processData = (data) => {
        const commandNumber = data.readUInt8(0);
        const dataBytes = data.slice(1, Buffer.byteLength(data) - 2);
        const btc = data[Buffer.byteLength(data) - 2];
        const chkInt = data[Buffer.byteLength(data) - 1];
        const chkCalculated = chk(data.slice(0, Buffer.byteLength(data) - 1));

        if (chkInt !== chkCalculated.readUInt8(0)) {
            console.log("Checksum invalid");
            return false;
        }

        if (btc !== Buffer.byteLength(dataBytes) + 1) {
            console.log("Byte Count doesn't match message contents.");
            return false;
        }

        switch (commandNumber) {
            case 106:
                //Handle Source Names Response (8 chars per name)
                this.sourceNames = { ...this.sourceNames, ...this.parseNames(dataBytes) };
                break;
            case 234:
                //Handle Source Names Response (8 chars per name)
                this.sourceNames = { ...this.sourceNames, ...this.parseNamesExt(dataBytes) };
                break;

            case 108:
            case 236:
                //Handle Source Names UMD Response (16 chars per name)
                this.umdLabels = { ...this.umdLabels, ...this.parseNames(dataBytes) };
                break;
            case 107:
            case 235:
                //Handle Destination Names Response (8 chars per name)
                this.destinationNames = merge(this.destinationNames, this.parseNames(dataBytes));
                break;
            case 23:
            case 151:
                //Handle Tally Dump Response
                this.tallies = merge(this.tallies, this.parseTallies(dataBytes));
                console.log(this.tallies);
                break;
            case 3:
            case 4:
                //Handle Tally Information
                this.tallies = merge(this.tallies, this.parseTally(dataBytes));
            case 131:
            case 132:
                //Handle Crosspoint Response
                console.log("Extended Crosspoint Made");
                console.log(dataBytes);
                break;
        }
    };

    interrogate = (destinationNumber, sourceNumber, levelNumber) => {
        const buffer = interrogateMessage(destinationNumber, sourceNumber, levelNumber);
        this.send(buffer);
    };

    //Route a source to a destination at a specified level only (1 to 17)
    route = (levelNumber, srcNumber, destNumber) => {
        let buffer;
        if (this.extended) {
            buffer = crosspointMessageExtended(levelNumber - 1, srcNumber - 1, destNumber - 1, this.matrix - 1);
        } else {
            buffer = crosspointMessage(levelNumber - 1, srcNumber - 1, destNumber - 1, this.matrix - 1);
        }
        this.send(buffer);
    };

    //Route all the levels from a given source to a given destination (1 to 17)
    routeAllLevels = (srcNumber, destNumber) => {
        for (let level = 1; level <= this.levels; level++) {
            this.route(level, srcNumber, destNumber);
        }
    };

    getSourceNames = () => {
        const buffer = sourceNamesRequest(this.extended, this.matrix - 1, this.chars);
        this.send(buffer);
    };

    getDestinationNames = () => {
        const buffer = destinationNamesRequest(this.extended, this.matrix - 1, this.chars);
        this.send(buffer);
    };

    getUmdLabels = () => {
        const buffer = umdLabelRequest();
        this.send(buffer);
    };

    getState = () => {
        for (let level = 0; level < this.levels; level++) {
            const buffer = tallyStateRequest(level);
            this.send(buffer);
        }
    };
};
