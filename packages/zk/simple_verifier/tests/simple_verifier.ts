import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SimpleVerifier } from "../target/types/simple_verifier";
import * as snarkjs from "snarkjs";

describe("simple_verifier", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SimpleVerifier as Program<SimpleVerifier>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });

  it("Will Verify!", async () => {
    const { proof } = await snarkjs.groth16.fullProve(
      { a: 10, b: 2 },
      "../simple_circuit/simple_js/simple.wasm",
      "../simple_circuit/simple_0001.zkey",
    );

    await program.methods.verify(10, 2, Array.from(convertProofToBytes(proof))).rpc();
    console.log("See transaction logs");
  })
});


function bigIntToBytes32(num) {
  // Convert BigInt to 32-byte hex string
  let hex = BigInt(num).toString(16);
  // Pad to 64 characters (32 bytes)
  hex = hex.padStart(64, '0');
  // Convert hex string to Uint8Array
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, (i + 1) * 2), 16);
  }
  return bytes;
}

function concatenateUint8Arrays(arrays) {
  // Calculate total length
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  // Create new array with total length
  const result = new Uint8Array(totalLength);
  // Copy each array into result
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

function convertProofToBytes(proof: { pi_a: any[]; pi_b: any[][]; pi_c: any[]; }) {
  // Convert pi_a components
  const pi_a = [
    bigIntToBytes32(proof.pi_a[0]),
    bigIntToBytes32(proof.pi_a[1])
  ];

  // Convert pi_b components (note the reversed order within pairs)
  const pi_b = [
    // First pair
    bigIntToBytes32(proof.pi_b[0][1]),  // Reversed order
    bigIntToBytes32(proof.pi_b[0][0]),
    // Second pair
    bigIntToBytes32(proof.pi_b[1][1]),  // Reversed order
    bigIntToBytes32(proof.pi_b[1][0])
  ];

  // Convert pi_c components
  const pi_c = [
    bigIntToBytes32(proof.pi_c[0]),
    bigIntToBytes32(proof.pi_c[1])
  ];

  // Concatenate all components
  const allBytes = concatenateUint8Arrays([
    ...pi_a,
    ...pi_b,
    ...pi_c
  ]);

  return allBytes;
}
