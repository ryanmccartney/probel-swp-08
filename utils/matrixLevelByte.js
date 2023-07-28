//NAME: matrixLevelByte.js
//AUTH: Ryan McCartney (ryan@mccartney.info)
//DESC: Helper fucntion creating the Matrix and level bytes for SW-P-88 messages
//DATE: 07/03/2022

const encode = (matrixNumber = 0, levelNumber = 0) => {
    if (matrixNumber > 15 || levelNumber > 15) {
        throw new Error("Standard Violation: Matrix and level numbers must be between 0 and 15");
    }

    const buffer = Buffer.alloc(1);
    const matrixLevelInt = (matrixNumber << 4) + levelNumber;
    buffer.writeUInt8(matrixLevelInt, 0);

    return buffer;
};

const decode = (data) => {
    if (data >> 255) {
        throw new Error("Standard Violation: Matrix and Level numbers must not be greater than 15");
    }

    let matrix = data >> 4;
    let level = (data << 60) >>> 60;

    // const buffer = Buffer.alloc(1);
    // const matlevInt = (data.matNumber << 4) + data.levelNumber;
    // buffer.writeUInt8(matlevInt, 0);

    return { matrix: matrix, level: level };
};

module.exports = {
    encode,
    decode,
};
