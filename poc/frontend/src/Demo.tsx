// @ts-nocheck
import { useState } from 'react';
import { Noir } from '@noir-lang/noir_js';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import circuit from './circuit.json';

// ── BN254 scalar field prime (Fr) ─────────────────────────────────────────────
const P = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
const T = 256n;

function modpow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = 1n; base = base % mod;
  while (exp > 0n) {
    if (exp % 2n === 1n) result = result * base % mod;
    exp >>= 1n; base = base * base % mod;
  }
  return result;
}

// Tonelli-Shanks — works for Fr ≡ 1 mod 4
function trySqrt(n: bigint): bigint | null {
  n = ((n % P) + P) % P;
  if (n === 0n) return 0n;
  if (modpow(n, (P - 1n) / 2n, P) !== 1n) return null;
  let Q = P - 1n, S = 0n;
  while (Q % 2n === 0n) { Q /= 2n; S++; }
  let z = 2n;
  while (modpow(z, (P - 1n) / 2n, P) !== P - 1n) z++;
  let M = S, c = modpow(z, Q, P), t = modpow(n, Q, P), R = modpow(n, (Q + 1n) / 2n, P);
  while (true) {
    if (t === 1n) return R;
    let i = 1n, tmp = t * t % P;
    while (tmp !== 1n) { tmp = tmp * tmp % P; i++; }
    const b = modpow(c, modpow(2n, M - i - 1n, P - 1n), P);
    M = i; c = b * b % P; t = t * c % P; R = R * b % P;
  }
}

async function hashToField(msg: string): Promise<bigint> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(msg));
  const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  return BigInt('0x' + hex) % P;
}

async function mapMessageToPoint(message: string, log: (s: string, t?: string) => void) {
  const m = await hashToField(message);
  log(`Hash of "${message}" : m = ${m.toString().slice(0, 24)}…`, 'dim');
  for (let tVal = 0n; tVal < T; tVal++) {
    const xFull = tVal + m * T;
    const x = xFull % P;
    const rhs = (modpow(x, 3n, P) - 17n + P) % P;
    const sqrtY = trySqrt(rhs);
    if (sqrtY !== null) {
      const z = trySqrt(sqrtY);
      if (z !== null) {
        log(`Found valid point : t = ${tVal}`, 'dim');
        log(`x = ${x.toString().slice(0, 26)}…`, 'dim');
        log(`y = ${sqrtY.toString().slice(0, 26)}…`, 'dim');
        log(`z = ${z.toString().slice(0, 26)}…`, 'dim');
        return { m: m.toString(), x: x.toString(), y: sqrtY.toString(), z: z.toString(), t: tVal.toString() };
      }
    }
  }
  log('No valid point found within T=256 range.', 'error');
  return null;
}

const EXAMPLE = {
  m: '7', x: '1792',
  y: '2222603532014808061213222263845635574143735707039159930479525957984581958699',
  z: '276759698173846535821495865193274967682377030871373817764620224677696820189',
  t: '0',
};

type LogLine = { text: string; type: string };

function fireConfetti() {
  import('canvas-confetti').then(({ default: confetti }) => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.55 }, colors: ['#a855f7', '#3b82f6', '#22c55e'] });
    setTimeout(() => confetti({ particleCount: 50, spread: 50, origin: { y: 0.55 }, angle: 60, colors: ['#a855f7', '#06b6d4'] }), 350);
  });
}

async function runProver(params: any, addLine: any, setSuccess: any) {
  addLine('Initializing Barretenberg WASM backend...');
  const backend = new BarretenbergBackend(circuit);
  const noir    = new Noir(circuit, backend);
  addLine('Executing circuit : generating witness...');
  const start = performance.now();
  const { witness } = await noir.execute(params);
  addLine('Calling Barretenberg prover...');
  const proof = await backend.generateProof(witness);
  const ms    = performance.now() - start;
  const hex   = Array.from(proof.proof).map((b: number) => b.toString(16).padStart(2, '0')).join('');
  addLine(`Proof generated in ${ms.toFixed(0)} ms`, 'success');
  addLine(`0x${hex.substring(0, 52)}...`, 'dim');
  addLine('Verifying proof...');
  const valid = await backend.verifyProof(proof);
  if (valid) {
    addLine('Proof verified ✓', 'success');
    setSuccess({ time: ms, hex });
    fireConfetti();
  } else {
    addLine('Verification failed', 'error');
  }
}

function Terminal({ lines, proving }: { lines: LogLine[]; proving: boolean }) {
  return (
    <div className="terminal">
      <div className="term-bar">
        <span className="term-dot r" /><span className="term-dot y" /><span className="term-dot g" />
        <span className="term-title">barretenberg-prover : zsh</span>
      </div>
      <div className="term-body">
        {lines.length === 0 && !proving && (
          <div className="tline"><span className="tprompt">$</span><span className="t-dim">Waiting for input...</span></div>
        )}
        {lines.map((l, i) => (
          <div key={i} className="tline">
            <span className="tprompt">$</span>
            <span className={`t-${l.type || 'info'}`}>{l.text}</span>
          </div>
        ))}
        {proving && <div className="tline"><span className="tprompt">$</span><span className="cursor" /></div>}
      </div>
    </div>
  );
}

function SimpleMode() {
  const [message, setMessage] = useState('');
  const [proving, setProving] = useState(false);
  const [lines,   setLines]   = useState<LogLine[]>([]);
  const [success, setSuccess] = useState<any>(null);
  const addLine = (text: string, type = 'info') => setLines(p => [...p, { text, type }]);

  const prove = async () => {
    if (!message.trim()) return;
    setProving(true); setLines([]); setSuccess(null);
    try {
      addLine('Hashing message : BN254 scalar field element...');
      const params = await mapMessageToPoint(message.trim(), addLine);
      if (!params) return;
      addLine('Passing computed parameters to ZK circuit...');
      await runProver(params, addLine, setSuccess);
    } catch (e: any) { addLine('Error: ' + e.message, 'error'); }
    finally { setProving(false); }
  };

  return (
    <div>
      <div className="field-group" style={{ marginBottom: 10 }}>
        <label className="field-label">Your Message</label>
        <input
          className="field-input lg"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type anything : e.g. 'Ethereum block 21000000'"
          onKeyDown={e => e.key === 'Enter' && !proving && prove()}
        />
      </div>
      <div className="pill-row">
        {['hello world', 'Ethereum block 21000000', 'zkVM state root'].map(ex => (
          <button key={ex} className="quick-pill" onClick={() => setMessage(ex)}>"{ex}"</button>
        ))}
      </div>
      <div className="prover-grid">
        <div>
          <button className="btn-primary" disabled={proving || !message.trim()} onClick={prove}>
            {proving ? 'Computing & Proving...' : 'Generate ZK Proof'}
          </button>
          {success && (
            <>
              <div className="proof-banner">
                <span className="proof-banner-icon">✓</span>
                <div>
                  <span className="proof-banner-strong">Proof verified | {success.time.toFixed(0)} ms</span>
                  <span className="proof-banner-sub">0x{success.hex.substring(0, 48)}...</span>
                </div>
              </div>
              <div className="proved-card">
                <strong>What was proved</strong>
                Message <code style={{ color: '#e2e8f0' }}>"{message}"</code> was hashed to a BN254 field element,
                a valid Grumpkin curve point was found in-browser via increment-and-check,
                and a ZK proof of the mapping was generated client-side using only <strong style={{ color: '#a855f7' }}>16 constraints</strong>.
              </div>
            </>
          )}
        </div>
        <Terminal lines={lines} proving={proving} />
      </div>
    </div>
  );
}

function AdvancedMode() {
  const [fields, setFields] = useState({ m: '', x: '', y: '', z: '', t: '' });
  const [proving, setProving] = useState(false);
  const [lines,   setLines]   = useState<LogLine[]>([]);
  const [success, setSuccess] = useState<any>(null);
  const set = (k: string) => (e: any) => setFields(f => ({ ...f, [k]: e.target.value }));
  const addLine = (text: string, type = 'info') => setLines(p => [...p, { text, type }]);
  const ready = fields.m && fields.x && fields.y && fields.z && fields.t !== '';

  const prefill = () => { setFields(EXAMPLE); setLines([{ text: 'Example values loaded', type: 'dim' }]); setSuccess(null); };

  const generate = async () => {
    setProving(true); setLines([]); setSuccess(null);
    try { await runProver(fields, addLine, setSuccess); }
    catch (e: any) { addLine('Error: ' + e.message, 'error'); }
    finally { setProving(false); }
  };

  return (
    <div className="prover-grid">
      <div>
        <button className="btn-secondary" onClick={prefill}>⚡ Use Example Values</button>
        <p className="btn-hint">Example: message 7 maps to a verified Grumpkin point (Y² = X³ | 17)</p>
        {[{ k: 'm', l: 'Message (m)' }, { k: 'x', l: 'Curve Point X' }, { k: 't', l: 'Tweak Increments (t)' }].map(({ k, l }) => (
          <div className="field-group" key={k}>
            <label className="field-label">{l}</label>
            <input className="field-input" value={(fields as any)[k]} onChange={set(k)} placeholder="Field element..." />
          </div>
        ))}
        {[{ k: 'y', l: 'Curve Point Y' }, { k: 'z', l: 'Quadratic Residue Root (z)' }].map(({ k, l }) => (
          <div className="field-group" key={k}>
            <label className="field-label">{l}</label>
            <textarea className="field-textarea" rows={3} value={(fields as any)[k]} onChange={set(k)} placeholder="Large field element..." />
          </div>
        ))}
        <button className="btn-primary" disabled={proving || !ready} onClick={generate}>
          {proving ? 'Proving...' : 'Generate ZK Proof'}
        </button>
        {success && (
          <div className="proof-banner" style={{ marginTop: 16 }}>
            <span className="proof-banner-icon">✓</span>
            <div>
              <span className="proof-banner-strong">Proof verified | {success.time.toFixed(0)} ms</span>
              <span className="proof-banner-sub">0x{success.hex.substring(0, 48)}...</span>
            </div>
          </div>
        )}
      </div>
      <Terminal lines={lines} proving={proving} />
    </div>
  );
}

export default function Demo() {
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');

  return (
    <div className="page">
      <div className="demo-hero">
        <div className="hero-badge" style={{ marginBottom: 22 }}>
          <span className="hero-badge-dot" /> Powered by Barretenberg WASM
        </div>
        <h1 className="demo-title">
          Generate a Real ZK Proof<br />in Your Browser
        </h1>
        <p className="demo-sub">
          <em>No server. No trust required.</em>{' '}
          The Barretenberg prover runs entirely client-side via WebAssembly.
        </p>
      </div>

      <div className="card" style={{ padding: '28px' }}>
        <div className="mode-toggle">
          <button className={`mode-btn${mode === 'simple' ? ' active' : ''}`} onClick={() => setMode('simple')}>
            ✦ Simple Mode
          </button>
          <button className={`mode-btn${mode === 'advanced' ? ' active' : ''}`} onClick={() => setMode('advanced')}>
            ⬡ Advanced Mode
          </button>
        </div>
        {mode === 'simple' ? <SimpleMode /> : <AdvancedMode />}
      </div>

      <div className="explainer">
        <div className="explainer-title">What just happened?</div>
        <div className="explainer-body">
          {mode === 'simple' ? (
            <>Your text was SHA-256 hashed to a <span className="code-tag">BN254 scalar field element m</span>. The
            increment-and-check algorithm ran in your browser: trying <span className="code-tag">x = t + m·256</span> for
            increasing t until it found a point where <span className="code-tag">y² = x³ | 17</span> has a solution | then
            extracted <span className="code-tag">z = √y</span>. All five circuit inputs were computed automatically and
            passed to Barretenberg as witnesses. Only <strong>16 constraints</strong> were needed for the full proof.</>
          ) : (
            <>You provided raw BN254 scalar field elements. Barretenberg verified all three circuit constraints:
            <span className="code-tag">x = t + m·256</span>, <span className="code-tag">y² = x³ | 17</span>,
            and <span className="code-tag">y = z²</span> | using only <strong>16 constraints</strong>.
            Traditional hash-to-group requires <strong>750+</strong> constraints for the same binding guarantee.</>
          )}
        </div>
      </div>
    </div>
  );
}
