const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const NUM_ITERATIONS = 4; // To simulate array of operations

const cases = [
    {
        name: 'Map-to-Curve (BN254)',
        code: `
mod map_to_curve;
fn main(m: [Field; 4], xs: [Field; 4], ys: [Field; 4], zs: [Field; 4], ts: [Field; 4]) {
    for i in 0..4 {
        map_to_curve::check_map_to_curve_constraints(m[i], xs[i], ys[i], zs[i], ts[i]);
    }
}
        `
    },
    {
        name: 'Poseidon Hash-to-Group',
        code: `
fn main(m: [Field; 4]) {
    for i in 0..4 {
        let h = std::hash::poseidon::bn254::hash_2([m[i], 0]);
        assert(h != 0); // use it
    }
}
        `
    },
    {
        name: 'SHA-256 Hash-to-Group',
        code: `
fn main(m: [Field; 4]) {
    for i in 0..4 {
        let mut m_bytes: [u8; 32] = [0; 32];
        m_bytes[31] = m[i] as u8;
        let h = std::hash::sha256(m_bytes);
        assert(h[0] != 42); // dummy use
    }
}
        `
    },
    {
        name: 'Blake3 Hash-to-Group',
        code: `
fn main(m: [Field; 4]) {
    for i in 0..4 {
        let mut m_bytes: [u8; 32] = [0; 32];
        m_bytes[31] = m[i] as u8;
        let h = std::hash::blake3(m_bytes);
        assert(h[0] != 42); // dummy use
    }
}
        `
    }
];

const results = [];
const circuitPath = path.join(__dirname, 'circuit');
const mainPath = path.join(circuitPath, 'src', 'main.nr');

try {
    for (const testCase of cases) {
        console.log(\`Benchmarking \${testCase.name}...\`);
        fs.writeFileSync(mainPath, testCase.code);

        // Run nargo info
        const start = Date.now();
        const output = execSync('npx @noir-lang/noir-cli info', { cwd: circuitPath, encoding: 'utf-8' });
        const end = Date.now();
        
        // Parse "Backend circuit size: 1234"
        const match = output.match(/Backend circuit size:\s*(\d+)/);
        const constraints = match ? parseInt(match[1]) : 0;
        
        results.push({
            name: testCase.name,
            constraints,
            provingTimeMs: end - start // approximate for JS compilation/witness, real proving takes more but this is a proxy
        });

        console.log(\`  Constraints: \${constraints}\`);
    }

    // Save results to frontend
    const frontendDataPath = path.join(__dirname, 'frontend', 'src', 'benchmark-data.json');
    if (fs.existsSync(path.dirname(frontendDataPath))) {
        fs.writeFileSync(frontendDataPath, JSON.stringify(results, null, 2));
        console.log('Results saved to frontend/src/benchmark-data.json');
    } else {
        fs.writeFileSync('benchmark-data.json', JSON.stringify(results, null, 2));
        console.log('Results saved to benchmark-data.json');
    }

} catch (error) {
    console.error("Error running benchmark:", error.message);
}
