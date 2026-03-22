mod map_to_curve;

// Manual affine point addition for Grumpkin SW curve (Y^2 = X^3 - 17)
fn add_grumpkin(x1: Field, y1: Field, x2: Field, y2: Field) -> (Field, Field) {
    let lambda = (y2 - y1) / (x2 - x1);
    let x3 = lambda * lambda - x1 - x2;
    let y3 = lambda * (x1 - x3) - y1;
    (x3, y3)
}

fn map_and_add(m: [Field; 2], xs: [Field; 2], ys: [Field; 2], zs: [Field; 2], ts: [Field; 2]) {
    map_to_curve::check_map_to_curve_grumpkin(m[0], xs[0], ys[0], zs[0], ts[0]);
    map_to_curve::check_map_to_curve_grumpkin(m[1], xs[1], ys[1], zs[1], ts[1]);
    let (x3, y3) = add_grumpkin(xs[0], ys[0], xs[1], ys[1]);
    assert(x3 != 0);
}

fn main(m: [Field; 2], xs: [Field; 2], ys: [Field; 2], zs: [Field; 2], ts: [Field; 2]) {
    map_and_add(m, xs, ys, zs, ts);
}
