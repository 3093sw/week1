#!/bin/bash

# [assignment] create your own bash script to compile Multipler3.circom using PLONK below

cd contracts/circuits

mkdir _plonkMultiplier3

if [ -f ./powersOfTau28_hez_final_10.ptau ]; then
    echo "powersOfTau28_hez_final_10.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_10.ptau'
    curl https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau -o powersOfTau28_hez_final_10.ptau
fi

# compile circuit
echo "compiling _plonkMultiplier3 into folder"
circom Multiplier3.circom --r1cs --wasm --sym -o _plonkMultiplier3

# Start a new zkey and export verification json
snarkjs plonk setup _plonkMultiplier3/Multiplier3.r1cs powersOfTau28_hez_final_10.ptau _plonkMultiplier3/circuit_final.zkey
snarkjs zkey export verificationkey _plonkMultiplier3/circuit_final.zkey _plonkMultiplier3/verification_key.json

# generate solidity contract
snarkjs zkey export solidityverifier _plonkMultiplier3/circuit_final.zkey ../_plonkMultiplier3Verifier.sol


cd ../..