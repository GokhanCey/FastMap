fn main(m: [Field; 2]) {
    for i in 0..2 {
        let mut m_bytes: [u8; 32] = [0; 32];
        m_bytes[31] = m[i] as u8;
        let h = std::hash::sha256(m_bytes);
        assert(h[0] != 42); 
    }
}
