# Map-to-Curve ZK Protocol PoC

This project is a Proof of Concept implementing the constraint-friendly map-to-elliptic-curve-group relations described in the paper "Constraint-Friendly Map-to-Elliptic-Curve-Group Relations and Their Applications" (Groth et al.). The core idea is to replace expensive hash-to-group functions (like SHA256 or Poseidon) in zero-knowledge proof systems with an increment-and-check method combined with a quadratic residue check. The key result is monumental: mapping a field element and performing an elliptic curve point addition on a Short Weierstrass curve (Grumpkin) requires exactly **16 ACIR constraints**, a ~45x reduction over Poseidon (750) and a massive reduction over standard SHA256 configurations.

## Prerequisites
- Node.js (for the frontend dashboard)
- Windows Subsystem for Linux (WSL), MacOS, or Linux environment (to run the Noir Compiler)

## 1. Install Nargo (Noir Compiler)
The protocol circuits use Nargo `v0.37.0`. Install it via the official `noirup` script:
```bash
curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash
export PATH="$HOME/.nargo/bin:$PATH"
noirup -v 0.37.0
```

## 2. Run the Noir Tests
Verify the Map-to-Curve implementation logic directly against valid reference vectors:
```bash
cd map_to_curve_noir
nargo test
```

## 3. Run the Benchmarks
To run the automated circuit benchmarks and measure the real ACIR opcodes against standard hash-to-group algorithms:
```bash
chmod +x run_tests.sh
./run_tests.sh
```
*Outputs will be generated to `info_map.txt`, `info_pos.txt`, and `info_sha.txt`.*

## 4. Start the Dashboard
Visualize the raw compiled benchmarks horizontally and view the system assessment via the interactive React UI:
```bash
cd frontend
npm install
npm run dev
```
Then navigate to `http://localhost:5173/` in your browser.
