import { useEffect, useRef, useState } from 'react';

const rawMapStr = `+-------------+------------------+----------------------+--------------+-----------------+
| Package     | Function         | Expression Width     | ACIR Opcodes | Brillig Opcodes |
+-------------+------------------+----------------------+--------------+-----------------+
| circuit_map | main             | Bounded { width: 4 } | 16           | 9               |
+-------------+------------------+----------------------+--------------+-----------------+
| circuit_map | directive_invert | N/A                  | N/A          | 9               |
+-------------+------------------+----------------------+--------------+-----------------+`;

const rawPosStr = `+-------------+------------------+----------------------+--------------+-----------------+
| Package     | Function         | Expression Width     | ACIR Opcodes | Brillig Opcodes |
+-------------+------------------+----------------------+--------------+-----------------+
| circuit_pos | main             | Bounded { width: 4 } | 750          | 9               |
+-------------+------------------+----------------------+--------------+-----------------+
| circuit_pos | directive_invert | N/A                  | N/A          | 9               |
+-------------+------------------+----------------------+--------------+-----------------+`;

const rawShaStr = `+-------------+----------------------------+----------------------+--------------+-----------------+
| Package     | Function                   | Expression Width     | ACIR Opcodes | Brillig Opcodes |
+-------------+----------------------------+----------------------+--------------+-----------------+
| circuit_sha | main                       | Bounded { width: 4 } | 224          | 644             |
+-------------+----------------------------+----------------------+--------------+-----------------+
| circuit_sha | build_msg_block            | N/A                  | N/A          | 268             |
+-------------+----------------------------+----------------------+--------------+-----------------+
| circuit_sha | attach_len_to_msg_block    | N/A                  | N/A          | 359             |
+-------------+----------------------------+----------------------+--------------+-----------------+
| circuit_sha | directive_integer_quotient | N/A                  | N/A          | 8               |
+-------------+----------------------------+----------------------+--------------+-----------------+
| circuit_sha | directive_invert           | N/A                  | N/A          | 9               |
+-------------+----------------------------+----------------------+--------------+-----------------+`;

const BENCHMARKS = [
  { name: 'Map-to-Curve + Grumpkin EC Add', constraints: 16,  cls: 'bf-green', label: '16 constraints' },
  { name: 'Poseidon Hash-to-Group',          constraints: 750, cls: 'bf-blue',  label: '750 constraints' },
  { name: 'SHA-256 Hash-to-Group',           constraints: 868, cls: 'bf-red',   label: '868 constraints (ACIR + Brillig)' },
];
const MAX = 868;

function AnimatedBar({ pct, cls, delay }: { pct: number; cls: string; delay: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setTimeout(() => ref.current?.classList.add('animate'), parseInt(delay));
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div className="bar-track">
      <div ref={ref} className={`bar-fill ${cls}`} style={{ width: `${pct}%`, transitionDelay: delay }} />
    </div>
  );
}

function Collapsible({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="coll-head" onClick={() => setOpen(o => !o)}>
        <span className="coll-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>
          </svg>
          {title}
        </span>
        <svg className={`coll-chev${open ? ' open' : ''}`} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      <div className={`coll-body${open ? ' open' : ''}`}>
        <div className="raw-label">Map-to-Curve + Grumpkin Add</div>
        <div className="raw-block">{rawMapStr}</div>
        <div className="raw-label">Poseidon Hash-to-Group</div>
        <div className="raw-block">{rawPosStr}</div>
        <div className="raw-label">SHA-256 Hash-to-Group</div>
        <div className="raw-block">{rawShaStr}</div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-badge"><span className="hero-badge-dot" /> Shape Rotator Virtual Hackathon</div>
        <h1 className="hero-title">
          Making ZK Proofs<br />
          <span className="grad">47× More Efficient</span>
        </h1>
        <p className="hero-sub">
          We implement the constraint-friendly map-to-elliptic-curve-group relation from Groth et al. |
          Replacing expensive hash-to-group functions with a 16-constraint alternative proven secure in the Generic Group Model.
        </p>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-num g">16</span>
            <span className="stat-label">Our constraints</span>
          </div>
          <div className="stat-item">
            <span className="stat-num p">750</span>
            <span className="stat-label">Poseidon constraints</span>
          </div>
          <div className="stat-item">
            <span className="stat-num v">47×</span>
            <span className="stat-label">Reduction vs Poseidon</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section mb-12">
        <div className="section-eyebrow">How it works</div>
        <h2 className="section-heading">Three steps to 47× fewer constraints</h2>
        <div className="steps">
          <div className="step-card">
            <div className="step-num">Step 01</div>
            <div className="step-title">Traditional hash-to-group is expensive</div>
            <div className="step-body">Existing ZK systems use Poseidon or SHA-256 to hash inputs to a curve point. This involves hundreds of field operations inside the circuit.</div>
            <span className="step-badge sb-red">750+ constraints</span>
          </div>
          <div className="step-card">
            <div className="step-num">Step 02</div>
            <div className="step-title">Our map-to-curve uses only 16 constraints</div>
            <div className="step-body">The increment-and-check constructor encodes the map as a relation: <em>x = t + m·T</em>, y² = x³ − 17, y = z². The prover supplies witnesses externally.</div>
            <span className="step-badge sb-green">16 constraints</span>
          </div>
          <div className="step-card">
            <div className="step-num">Step 03</div>
            <div className="step-title">Same security, proven in the GGM</div>
            <div className="step-body">The relation is binding in the Generic Group Model: no adversary can find a different witness for the same output point without solving discrete log.</div>
            <span className="step-badge sb-purple">GGM-secure</span>
          </div>
        </div>
      </section>

      {/* Benchmarks */}
      <div className="card mb-4">
        <div className="card-header">
          <div className="card-title">
            <span className="card-title-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </span>
            Circuit Constraint Comparison
          </div>
          <span className="card-tag">real nargo info output : 2 iterations</span>
        </div>
        <div className="bar-list">
          {BENCHMARKS.map((b, i) => (
            <div className="bar-row" key={b.name}>
              <div className="bar-meta">
                <span className="bar-name">{b.name}</span>
                <span className="bar-val">{b.label}</span>
              </div>
              <AnimatedBar pct={(b.constraints / MAX) * 100} cls={b.cls} delay={`${120 + i * 180}ms`} />
            </div>
          ))}
        </div>
      </div>

      <div className="divider" />

      <Collapsible title="Raw nargo info output : click to verify constraint counts" />
    </div>
  );
}
