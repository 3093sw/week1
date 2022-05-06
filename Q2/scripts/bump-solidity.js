const fs = require("fs");
const solidityRegex = /pragma solidity \^\d+\.\d+\.\d+/

const verifierRegex = /contract Verifier/

let content = fs.readFileSync("./contracts/HelloWorldVerifier.sol", { encoding: 'utf-8' });
let bumped = content.replace(solidityRegex, 'pragma solidity ^0.8.0');
bumped = bumped.replace(verifierRegex, 'contract HelloWorldVerifier');

fs.writeFileSync("./contracts/HelloWorldVerifier.sol", bumped);

// [assignment] add your own scripts below to modify the other verifier contracts you will build during the assignment

let multiplier3_content = fs.readFileSync("./contracts/Multiplier3Verifier.sol", { encoding: 'utf-8' });
let multiplier3_bumped = multiplier3_content.replace(solidityRegex, 'pragma solidity ^0.8.0');
multiplier3_bumped = multiplier3_bumped.replace(verifierRegex, 'contract Multiplier3Verifier');

fs.writeFileSync("./contracts/Multiplier3Verifier.sol", multiplier3_bumped);


let _plonk_multiplier3_content = fs.readFileSync("./contracts/_plonkMultiplier3Verifier.sol", { encoding: 'utf-8' });
let _plonk_multiplier3_bumped = _plonk_multiplier3_content.replace(solidityRegex, 'pragma solidity ^0.8.0');
_plonk_multiplier3_bumped = _plonk_multiplier3_bumped.replace(verifierRegex, 'contract _plonkMultiplier3Verifier');

fs.writeFileSync("./contracts/_plonkMultiplier3Verifier.sol", _plonk_multiplier3_bumped);