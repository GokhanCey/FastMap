global T: Field = 256;

// Maps a numeric field element `m` to a Grumpkin curve point (x, y) 
// Grumpkin: Y^2 = X^3 - 17
pub fn check_map_to_curve_grumpkin(m: Field, x: Field, y: Field, z: Field, t: Field) {
    assert(x == t + m * T);

    let y_sq = y * y;
    let x_sq = x * x;
    let x_cube = x_sq * x;
    let f_x = x_cube - 17;
    
    // Point is on Grumpkin curve
    assert(y_sq == f_x);

    // Uniqueness (y is a structural residue via z)
    assert(y == z * z);
}
