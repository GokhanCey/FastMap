global T: Field = 256;

pub fn check_map_to_curve_constraints(m: Field, x: Field, y: Field, z: Field, t: Field) {
    assert(x == t + m * T);
    let y_sq = y * y;
    let x_sq = x * x;
    let x_cube = x_sq * x;
    let f_x = x_cube + 3; // BN254 Y^2 = X^3 + 3
    assert(y_sq == f_x);
    assert(y == z * z);
}
