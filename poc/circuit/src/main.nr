mod map_to_curve;

// Mode 1: Map-to-Curve Benchmark
// Mode 2: Multi-set hashing for zkVM Memory Consistency
// Mode 3: zkPoS BLS Signature aggregation emulation
// Mode 4: SHA-256 Benchmark
// Mode 5: Poseidon Benchmark

fn zkvm_memory_consistency(messages: [Field; 4], xs: [Field; 4], ys: [Field; 4], zs: [Field; 4], ts: [Field; 4]) {
    // We map 4 memory operations to curve points and sum their X coordinates 
    // to simulate multiset hashing accumulator (simplified for demo).
    let mut x_acc = 0;
    for i in 0..4 {
        map_to_curve::check_map_to_curve_constraints(messages[i], xs[i], ys[i], zs[i], ts[i]);
        x_acc += xs[i];
    }
    // In a real zkVM this x_acc is checked against an offline consistency check
}

fn bls_signature_verifier(signatures: [Field; 4], xs: [Field; 4], ys: [Field; 4], zs: [Field; 4], ts: [Field; 4]) {
    // Map messages to curve points for pairing check emulation
    let mut sum_x = 0;
    for i in 0..4 {
        map_to_curve::check_map_to_curve_constraints(signatures[i], xs[i], ys[i], zs[i], ts[i]);
        sum_x += xs[i];
    }
}

fn hash_sha256(m: Field) {
    let mut m_bytes: [u8; 32] = [0; 32];
    m_bytes[31] = m as u8;
    let h = std::hash::sha256(m_bytes);
}

fn hash_poseidon(m: Field) {
    let h = std::hash::poseidon::bn254::hash_2([m, 0]);
}

fn main(mode: Field, m: Field, x: Field, y: Field, z: Field, t: Field) {
    if mode == 1 {
        map_to_curve::check_map_to_curve_constraints(m, x, y, z, t);
    } // wait, Noir doesn't allow dynamic control flow that eliminates constraints easily without dynamic merging, usually IF statements still execute both branches or cost max. 
    // We should split these into separate main functions for accurate benchmarking!
}
