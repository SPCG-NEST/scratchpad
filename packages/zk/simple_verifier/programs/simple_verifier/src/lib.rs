use anchor_lang::prelude::*;
use ark_serialize::{CanonicalDeserialize, CanonicalSerialize};
use groth16_solana::groth16::Groth16Verifier;

mod verifying_key;
use verifying_key::VERIFYINGKEY;
type G1 = ark_bn254::g1::G1Affine;
declare_id!("6k2HeDpGk8HccTyFSwgczzVoyRc4oNXGZAoEmEvj3yGb");

#[program]
pub mod simple_verifier {

    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }

    pub fn verify(_ctx: Context<Verify>, result: u8, proof: [u8; 256]) -> Result<()> {
        let proof_a: G1 = <G1 as CanonicalDeserialize>::deserialize_uncompressed(
            &*[&change_endianness(&proof[0..64])[..], &[0u8][..]].concat(),
        )
        .unwrap();
        let mut proof_a_neg = [0u8; 65];
        <G1 as CanonicalSerialize>::serialize_uncompressed(&-proof_a, &mut proof_a_neg[..])
            .unwrap();
        let proof_a: [u8; 64] = change_endianness(&proof_a_neg[..64]).try_into().unwrap();
        let proof_b: [u8; 128] = proof[64..192].try_into().unwrap();
        let proof_c: [u8; 64] = proof[192..256].try_into().unwrap();

        /* let mut public_inputs: [[u8; 32]; 2] = [[0u8; 32]; 2];
        public_inputs[0][31] = a;
        public_inputs[1][31] = b; */
        let mut public_inputs: [[u8; 32]; 1] = [[0u8; 32]];
        public_inputs[0][31] = result;

        let mut verifier =
            Groth16Verifier::new(&proof_a, &proof_b, &proof_c, &public_inputs, &VERIFYINGKEY)
                .unwrap();

        msg!("Proof Result: {:?}", verifier.verify().unwrap());

        Ok(())
    }
}

fn change_endianness(bytes: &[u8]) -> Vec<u8> {
    let mut vec = Vec::new();
    for b in bytes.chunks(32) {
        for byte in b.iter().rev() {
            vec.push(*byte);
        }
    }
    vec
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct Verify {}
