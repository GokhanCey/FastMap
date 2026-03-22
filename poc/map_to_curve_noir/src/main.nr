global T: Field = 256;

// Maps a numeric field element `m` to a Grumpkin curve point (x, y) 
pub fn check_map_to_curve_grumpkin(m: Field, x: Field, y: Field, z: Field, t: Field) {
    assert(x == t + m * T);

    let y_sq = y * y;
    let x_sq = x * x;
    let x_cube = x_sq * x;
    let f_x = x_cube - 17;
    
    assert(y_sq == f_x);
    assert(y == z * z);
}

fn main(m: Field, x: Field, y: Field, z: Field, t: Field) {
    check_map_to_curve_grumpkin(m, x, y, z, t);
}

#[test]
fn test_valid_map_to_curve_grumpkin() {
    let m = 7;
    let x = 1792;
    let y = 2222603532014808061213222263845635574143735707039159930479525957984581958699;
    let z = 276759698173846535821495865193274967682377030871373817764620224677696820189;
    let t = 0;
    
    check_map_to_curve_grumpkin(m, x, y, z, t);
}

#[test(should_fail)]
fn test_invalid_y_fails() {
    let m = 7;
    let x = 1792;
    let y = 2222603532014808061213222263845635574143735707039159930479525957984581958699;
    let neg_y = 0 - y;
    let z = 276759698173846535821495865193274967682377030871373817764620224677696820189;
    let t = 0;
    
    check_map_to_curve_grumpkin(m, x, neg_y, z, t);
}
