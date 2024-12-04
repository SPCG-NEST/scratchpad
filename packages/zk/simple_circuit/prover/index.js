import * as snarkjs from "snarkjs";
import { readFileSync } from 'fs'
async function main() {
    // fullProve not available in bun, need to use .prove if using Bun w/ single threaded workers
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        { a: 10, b: 2 },
        "../simple_js/simple.wasm",
        "../simple_0001.zkey"
    );

    console.log(`Proof: ${JSON.stringify(proof, null, 1)}`);

    console.log(`Output: ${JSON.stringify(publicSignals, null, 1)}`);
    const vKey = JSON.parse(readFileSync('../verification_key.json').toString())
    const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    if (res === true) {
        console.log("Verification OK");
    } else {
        console.log("Invalid proof");
    }
}

main().then(() => process.exit(0));

