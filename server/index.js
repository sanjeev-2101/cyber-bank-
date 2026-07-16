import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { db, dbHelpers } from './db.js';
import { ThreatDetector } from './threatDetector.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);
  next();
});

// 1. GET User Directory
app.get('/api/users', (req, res) => {
  res.json(dbHelpers.getUsers());
});

// 2. POST Suspend User Account
app.post('/api/users/:id/suspend', (req, res) => {
  const { id } = req.params;
  const success = dbHelpers.suspendUser(id);
  if (success) {
    console.log(`[PAM OVERRIDE] Account ${id} manually SUSPENDED.`);
    res.json({ success: true, message: "User account suspended successfully." });
  } else {
    res.status(404).json({ success: false, error: "User not found." });
  }
});

// 3. POST Activate/Unsuspend User Account
app.post('/api/users/:id/unsuspend', (req, res) => {
  const { id } = req.params;
  const success = dbHelpers.unsuspendUser(id);
  if (success) {
    console.log(`[PAM OVERRIDE] Account ${id} manually ACTIVATED.`);
    res.json({ success: true, message: "User account reactivated successfully." });
  } else {
    res.status(404).json({ success: false, error: "User not found." });
  }
});

// 4. GET Security Incidents Logs
app.get('/api/incidents', (req, res) => {
  res.json(dbHelpers.getIncidents());
});

// 5. POST Update Incident Status
app.post('/api/incidents/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, mitigation } = req.body;
  const success = dbHelpers.updateIncidentStatus(id, status, mitigation);
  if (success) {
    res.json({ success: true, message: "Incident status updated." });
  } else {
    res.status(404).json({ success: false, error: "Incident not found." });
  }
});

// 6. GET Login Sessions Log
app.get('/api/sessions', (req, res) => {
  res.json(db.sessions);
});

// 7. GET Bank Manager Inbox
app.get('/api/emails', (req, res) => {
  res.json(dbHelpers.getManagerEmails());
});

// 8. POST Mark Email Alert as Read
app.post('/api/emails/:id/read', (req, res) => {
  const { id } = req.params;
  const email = db.managerEmails.find(e => e.id === id);
  if (email) {
    email.unread = false;
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, error: "Email not found." });
  }
});

// 9. GET SOC Settings
app.get('/api/settings', (req, res) => {
  const settings = dbHelpers.getSettings();
  res.json({
    ...settings,
    smtpActive: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
    whatsappActive: !!(process.env.TWILIO_ACCOUNT_SID && process.env.ALERT_RECIPIENT_WHATSAPP && process.env.ALERT_RECIPIENT_WHATSAPP !== '+91XXXXXXXXXX'),
    recipientEmail: process.env.ALERT_RECIPIENT_EMAIL || 'sanjeevkumarnagarajan2@gmail.com',
    recipientWhatsapp: process.env.ALERT_RECIPIENT_WHATSAPP || '+91XXXXXXXXXX'
  });
});

// 10. POST Update SOC Settings
app.post('/api/settings', (req, res) => {
  const newSettings = dbHelpers.updateSettings(req.body);
  res.json({ success: true, settings: newSettings });
});

// Reset database endpoint
app.post('/api/reset', (req, res) => {
  dbHelpers.resetDb();
  console.log('[SYSTEM RESET] Database and security records restored to defaults.');
  res.json({ success: true, message: "System database reset successfully." });
});

// Ingest and audit Kaggle login security dataset
app.post('/api/audit-kaggle', async (req, res) => {
  try {
    // Reset DB state first to allow clean evaluation of logins
    dbHelpers.resetDb();

    console.log('[AUDIT PROCESS] Ingesting Kaggle Login Events security log database...');
    const rawData = fs.readFileSync('./kaggle_logins.json', 'utf8');
    const logins = JSON.parse(rawData);

    const report = [];
    let anomaliesCount = 0;
    let suspensionsCount = 0;

    for (const login of logins) {
      // Evaluate login against core AI engine
      const evalResult = ThreatDetector.evaluateLogin(
        login.username,
        login.ip,
        login.location,
        login.timeString,
        login.device,
        login.downloadedFiles
      );

      if (evalResult.success) {
        const isAnomalous = evalResult.riskScore >= 40;
        if (isAnomalous) anomaliesCount++;
        if (evalResult.autoSuspended) suspensionsCount++;

        report.push({
          username: login.username,
          location: login.location,
          timeString: login.timeString,
          riskScore: evalResult.riskScore,
          isThreat: isAnomalous,
          reasons: evalResult.reasons,
          actionTaken: evalResult.autoSuspended ? "AUTO-SUSPENDED" : (isAnomalous ? "FLAGGED FOR REVIEW" : "NONE"),
          emailAlertSent: evalResult.emailAlertSent
        });
      } else {
        // If user already suspended by previous step, log authentication block
        report.push({
          username: login.username,
          location: login.location,
          timeString: login.timeString,
          riskScore: 100,
          isThreat: true,
          reasons: [evalResult.error || "Authentication blocked. User account is suspended."],
          actionTaken: "BLOCKED",
          emailAlertSent: false
        });
      }
    }

    console.log(`[AUDIT COMPLETED] Scanned ${logins.length} login logs. Detected ${anomaliesCount} anomalies. Triggered ${suspensionsCount} auto-suspensions.`);

    res.json({
      success: true,
      scannedCount: logins.length,
      anomaliesCount,
      suspensionsCount,
      report
    });
  } catch (err) {
    console.error('[AUDIT FAILURE] Failed to execute Kaggle logs audit scanner.', err);
    res.status(500).json({ success: false, error: "Failed to parse Kaggle dataset logs." });
  }
});

// 11. POST Simulate Login (Runs behavioral check)
app.post('/api/simulate-login', (req, res) => {
  const { username, ip, location, timeString, device, downloadedFiles } = req.body;
  
  if (!username || !ip || !location || !timeString || !device) {
    return res.status(400).json({ 
      success: false, 
      error: "Missing required parameters: username, ip, location, timeString, device" 
    });
  }

  const result = ThreatDetector.evaluateLogin(username, ip, location, timeString, device, downloadedFiles);
  res.json(result);
});

// 12. POST Quantum-Proof Cryptographic Verification simulation
app.post('/api/qpc/secure-credentials', (req, res) => {
  const { publicKey, ciphertext, signature, documentId, isQuantumAttack } = req.body;
  const settings = dbHelpers.getSettings();

  if (isQuantumAttack) {
    if (settings.quantumSafeActive) {
      console.log(`[QPC ALERT] Simulated quantum attack BLOCKED using Lattice-Based Cryptography.`);
      return res.json({
        success: true,
        protected: true,
        message: "Simulated Quantum Attack (Shor's Algorithm) failed. Lattice structure vectors remain un-factored due to random error vector noise.",
        logs: [
          "Attacker initiated Shor's factoring algorithm...",
          "Traditional RSA-4096 / ECC Prime256v1 private keys cracked in 0.02s.",
          "Target file requires Lattice Cryptography (Kyber/Dilithium).",
          "Attempting to solve shortest vector problem (SVP) in 512 dimensions...",
          "Lattice dimension space size: 2^256 states required.",
          "Attack blocked. Decryption error threshold exceeded."
        ]
      });
    } else {
      console.log(`[SECURITY COMPROMISE] Simulated quantum attack CRACKED credentials (QPC Disabled!).`);
      return res.json({
        success: false,
        protected: false,
        message: "Security Compromised! Traditional credentials cracked by Shor's algorithm. High clearance bank manager credentials exfiltrated.",
        logs: [
          "Attacker initiated Shor's factoring algorithm...",
          "Traditional RSA-4096 / ECC Prime256v1 private keys cracked in 0.02s.",
          "Post-Quantum Cryptography is DISABLED.",
          "Credentials decrypted successfully.",
          "Access granted to banking root credentials database."
        ]
      });
    }
  }

  // Normal request
  res.json({
    success: true,
    protected: settings.quantumSafeActive,
    message: settings.quantumSafeActive 
      ? "Credentials verified successfully using post-quantum lattice-based signature (Dilithium) and keys exchanged via lattice noise (Kyber)."
      : "Credentials verified successfully using standard RSA-4096 signature. WARNING: Susceptible to post-quantum decryption.",
    logs: [
      `Validating cryptographic packaging for item: ${documentId}`,
      settings.quantumSafeActive ? "Post-Quantum Cryptography: ENABLED (Kyber/Dilithium)" : "Post-Quantum Cryptography: DISABLED (Standard RSA/ECC)",
      "Signature verified successfully."
    ]
  });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`CYBER'S BANK PAM & INSIDER THREAT DETECTOR BACKEND STARTED`);
  console.log(`Server listening on port: ${PORT}`);
  console.log(`======================================================\n`);
});
