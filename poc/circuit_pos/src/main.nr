fn hash_and_accum(m: [Field; 2]) {
    for i in 0..2 {
        let h = std::hash::poseidon::bn254::hash_2([m[i], 0]);
        assert(h != 0);
    }
}
fn main(m: [Field; 2]) {
    hash_and_accum(m);
}
