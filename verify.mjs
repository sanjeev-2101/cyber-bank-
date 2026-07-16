// Verification test suite for CYBER_S.BANK SOC API
const BASE = 'http://localhost:5000';

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  return res.json();
}

async function runTests() {
  console.log('\n' + '='.repeat(70));
  console.log('  CYBER_S.BANK SOC - AUTOMATED VERIFICATION SUITE');
  console.log('='.repeat(70));

  // Reset database to active state
  await post('/api/reset', {});

  // ---- TEST 1: Normal Login ----
  console.log('\n[TEST 1] Normal Login — Alice / Chennai / 9:30 AM');
  const r1 = await post('/api/simulate-login', {
    username: 'alice_hr', ip: '182.72.196.12', location: 'Chennai, India',
    timeString: '09:30', device: 'HR-LAPTOP-04', downloadedFiles: 2
  });
  console.log(`  Risk Score : ${r1.riskScore}%`);
  console.log(`  Auto-Suspended : ${r1.autoSuspended}`);
  console.log(`  Email Alert : ${r1.emailAlertSent}`);
  console.log(`  STATUS : ${r1.riskScore === 0 ? '✅ PASS (Clean Login)' : '⚠️ Unexpected risk'}`);

  // ---- TEST 2: Off-Hours Login ----
  console.log('\n[TEST 2] Off-Hours Contractor — David / Chennai / 11:30 PM');
  const r2 = await post('/api/simulate-login', {
    username: 'david_temp', ip: '182.72.196.50', location: 'Chennai, India',
    timeString: '23:30', device: 'DEV-WORKSTATION-12', downloadedFiles: 4
  });
  console.log(`  Risk Score : ${r2.riskScore}%`);
  console.log(`  Reasons : ${r2.reasons?.join(' | ')}`);
  console.log(`  STATUS : ${r2.riskScore > 0 ? '✅ PASS (Off-Hours Detected)' : '❌ FAIL'}`);

  // ---- TEST 3: Foreign IP + Off-Hours ----
  console.log('\n[TEST 3] Foreign IP + Off-Hours — Bob / Moscow / 3:15 AM');
  const r3 = await post('/api/simulate-login', {
    username: 'bob_dbadmin', ip: '82.102.23.45', location: 'Moscow, Russia',
    timeString: '03:15', device: 'Linux-Admin-Shell', downloadedFiles: 18
  });
  console.log(`  Risk Score : ${r3.riskScore}%`);
  console.log(`  Email Alert Dispatched : ${r3.emailAlertSent}`);
  console.log(`  Reasons : ${r3.reasons?.join(' | ')}`);
  console.log(`  STATUS : ${r3.riskScore >= 50 ? '✅ PASS (Foreign IP Flagged)' : '❌ FAIL'}`);

  // ---- TEST 4: Impossible Travel ----
  console.log('\n[TEST 4a] Impossible Travel Stage 1 — Charlie / Chennai / 10:45');
  const r4a = await post('/api/simulate-login', {
    username: 'charlie_vp', ip: '182.72.196.22', location: 'Chennai, India',
    timeString: '10:45', device: 'VP-MACBOOK-PRO', downloadedFiles: 1
  });
  console.log(`  Risk Score : ${r4a.riskScore}% (baseline - should be low)`);

  console.log('\n[TEST 4b] Impossible Travel Stage 2 — Charlie / London / 10:50 (5 min later!!)');
  const r4b = await post('/api/simulate-login', {
    username: 'charlie_vp', ip: '82.102.23.66', location: 'London, UK',
    timeString: '10:50', device: 'VP-IPAD-PRO', downloadedFiles: 3
  });
  console.log(`  Risk Score : ${r4b.riskScore}%`);
  console.log(`  Auto-Suspended : ${r4b.autoSuspended}`);
  console.log(`  Email Alert : ${r4b.emailAlertSent}`);
  console.log(`  Reasons : ${r4b.reasons?.join(' | ')}`);
  console.log(`  STATUS : ${r4b.riskScore >= 85 ? '✅ PASS (Impossible Travel Detected + Auto-Suspended)' : '❌ FAIL'}`);

  // ---- TEST 5: Data Exfiltration ----
  console.log('\n[TEST 5] Data Exfiltration — Alice / 500 file bulk download');
  const r5 = await post('/api/simulate-login', {
    username: 'alice_hr', ip: '182.72.196.12', location: 'Chennai, India',
    timeString: '14:15', device: 'HR-LAPTOP-04', downloadedFiles: 500
  });
  console.log(`  Risk Score : ${r5.riskScore}%`);
  console.log(`  Email Alert : ${r5.emailAlertSent}`);
  console.log(`  Reasons : ${r5.reasons?.join(' | ')}`);
  console.log(`  STATUS : ${r5.riskScore >= 50 ? '✅ PASS (Bulk Exfiltration Detected)' : '❌ FAIL'}`);

  // ---- SUMMARY CHECKS ----
  console.log('\n' + '='.repeat(70));
  console.log('  POST-TEST SYSTEM STATE');
  console.log('='.repeat(70));

  const emails = await get('/api/emails');
  console.log(`\n📧 Manager Email Alerts Sent : ${emails.length}`);
  emails.forEach(e => console.log(`  → ${e.subject}`));

  const incidents = await get('/api/incidents');
  console.log(`\n🚨 Security Incidents Logged : ${incidents.length}`);
  incidents.slice(0, 5).forEach(i => console.log(`  → [${i.status}] ${i.threatType} (${i.riskScore}% risk)`));

  const users = await get('/api/users');
  console.log('\n👤 User Account Statuses:');
  users.forEach(u => {
    const icon = u.status === 'SUSPENDED' ? '🔴 SUSPENDED' : '🟢 ACTIVE';
    console.log(`  ${icon} — ${u.fullName} (${u.role})`);
  });

  console.log('\n' + '='.repeat(70));
  console.log('  ALL VERIFICATION TESTS COMPLETE');
  console.log('='.repeat(70) + '\n');
}

runTests().catch(console.error);
