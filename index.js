//NAME: index.js
//AUTH: Ryan McCartney (ryan@mccartney.info)
//DESC: Main class for the Probel SW-P-08 client
//DATE: 07/03/2022

const Net = require("net");
const { mod, div, chk, matrixLevelByte, multiplier, message, ackMessage, nakMessage } = require("./utils/utils");
const merge = require("./utils/merge");
const EventEmitter = require("events");

const charLengthLookup = [4, 8, 12, 16, 32];

const interrogateMessage = (destinationNumber, levelNumber = 0, matrixNumber = 0, extended = false) => {
    let commandNumber = 1;
    let array = [];

    if (extended) {
        commandNumber = 129;
        const destNumberDiv = div(destinationNumber, 256);
        const destNumberMod = mod(destinationNumber, 256);

        const levelByte = Buffer.alloc(1);
        levelByte.writeUInt8(levelNumber, 0);

        const matrixByte = Buffer.alloc(1);
        matrixByte.writeUInt8(matrixNumber, 0);

        array = [matrixByte, levelByte, destNumberDiv, destNumberMod];
    } else {
        const multiplierNumber = multiplier(destinationNumber, 0);
        const destNumber = mod(destinationNumber, 128);
        array = [matrixLevelByte.encode(matrixNumber, levelNumber), multiplierNumber, destNumber];
    }

    const data = Buffer.concat(array);
    return message(commandNumber, data);
};

const indexOfAll = (buffer, searchItem) => {
    let i = buffer.indexOf(searchItem, 0, "hex");
    const indexes = [];

    while (i !== -1) {
        indexes.push(i);
        i = i + 2;
        i = buffer.indexOf(searchItem, i, "hex");
    }
    return indexes;
};

const getMessages = (data) => {
    const messages = [];
    const somIndexes = indexOfAll(data, "1002");
    const eomIndexed = indexOfAll(data, "1003");

    for (let i in somIndexes) {
        //console.log(data.slice(somIndexes[i] + 2, eomIndexed[i]).toString("hex"));
        messages.push(data.slice(somIndexes[i] + 2, eomIndexed[i]));
    }
    return messages;
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

const sourceNamesRequest = (extended = false, matrix = 0, level = 0, chars = 12) => {
    let commandNumber = 100;
    let array = [];

    const charLengthByte = Buffer.alloc(1);
    charLengthByte.writeUInt8(charLengthLookup.indexOf(chars, 0), 0);

    if (extended) {
        commandNumber = 228;

        const matrixByte = Buffer.alloc(1);
        matrixByte.writeUInt8(matrix, 0);

        const levelByte = Buffer.alloc(1);
        levelByte.writeUInt8(level, 0);

        array = [matrixByte, levelByte, charLengthByte];
    } else {
        array = [charLengthByte];
    }

    const data = Buffer.concat(array);

    return message(commandNumber, data);
};

const bufferClean = (data) => {
    let previousByte;
    const cleanedData = [];
    for (let byte of data.entries()) {
        if (byte[1] === 16 && previousByte === 16) {
            previousByte = 0;
        } else {
            cleanedData.push(data.slice(byte[0], byte[0] + 1));
            previousByte = byte[1];
        }
    }
    return Buffer.concat(cleanedData);
};

const umdLabelRequest = () => {
    const commandNumber = 104;
    return message(commandNumber);
};

const destinationNamesRequest = (extended = false, matrix = 0, chars = 8) => {
    let commandNumber = 102;
    let array = [];

    const charLengthByte = Buffer.alloc(1);
    charLengthByte.writeUInt8(charLengthLookup.indexOf(chars, 0), 0);

    if (extended) {
        commandNumber = 230;

        const matrixByte = Buffer.alloc(1);
        matrixByte.writeUInt8(matrix, 0);

        array = [matrixByte, charLengthByte];
    } else {
        array = [charLengthByte];
    }

    const data = Buffer.concat(array);

    return message(commandNumber, data);
};

const tallyStateRequest = (level = 0, matrix = 0, extended = false) => {
    let commandNumber = 21;
    let array = [];
    if (extended) {
        commandNumber = 149;
        const matrixByte = Buffer.alloc(1);
        matrixByte.writeUInt8(matrix, 0);

        const levelByte = Buffer.alloc(1);
        levelByte.writeUInt8(level, 0);

        array = [matrixByte, levelByte];
    } else {
        array = [matrixLevelByte.encode(matrix, level)];
    }

    return message(commandNumber, Buffer.concat(array));
};

const isAck = (response) => {
    if (!Buffer.compare(response, ackMessage())) {
        return true;
    }
    if (!Buffer.compare(response, nakMessage())) {
        return false;
    }
};

module.exports = class Probel {
    constructor(host, config) {
        this.debug = false;
        this.extended = config?.extended || true;
        this.connected = false;
        this.host = host;
        this.port = config.port || 8910;
        this.sources = config?.sources || 0;
        this.destinations = config?.destinations || 0;
        this.levels = config?.levels || 17;
        this.matrix = config?.matrix || 1;
        this.chars = config?.chars || 8;
        this.client;
        this.tallies = {};
        this.sourceNames = {};
        this.destinationNames = {};
        this.umdLabels = {};
        this.callback = {};
        this.connect();
        this.events = new EventEmitter();

        if (this.levels > 16 || this.sources > 1024 || this.destinations > 1024) {
            this.log("Probel: using extended commands");
            this.extended = true;
        }
    }

    log = (message) => {
        if (this.debug) {
            console.log(message);
        }
    };

    waitForCommand = (commandNumbers, timeout = 10000) => {
        return new Promise((resolve, reject) => {
            // Set up the timeout
            const timer = setTimeout(() => {
                resolve({
                    status: false,
                    message: `Command timed out after ${timeout}ms.`,
                    timeout: timeout,
                    commandNumber: commandNumbers,
                });
            }, timeout);

            if (typeof commandNumbers === "string") [(commandNumbers = [commandNumbers])];

            for (let commandNumber of commandNumbers) {
                this.events.on(commandNumber, (data) => {
                    try {
                        if (data) {
                            //this.log(`Command number ${commandNumber} triggered`);
                            clearTimeout(timer);
                            resolve(data);
                        }
                    } catch (error) {
                        clearTimeout(timer);
                        resolve({
                            status: false,
                            message: `An error has occured.`,
                            error: error,
                            commandNumber: commandNumber,
                        });
                    }
                });
            }
        });
    };

    waitForConnection = (timeout = 5000) => {
        return new Promise((resolve, reject) => {
            if (this.connected == true) {
                resolve(true);
            }
            // Set up the timeout
            const timer = setTimeout(() => {
                resolve(false);
            }, timeout);

            this.events.on("connection", (data = true) => {
                clearTimeout(timer);
                resolve(data);
            });
        });
    };

    connect = () => {
        this.client = new Net.Socket();

        this.client.connect({ port: this.port, host: this.host }, () => {
            this.log("Connection established with the Probel SW-P-08 server.");
            this.connected = true;
            this.events.emit("connection", true);
        });

        this.client.on("data", this.handleData);

        this.client.on("end", function () {
            this.connected = false;
            this.events.emit("connection", false);
            this.log("Connection closed");
        });
    };

    send = async (message) => {
        // Log bytes sent to router when in debug mode
        const connected = await this.waitForConnection();
        if (connected) {
            this.log(`Tx (${message.length}): ${message.toString("hex")}`);
            this.client.write(message);
        } else {
            this.log("Connection to the matrix timed out.");
        }
    };

    handleData = (reply) => {
        // Log bytes recieved from the router when in debug mode
        this.log(`Rx (${reply.length}): ${reply.toString("hex")}`);

        this.log(reply.toString());

        if (isAck(reply)) {
        } else {
            const messages = getMessages(reply);
            for (let message of messages) {
                this.processData(message);
            }
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
            const nameBytes = namesBytes.slice(i * charLength, i * charLength + charLength);
            const name = nameBytes.toString().trim();
            if (name) {
                names[startIndex + i] = name;
            }
        }

        return names;
    };

    parseNamesExt = (data, sourceNames = false) => {
        //Packing for Extended Destinations
        let matrixNumber = data[0];
        let levelNumber = 0;
        let charLength = charLengthLookup[data[1]];
        let startIndex = 256 * data[2] + data[3] + 1;
        let nameCount = data[4];
        let startPosition = 5;

        //Packing for Extended Destinations
        if (sourceNames) {
            levelNumber = data[1];
            charLength = charLengthLookup[data[2]];
            startIndex = 256 * data[3] + data[4] + 1;
            nameCount = data[5];
            startPosition = 6;
        }

        const names = {};
        let namesBytes = data.slice(startPosition, Buffer.byteLength(data));

        for (let i = 0; i < nameCount; i++) {
            const sliceIndex = i * charLength;
            const nameBytes = namesBytes.slice(sliceIndex, sliceIndex + charLength);
            const name = nameBytes.toString().trim();
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

    parseTallyExt = (data) => {
        const matrixNumber = data[0];
        const levelNumber = data[1];

        //Create Object Structure
        const tallies = {};
        tallies[matrixNumber] = {};
        tallies[matrixNumber][levelNumber] = {};

        const destination = data[2] * 256 + data[3];
        const source = data[4] * 256 + data[5];

        tallies[matrixNumber][levelNumber][destination] = source;

        return tallies;
    };

    parseTalliesExt = (data) => {
        const matrixNumber = data[0];
        const levelNumber = data[1] + 1;
        const sourceBytes = data.slice(5, Buffer.byteLength(data));

        //Create Object Structure
        const tallies = {};
        tallies[matrixNumber] = {};
        tallies[matrixNumber][levelNumber] = {};

        const tallyCount = data[2];
        const startDestination = 256 * data[3] + data[4] + 1;

        //Populte with tally data
        for (let i = 0; i < tallyCount; i++) {
            const tally = sourceBytes.slice(i * 2, i * 2 + 2);
            const source = tally[0] * 256 + tally[1];
            const destination = startDestination + i;
            tallies[matrixNumber][levelNumber][destination] = source;
        }
        return tallies;
    };

    on = (event = "crosspoint", callback) => {
        if (callback) {
            if (event === "crosspoint") {
                this.callback[event] = callback;
            }
        }
    };

    processData = (data) => {
        if (data.length > 0) {
            let response;
            data = bufferClean(data);
            const commandNumber = data.readUInt8(0);
            const dataBytes = data.slice(1, Buffer.byteLength(data) - 2);
            const btc = data[Buffer.byteLength(data) - 2];
            const chkInt = data[Buffer.byteLength(data) - 1];
            const chkCalculated = chk(data.slice(0, Buffer.byteLength(data) - 1));

            // if (chkInt !== chkCalculated.readUInt8(0)) {
            //     this.log("Checksum invalid");
            //     return false;
            // }

            // if (btc !== Buffer.byteLength(dataBytes) + 1) {
            //     this.log("Byte Count doesn't match message contents.");
            //     return false;
            // }

            switch (commandNumber) {
                case 106:
                    //Handle Source Names Response (4-32 chars per name)
                    const newSourceNames = this.parseNames(dataBytes);
                    if (newSourceNames) {
                        response = { ...this.sourceNames, ...newSourceNames };
                        this.sourceNames = response;
                    }

                    if (parseInt(Object.keys(newSourceNames)[Object.keys(newSourceNames).length - 1]) < this.sources) {
                        response = false;
                    } else {
                        response = this.sourceNames;
                    }

                    break;
                case 234:
                    //Handle Source Names Response (4-32 chars per name)
                    const newSourceNamesExt = this.parseNamesExt(dataBytes, true);
                    if (newSourceNamesExt) {
                        response = { ...this.sourceNames, ...newSourceNamesExt };
                        this.sourceNames = response;
                    }

                    if (
                        parseInt(Object.keys(newSourceNamesExt)[Object.keys(newSourceNamesExt).length - 1]) <
                            this.sources &&
                        this.sources !== 0
                    ) {
                        response = false;
                    } else {
                        response = this.sourceNames;
                    }

                    break;
                case 108:
                case 236:
                    //Handle Source Names UMD Response (16 chars per name)
                    const newUmdLabels = this.parseNames(dataBytes);
                    if (newUmdLabels) {
                        response = { ...this.umdLabels, ...newUmdLabels };
                        this.umdLabels = response;
                    }
                    break;
                case 107:
                    //Handle Destination Names Response (4-32 chars per name)
                    const newDestinationNames = this.parseNames(dataBytes);
                    if (newDestinationNames) {
                        response = merge(this.destinationNames, newDestinationNames);
                        this.destinationNames = response;
                    }

                    if (
                        parseInt(Object.keys(newDestinationNames)[Object.keys(newDestinationNames).length - 1]) <
                        this.destinations
                    ) {
                        response = false;
                    } else {
                        response = this.destinationNames;
                    }
                    break;
                case 235:
                    //Handle Destination Names Response (4-32 chars per name)
                    const newDestinationNamesExt = this.parseNamesExt(dataBytes);
                    if (newDestinationNamesExt) {
                        response = merge(this.destinationNames, newDestinationNamesExt);
                        this.destinationNames = response;
                    }

                    if (
                        parseInt(Object.keys(newDestinationNamesExt)[Object.keys(newDestinationNamesExt).length - 1]) <
                        this.destinations
                    ) {
                        response = false;
                    } else {
                        response = this.destinationNames;
                    }
                    break;
                case 22:
                case 23:
                    const newTallies = this.parseTallies(dataBytes);
                    if (newTallies) {
                        response = merge(this.tallies, newTallies);
                        this.tallies = response;

                        const tallyMatrix = Object.keys(newTallies)[0];
                        const tallyLevel = Object.keys(newTallies[tallyMatrix])[0];

                        if (
                            parseInt(
                                Object.keys(newTallies[tallyMatrix][tallyLevel])[
                                    Object.keys(newTallies[tallyMatrix][tallyLevel]).length - 1
                                ]
                            ) < this.destinations ||
                            tallyLevel < this.levels - 1
                        ) {
                            response = false;
                        }
                    }

                    break;
                case 3:
                case 4:
                    //Handle Tally Information
                    const newTally = this.parseTallies(dataBytes);
                    if (newTally) {
                        response = merge(this.tallies, newTally);
                        this.tallies = response;
                    }
                    break;
                case 131:
                    //Handle Tally Information for Single Extended Destination
                    const newTallyExt = this.parseTallyExt(dataBytes);
                    if (newTallyExt) {
                        this.tallies = merge(this.tallies, newTallyExt);
                        response = newTallyExt;
                    }
                    break;
                case 151:
                    //Handle Tally Dump Information Extended
                    const newTalliesExt = this.parseTalliesExt(dataBytes);
                    if (newTalliesExt) {
                        response = merge(this.tallies, newTalliesExt);
                        this.tallies = response;

                        const tallyMatrix = Object.keys(newTalliesExt)[0];
                        const tallyLevel = Object.keys(newTalliesExt[tallyMatrix])[0];

                        if (
                            parseInt(
                                Object.keys(newTalliesExt[tallyMatrix][tallyLevel])[
                                    Object.keys(newTalliesExt[tallyMatrix][tallyLevel]).length - 1
                                ]
                            ) < this.destinations ||
                            tallyLevel < this.levels - 1
                        ) {
                            response = false;
                        }
                    }
                    break;
                case 132:
                    //Handle Crosspoint Response
                    this.log("Extended Crosspoint Made");
                    response = true;
                    break;
            }
            this.events.emit(commandNumber, response);
        }
    };

    //Interrogate a single crosspoint (destinationNumber, levelNumber, matrixNumber)
    interrogate = async (destinationNumber, levelNumber, matrixNumber) => {
        let buffer;
        if (this.extended) {
            buffer = interrogateMessage(destinationNumber, levelNumber, matrixNumber, true);
        } else {
            buffer = interrogateMessage(destinationNumber, levelNumber, matrixNumber);
        }
        this.send(buffer);
        return await this.waitForCommand(["3", "131"]);
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
    routeAllLevels = async (srcNumber, destNumber) => {
        for (let level = 1; level <= this.levels; level++) {
            this.route(level, srcNumber, destNumber);
            return await this.waitForCommand(["3", "4"]);
        }
    };

    getSourceNames = async () => {
        const buffer = sourceNamesRequest(this.extended, this.matrix - 1, 0, this.chars);
        this.send(buffer);
        return await this.waitForCommand(["106", "234"]);
    };

    getDestinationNames = async () => {
        const buffer = destinationNamesRequest(this.extended, this.matrix - 1, this.chars);
        this.send(buffer);
        return await this.waitForCommand(["107", "235"]);
    };

    getUmdLabels = async () => {
        const buffer = umdLabelRequest();
        this.send(buffer);
        return await this.waitForCommand(["108", "236"]);
    };

    getState = async () => {
        for (let level = 0; level < this.levels; level++) {
            const buffer = tallyStateRequest(level, this.matrix - 1, this.extended);
            this.send(buffer);
        }
        return await this.waitForCommand(["22", "23", "151"]);
    };
};
