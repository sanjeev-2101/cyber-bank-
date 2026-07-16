import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Cpu, RefreshCw, Lock, Unlock, Zap, Terminal as TermIcon } from 'lucide-react';
import { generateQPCKeyPair, encryptString, decryptString } from '../utils/qpc_crypto';
import type { QPCKeyPair } from '../utils/qpc_crypto';

interface QPCManagerProps {
  quantumSafeActive: boolean;
  onToggleQuantumSafe: () => void;
}

export const QPCManager: React.FC<QPCManagerProps> = ({ quantumSafeActive, onToggleQuantumSafe }) => {
  const [secretText, setSecretText] = useState('CYBER_BANK_ADMIN_MASTER_TOKEN_8923#!A');
  const [keyPair, setKeyPair] = useState<QPCKeyPair | null>(null);
  const [encryptedPayload, setEncryptedPayload] = useState<any>(null);
  const [decryptedText, setDecryptedText] = useState('');
  const [attackLogs, setAttackLogs] = useState<string[]>([]);
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackResult, setAttackResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'encrypt' | 'math' | 'terminal'>('encrypt');

  // Generate initial keys
  useEffect(() => {
    handleGenerateNewKeys();
  }, []);

  const handleGenerateNewKeys = () => {
    const keys = generateQPCKeyPair();
    setKeyPair(keys);
    setEncryptedPayload(null);
    setDecryptedText('');
    setAttackResult(null);
    setAttackLogs(['[SYSTEM] Cryptographic core re-initialized. Ready for key exchange.']);
  };

  const handleEncrypt = () => {
    if (!keyPair) return;
    const cipher = encryptString(secretText, keyPair.publicKey);
    setEncryptedPayload(cipher);
    setDecryptedText('');
    setAttackLogs(prev => [
      ...prev,
      `[CRYPTO] Encrypted data: "${secretText.substring(0, 10)}..." (${secretText.length} chars)`,
      `[CRYPTO] Matrix vector representation generated: ${cipher.length} character blocks, each packed with 8 LWE coordinate dimensions.`
    ]);
  };

  const handleDecrypt = () => {
    if (!keyPair || !encryptedPayload) return;
    const plain = decryptString(encryptedPayload, keyPair.secretKey);
    setDecryptedText(plain);
    setAttackLogs(prev => [
      ...prev,
      `[CRYPTO] Solved Lattice Decryption Equation: DecVal = v - s*u (mod Q)`,
      `[CRYPTO] Noise margin within threshold. Restored Payload: "${plain}"`
    ]);
  };

  const runQuantumAttack = async () => {
    if (!keyPair) return;
    setIsAttacking(true);
    setAttackResult(null);
    setAttackLogs(prev => [...prev, `[ATTACK] Initiating Quantum Attack via Shor's Algorithm...`]);
    setActiveTab('terminal');

    const steps = [
      "Spinning up IBM Osprey 433-qubit coherent quantum simulator...",
      "Analyzing credential packaging structure...",
      quantumSafeActive 
        ? "Post-Quantum Cryptography detected: Lattice Learning-With-Errors (Kyber-512 standard)."
        : "Traditional cryptography detected: Standard RSA-4096 / ECDSA certificate signature.",
      quantumSafeActive
        ? "Attempting to factor high-dimensional grid matrices (Shortest Vector Problem)..."
        : "Running Shor's polynomial-time prime factorization of N = p * q...",
      quantumSafeActive
        ? "Adding noise vector matrices e1, e2 prevents linear Gaussian solver convergence."
        : "Period r found: r = 405928301... Factoring succeeded in 0.05 seconds!",
      quantumSafeActive
        ? "CRITICAL ERROR: Shortest vector search space exceeds 2^256 dimensions. Solving would take 10^12 years on a quantum computer."
        : "Private Key Extracted! Decrypting target credential archive...",
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setAttackLogs(prev => [...prev, `[QUANTUM-COMPUTE] ${steps[i]}`]);
    }

    setIsAttacking(false);
    if (quantumSafeActive) {
      setAttackResult({
        success: false,
        message: "Lattice protection holds! Shor's Algorithm failed because LWE encryption noise prevents the quantum computer from finding the secret key."
      });
      setAttackLogs(prev => [...prev, `[SYSTEM] Attack Deflected. Lattice Cryptographic bounds secure.`]);
    } else {
      setAttackResult({
        success: true,
        message: "Security Compromised! Standard credentials cracked by Shor's algorithm. High clearance bank manager credentials exfiltrated."
      });
      setAttackLogs(prev => [...prev, `[SYSTEM] Critical Alert: Root bank credentials leaked to terminal.`]);
    }
  };

  return (
    <div className="cyber-panel scanline">
      <div className="cyber-panel-header">
        <div className="cyber-panel-title">
          <Cpu className="text-glow-purple" />
          Quantum-Safe Cryptography (QPC) Simulation
        </div>
        <button 
          onClick={onToggleQuantumSafe}
          className={`cyber-badge font-mono flex items-center gap-1 ${
            quantumSafeActive 
              ? 'text-neon-green border-neon-green' 
              : 'text-neon-red border-neon-red'
          }`}
          style={{ cursor: 'pointer', background: 'transparent' }}
        >
          {quantumSafeActive ? <Shield className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
          QPC Mode: {quantumSafeActive ? 'ON' : 'OFF'}
        </button>
      </div>

      <p className="text-sm text-text-muted mb-6">
        Traditional credentials (RSA/ECC) are vulnerable to decryption by upcoming Quantum Computers running Shor's Algorithm. 
        CYBER_S.BANK uses **Lattice-Based Cryptography** (specifically LWE) to secure administrative login keys.
      </p>

      {/* Tabs */}
      <div className="flex border-b border-border-glow mb-4">
        <button 
          onClick={() => setActiveTab('encrypt')}
          className={`px-4 py-2 text-xs font-mono tracking-wider uppercase border-b-2 transition-all ${
            activeTab === 'encrypt' ? 'border-neon-purple text-text-bright' : 'border-transparent text-text-muted hover:text-text-bright'
          }`}
        >
          Interactive Cryptography
        </button>
        <button 
          onClick={() => setActiveTab('math')}
          className={`px-4 py-2 text-xs font-mono tracking-wider uppercase border-b-2 transition-all ${
            activeTab === 'math' ? 'border-neon-purple text-text-bright' : 'border-transparent text-text-muted hover:text-text-bright'
          }`}
        >
          Lattice Math Matrix
        </button>
        <button 
          onClick={() => setActiveTab('terminal')}
          className={`px-4 py-2 text-xs font-mono tracking-wider uppercase border-b-2 transition-all ${
            activeTab === 'terminal' ? 'border-neon-purple text-text-bright' : 'border-transparent text-text-muted hover:text-text-bright'
          }`}
        >
          Quantum Attack Console ({attackLogs.length})
        </button>
      </div>

      {activeTab === 'encrypt' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-text-muted font-mono mb-2 uppercase">Sensitive Bank Credential Payload:</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={secretText}
                onChange={(e) => setSecretText(e.target.value)}
                className="cyber-input flex-1 font-mono text-sm"
              />
              <button 
                onClick={handleGenerateNewKeys}
                className="cyber-btn cyber-btn-purple flex items-center gap-1"
                title="Regenerate QPC Keys"
              >
                <RefreshCw className="w-4 h-4" />
                Regen Keys
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <button 
                onClick={handleEncrypt}
                className="w-full cyber-btn flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Encrypt (Lattice LWE)
              </button>
              
              <div className="code-panel h-28 font-mono">
                {encryptedPayload ? (
                  <div>
                    <div className="text-neon-cyan mb-1">[LWE CIPHERTEXT GENERATED]</div>
                    <div>Blocks: {encryptedPayload.length} character packages</div>
                    <div>Sample Block 1 bits coordinates:</div>
                    <div className="overflow-x-auto text-[10px]">
                      {encryptedPayload[0].map((b: any, idx: number) => (
                        <div key={idx}>Bit {idx}: u=[{b.u.slice(0, 4).join(',')},...], v={b.v}</div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className="text-text-muted">Click Encrypt to generate public key lattice noise coefficients.</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <button 
                onClick={handleDecrypt}
                disabled={!encryptedPayload}
                className="w-full cyber-btn cyber-btn-green flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Unlock className="w-4 h-4" />
                Decrypt (Secret Key s)
              </button>
              
              <div className="code-panel h-28 font-mono flex flex-col justify-between">
                <div>
                  <div className="text-neon-green mb-1">[DECRYPTED PLAIN TEXT]</div>
                  <div className="text-sm font-semibold tracking-wide text-text-bright">
                    {decryptedText || <span className="text-text-muted italic">Awaiting decryption decryption equation...</span>}
                  </div>
                </div>
                {decryptedText && (
                  <div className="text-[10px] text-neon-green">
                    ✓ Decryption succeeded. Noise margin validation verified.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shor's Algorithm Simulation Trigger */}
          <div className="pt-2">
            <button 
              onClick={runQuantumAttack}
              disabled={isAttacking}
              className="w-full cyber-btn cyber-btn-red py-3 flex items-center justify-center gap-2"
            >
              <Zap className={`w-4 h-4 ${isAttacking ? 'animate-bounce' : ''}`} />
              {isAttacking ? 'FACTORING RSA COPRIME MODULI...' : `Simulate Quantum Cryptanalysis Attack (Shor's Algorithm)`}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'math' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-mono text-neon-cyan uppercase mb-2">Traditional (RSA / ECC)</h4>
              <div className="p-3 bg-red-950/20 border border-red-500/20 rounded text-xs space-y-2">
                <p><strong>Math Basis:</strong> Integer factorization ($N = p \cdot q$) or discrete logarithms ($y = g^x \pmod p$).</p>
                <p><strong>Quantum Threat:</strong> Shor's Algorithm solves prime factorization in polynomial time $O((\log N)^3)$, making keys completely crackable.</p>
                <div className="text-neon-red font-semibold font-mono text-[10px]">❌ VULNERABLE TO QUANTUM COMPUTERS</div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-mono text-neon-purple uppercase mb-2">Lattice LWE (Kyber / Dilithium)</h4>
              <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded text-xs space-y-2">
                <p><strong>Math Basis:</strong> Solving Shortest Vector Problem (SVP) in high-dimensional vector space lattices ($t = A \cdot s + e$).</p>
                <p><strong>Quantum Resilience:</strong> Adding small error vectors $e$ injects noise. The best quantum algorithm still takes exponential time $O(2^d)$.</p>
                <div className="text-neon-green font-semibold font-mono text-[10px]">✓ QUANTUM-PROOF CRYPTOGRAPHY</div>
              </div>
            </div>
          </div>

          {keyPair && (
            <div className="p-3 bg-bg-secondary border border-border-glow rounded">
              <div className="text-xs font-mono text-neon-purple mb-2 uppercase">Active Lattice Keys Metrics (Dimension N=8, Modulo Q=127):</div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-text-muted">
                <div>Secret Key Vector <code>s</code> (kept private):</div>
                <div className="text-text-bright">[{keyPair.secretKey.join(', ')}]</div>
                <div>Public Key Vector <code>t = A*s + e</code>:</div>
                <div className="text-text-bright">[{keyPair.publicKey.t.join(', ')}]</div>
                <div>Lattice Equations Generator:</div>
                <div className="text-[10px] text-text-muted truncate">A[0]: [{keyPair.publicKey.A[0].join(', ')}]</div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'terminal' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-text-muted font-mono uppercase flex items-center gap-1">
              <TermIcon className="w-3 h-3 text-neon-red" />
              Quantum Simulation Console Output
            </span>
            <button 
              onClick={() => setAttackLogs([])} 
              className="text-[10px] text-text-muted hover:text-text-bright font-mono uppercase"
            >
              Clear Logs
            </button>
          </div>

          <div className="code-panel h-56 font-mono text-left space-y-1 text-xs">
            {attackLogs.map((log, idx) => {
              let colorClass = 'text-text-muted';
              if (log.startsWith('[ATTACK]')) colorClass = 'text-neon-red font-semibold';
              if (log.startsWith('[SYSTEM]')) colorClass = 'text-neon-cyan';
              if (log.startsWith('[CRYPTO]')) colorClass = 'text-neon-purple';
              if (log.includes('CRITICAL ERROR') || log.includes('failed') || log.includes('BLOCKED')) colorClass = 'text-neon-green font-semibold';
              if (log.includes('Compromised') || log.includes('cracked') || log.includes('leaked')) colorClass = 'text-neon-red font-bold pulse-slow';
              
              return (
                <div key={idx} className={colorClass}>
                  {log}
                </div>
              );
            })}
          </div>

          {attackResult && (
            <div className={`p-4 rounded border ${
              attackResult.success 
                ? 'bg-red-950/20 border-red-500/50 text-red-200' 
                : 'bg-green-950/20 border-green-500/50 text-green-200'
            }`}>
              <div className="font-bold flex items-center gap-2 mb-1">
                {attackResult.success ? <ShieldAlert className="text-neon-red" /> : <Shield className="text-neon-green" />}
                {attackResult.success ? 'CRITICAL SYSTEM COMPROMISE' : 'QUANTUM DEFENSE SUCCESSFUL'}
              </div>
              <div className="text-xs">{attackResult.message}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
