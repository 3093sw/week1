const { expect } = require('chai')
const { ethers } = require('hardhat')
const fs = require('fs')
const { groth16, plonk } = require('snarkjs')

function unstringifyBigInts(o) {
  if (typeof o == 'string' && /^[0-9]+$/.test(o)) {
    return BigInt(o)
  } else if (typeof o == 'string' && /^0x[0-9a-fA-F]+$/.test(o)) {
    return BigInt(o)
  } else if (Array.isArray(o)) {
    return o.map(unstringifyBigInts)
  } else if (typeof o == 'object') {
    if (o === null) return null
    const res = {}
    const keys = Object.keys(o)
    keys.forEach((k) => {
      res[k] = unstringifyBigInts(o[k])
    })
    return res
  } else {
    return o
  }
}

describe('HelloWorld', function () {
  let Verifier
  let verifier

  beforeEach(async function () {
    Verifier = await ethers.getContractFactory('HelloWorldVerifier')
    verifier = await Verifier.deploy()
    await verifier.deployed()
  })

  it('Should return true for correct proof', async function () {
    //[assignment] Add comments to explain what each line is doing
    const { proof, publicSignals } = await groth16.fullProve(
      { a: '1', b: '2' },
      'contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm',
      'contracts/circuits/HelloWorld/circuit_final.zkey',
    ) //proving the inputs using the verification key- zkey

    console.log('1x2 =', publicSignals[0]) //logging from the console for user reference

    const editedPublicSignals = unstringifyBigInts(publicSignals) //returns a big int from string
    const editedProof = unstringifyBigInts(proof) //returns big int from string
    const calldata = await groth16.exportSolidityCallData(
      editedProof,
      editedPublicSignals,
    ) //getting the call parameters for the smart contract

    const argv = calldata
      .replace(/["[\]\s]/g, '')
      .split(',')
      .map((x) => BigInt(x).toString()) //sorting the arguments

    const a = [argv[0], argv[1]] //this sorts the arguments to match the format specified in the smart contract
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ] //this sorts the arguments to match the format specified in the smart contract
    const c = [argv[6], argv[7]] //this sorts the arguments to match the format specified in the smart contract
    const Input = argv.slice(8) //this sorts the arguments to match the format specified in the smart contract

    expect(await verifier.verifyProof(a, b, c, Input)).to.be.true //verifying the input frmo the smart contract
  })
  it('Should return false for invalid proof', async function () {
    let a = [0, 0] // invalid inputs
    let b = [
      [0, 0],
      [0, 0],
    ]  // invalid inputs
    let c = [0, 0]  // invalid inputs
    let d = [0]  // invalid inputs
    expect(await verifier.verifyProof(a, b, c, d)).to.be.false // we try to verify an invalid proof 
  })
})

describe('Multiplier3 with Groth16', function () {
  beforeEach(async function () {
    Verifier = await ethers.getContractFactory('Multiplier3Verifier')
    verifier = await Verifier.deploy()
    await verifier.deployed()
  })

  it('Should return true for correct proof', async function () {
    const { proof, publicSignals } = await groth16.fullProve(
      { a: '1', b: '2', c: '3' },
      'contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm',
      'contracts/circuits/Multiplier3/circuit_final.zkey',
    )

    console.log('1x2x3=', publicSignals[0])

    const editedPublicSignals = unstringifyBigInts(publicSignals)
    const editedProof = unstringifyBigInts(proof)
    const calldata = await groth16.exportSolidityCallData(
      editedProof,
      editedPublicSignals,
    )

    const argv = calldata
      .replace(/["[\]\s]/g, '')
      .split(',')
      .map((x) => BigInt(x).toString())

    const a = [argv[0], argv[1]]
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ]
    const c = [argv[6], argv[7]]

    const Input = argv.slice(8)
    expect(await verifier.verifyProof(a, b, c, Input)).to.be.true
  })
  it('Should return false for invalid proof', async function () {
    let a = [0, 0]
    let b = [
      [0, 0],
      [0, 0],
    ]
    let c = [0, 0]
    let d = [0]
    expect(await verifier.verifyProof(a, b, c, d)).to.be.false
  })
})

describe('Multiplier3 with PLONK', function () {
  beforeEach(async function () {
    Verifier = await ethers.getContractFactory('PlonkVerifier')
    verifier = await Verifier.deploy()
    await verifier.deployed()
  })


  it('Should return true for correct proof', async function () {
    const { proof, publicSignals } = await plonk.fullProve(
        { "a": '1', "b": '2', "c": '3' },
        'contracts/circuits/_plonkMultiplier3/Multiplier3_js/Multiplier3.wasm',
        'contracts/circuits/_plonkMultiplier3/circuit_final.zkey',
      )
  
      console.log('1x2x3 =', publicSignals[0])
  
      const editedPublicSignals = unstringifyBigInts(publicSignals)
      const editedProof = unstringifyBigInts(proof)
      const calldata = await plonk.exportSolidityCallData(
        editedProof,
        editedPublicSignals,
      )
      const argv = calldata.split(',')
      expect(await verifier.verifyProof( argv[0], JSON.parse(argv[1]))).to.be.true
  })
  it('Should return false for invalid proof', async function () {
    const a = '0x00000b1f86a073e0701892d846381b9f602b7215a92ed800e683a18cd6c5f2521ae0481355bd45ef016f7f4b13dba148cb43a67971d7a47a1ea2b7eb6862905d1a558ce8018ca283e1ea5925bd0ebcac77b50ced056194998cb2acb6559b1f790f7e246242441c4fed6e79d98ae03a059e34e97cb2ebe6e1c6fd8aa5b8679ef00b66b0a25fa96a2cc2f5afe9068dcb94ee8f7007aab05a76476f7fd990b4d31a0a51d13fa9adc2abdc485d6f81c9b4da25dd79e5d16db0cca6d699829e55cfa61abfff9d365120d0e63a229656ed0918d6994b05afed33fcff39e498f63fa1462e33135a1fac411d7251947e648520c8d1b8ddb9be4e2f6aae6d5d812dbdeba9296d5d84337901feb4cfc56f755aea63bb6932a9c42f9fa4ba70add880f0859c2c6fb7fe41108fba151f1500afa0049469e75484584d3f4d61091552aa6b47f527ed18938d48da8e647f7c46bf75d97363e02c1147afecd2a396054253f9fd9a2955a5cfed0ed9acf75da8e8b67cd5d748c4bc4a968d778a29978a5e7dc07ce1230273292a993cd22875340c597533b89e8e212dee670ee12301e564f90c1e9d1313abe8efdb7d25a49365b144366cac8e2113b22e493d61d4b54ab99d9806c40802abaa2d6502500f862a3ce8e45918eba4bf96ce368db8026bb18ee4c902752e8a875c213a83aa372933ccd150b9765997a469222d87d67a9c6c2a3fe68aaf0ae12536fac2cb715253f5475105241df5ce98b3dd0cc2d82aaaf62cd5e7e33204bef13fb3d150ceae45b3e4823605aed3dae389d0d6355e9e2944528ced21601942bc9c97df0c63556ebafc64d556d2a1e603f94bf24ca682d56689f3a079180163001d0f34d5586b205562459fef900bc8419b97f87b9aaac42b9305fb44a8252e4658150a44aee87d87ed02f3d477c4328a45b95d2b11889ac4e8db6f6b5d017612c3abc7690c1125d3ce8eae5776716d015dd1da1346dfe2d68eb5b4c61e0a8920770774b2cd65fca68c186f5641d1d57fac869d7ba568d3a80b1af1934f25f6e94de38c0174ca3bc1958e8ff18b784719c62c8cbe342f9ecbcbf30c92d805215979ac0ec0e84a688109a54cd942fbaf56f62a25e335314263bfc47feed6'
    const b = ['0x0000000000000000000000000000000000000000000000000000000000000000']

    expect(await verifier.verifyProof(a, b)).to.be.false
  })
})
