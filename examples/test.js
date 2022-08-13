// const sourceN = 10;
// const destN = 10;

const padLeft = (nr, n, str) => {
    return Array(n - String(nr).length + 1).join(str || "0") + nr;
};
// const sourceDIV = padLeft(Math.floor((sourceN - 1) / 256).toString(16), 2);
// const destMOD = padLeft(((destN - 1) % 256).toString(16), 2);

// console.log(`${sourceDIV} ${destMOD}`);

// const checksum8 = (N) => {
//     // convert input value to upper case
//     strN = new String(N);
//     strN = strN.toUpperCase();

//     strHex = new String("0123456789ABCDEF");
//     result = 0;
//     fctr = 16;

//     for (i = 0; i < strN.length; i++) {
//         if (strN.charAt(i) == " ") continue;

//         v = strHex.indexOf(strN.charAt(i));
//         if (v < 0) {
//             result = -1;
//             break;
//         }

//         result += v * fctr;

//         if (fctr == 16) fctr = 1;
//         else fctr = 16;
//     }

//     // Calculate 2's complement
//     result = (~(result & 0xff) + 1) & 0xff;

//     // Convert result to string
//     strResult = strHex.charAt(Math.floor(result / 16)) + strHex.charAt(result % 16);

//     // console.log('checksum: ' + strResult)
//     return strResult;
// };

// console.log(checksum8("82" + "00" + "10" + sourceDIV + destMOD + sourceDIV + destMOD + "07"));

const levelN = 17;
const level = padLeft((levelN - 1).toString(16), 2);
console.log(level);
