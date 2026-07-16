// In-memory Database for Cyber's Bank Threat SOC

export const db = {
  // System configurations
  settings: {
    quantumSafeActive: true,
    autoSuspensionThreshold: 85, // Risk score % above which auto-suspension triggers
  },

  // Simulated bank users with normal behavior profiles
  users: [
    {
      id: "usr_alice",
      username: "alice_hr",
      fullName: "Alice Vance",
      role: "HR Director",
      clearanceLevel: "Medium",
      status: "ACTIVE", // ACTIVE or SUSPENDED
      profile: {
        normalLoginTimeStart: 9.0, // 9:00 AM (hours as decimals)
        normalLoginTimeEnd: 18.0, // 6:00 PM
        normalIps: ["182.72.196.12", "182.72.196.13"], // Chennai Corporate IPs
        normalDevices: ["HR-LAPTOP-04", "HR-DESKTOP-01"],
        normalDataScope: ["Employee Records", "Payroll", "Benefits"],
        typicalDownloadsPerSession: 8
      }
    },
    {
      id: "usr_bob",
      username: "bob_dbadmin",
      fullName: "Bob Mercer",
      role: "Database Admin (Privileged)",
      clearanceLevel: "High",
      status: "ACTIVE",
      profile: {
        normalLoginTimeStart: 8.5, // 8:30 AM
        normalLoginTimeEnd: 20.0, // 8:00 PM
        normalIps: ["182.72.196.14", "182.72.196.15"], // Chennai Tech Center
        normalDevices: ["SECURE-ADMIN-01", "SECURE-ADMIN-02"],
        normalDataScope: ["Core Banking DB", "User Credentials", "Transaction Records"],
        typicalDownloadsPerSession: 20
      }
    },
    {
      id: "usr_charlie",
      username: "charlie_vp",
      fullName: "Charlie Zhang",
      role: "VP of Wealth Management",
      clearanceLevel: "Critical",
      status: "ACTIVE",
      profile: {
        normalLoginTimeStart: 7.5, // 7:30 AM
        normalLoginTimeEnd: 22.0, // 10:00 PM
        normalIps: ["182.72.196.22", "182.72.196.23", "203.0.113.88"], // Corporate & Home VPN
        normalDevices: ["VP-MACBOOK-PRO", "VP-IPAD-PRO"],
        normalDataScope: ["High-Net-Worth Portfolio", "Financial Statements"],
        typicalDownloadsPerSession: 15
      }
    },
    {
      id: "usr_david",
      username: "david_temp",
      fullName: "David Miller",
      role: "Contract Developer",
      clearanceLevel: "Low",
      status: "ACTIVE",
      profile: {
        normalLoginTimeStart: 9.0, // 9:00 AM
        normalLoginTimeEnd: 17.5, // 5:30 PM
        normalIps: ["182.72.196.50"], // Vendor Gateway IP
        normalDevices: ["DEV-WORKSTATION-12"],
        normalDataScope: ["Testing Sandbox", "Documentation Wiki"],
        typicalDownloadsPerSession: 5
      }
    }
  ],

  // Live sessions log
  sessions: [],

  // Real-time threat / incident logs
  incidents: [
    {
      id: "inc_001",
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
      userId: "usr_david",
      username: "david_temp",
      ip: "103.88.22.45",
      location: "Mumbai, India",
      riskScore: 45,
      threatType: "Foreign IP Alert",
      explanation: "Login from Mumbai VPN Gateway which is outside normal Vendor Chennai IP block.",
      status: "DISMISSED", // ACTIVE, INVESTIGATING, DISMISSED, RESOLVED
      mitigation: "IP verified via vendor phone callback"
    },
    {
      id: "inc_002",
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
      userId: "usr_bob",
      username: "bob_dbadmin",
      ip: "185.190.140.22",
      location: "Moscow, Russia",
      riskScore: 78,
      threatType: "Anomalous Login Hour & Location",
      explanation: "Access attempt at 3:15 AM from unusual foreign IP (Moscow, Russia) on unauthorized device Linux-Admin-Shell.",
      status: "RESOLVED",
      mitigation: "Session terminated. Mandatory QPC credential rotation forced."
    }
  ],

  // Emails sent to the Bank Manager (for dashboard manager inbox)
  managerEmails: [
    {
      id: "msg_hist_1",
      incidentId: "inc_002",
      from: "cyber-security-engine@cybersbank.com",
      to: "manager@cybersbank.com",
      subject: "[ALERT: 78% RISK] Anomaly Triggered by Bob Mercer (Database Admin)",
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      unread: false,
      riskScore: 78,
      actionTaken: "FLAGGED FOR REVIEW",
      body: `
<h2>CYBER_S.BANK ACCESS INTEGRITY LOG (HISTORIC)</h2>
<hr style="border: 1px solid rgba(0, 243, 255, 0.2);" />
<p><strong>Security Event:</strong> Off-hours access anomaly detected in database administrator account.</p>
<table style="width: 100%; border-collapse: collapse; margin: 15px 0; color: #e2f1ff; font-family: monospace;">
  <tr style="background: rgba(18, 26, 44, 0.5);">
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">User Profile:</td>
    <td style="padding: 8px; border: 1px solid rgba(0, 243, 255, 0.1);">Bob Mercer (bob_dbadmin) - <em>Database Admin (Privileged)</em></td>
  </tr>
  <tr>
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">Risk Rating:</td>
    <td style="padding: 8px; color: #ffaa00; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">78% (HIGH)</td>
  </tr>
  <tr style="background: rgba(18, 26, 44, 0.5);">
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">Location & IP:</td>
    <td style="padding: 8px; border: 1px solid rgba(0, 243, 255, 0.1);">Moscow, Russia (IP: 185.190.140.22)</td>
  </tr>
  <tr>
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">Device Telemetry:</td>
    <td style="padding: 8px; border: 1px solid rgba(0, 243, 255, 0.1);">Linux-Admin-Shell</td>
  </tr>
  <tr style="background: rgba(18, 26, 44, 0.5);">
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">Session Time:</td>
    <td style="padding: 8px; border: 1px solid rgba(0, 243, 255, 0.1);">03:15 AM</td>
  </tr>
  <tr>
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">Exfiltrated Files:</td>
    <td style="padding: 8px; border: 1px solid rgba(0, 243, 255, 0.1);">18 documents</td>
  </tr>
</table>
<h3>AI Behavioural Explanations:</h3>
<ul>
  <li style="margin-bottom: 5px; color: #ffbcbc;">Foreign IP login detected (Moscow, Russia)</li>
  <li style="margin-bottom: 5px; color: #ffbcbc;">Login outside office hours (Attempted: 03:15)</li>
  <li style="margin-bottom: 5px; color: #ffbcbc;">Access from unauthorized device (Linux-Admin-Shell)</li>
</ul>
<div style="margin-top: 20px; border-top: 1px dashed rgba(0, 243, 255, 0.2); padding-top: 15px;">
  <strong>DEFENSIVE REMEDIATION ACTION TAKEN:</strong><br/>
  <span style="color: #ffaa00; font-weight: bold;">[FLAGGED FOR REVIEW]</span>
</div>
      `,
      metadata: {
        username: "bob_dbadmin",
        fullName: "Bob Mercer",
        role: "Database Admin (Privileged)",
        ip: "185.190.140.22",
        location: "Moscow, Russia",
        device: "Linux-Admin-Shell",
        downloadedFiles: 18
      }
    },
    {
      id: "msg_hist_2",
      incidentId: "inc_001",
      from: "cyber-security-engine@cybersbank.com",
      to: "manager@cybersbank.com",
      subject: "[ALERT: 45% RISK] Anomaly Triggered by David Miller (Contractor)",
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      unread: false,
      riskScore: 45,
      actionTaken: "FLAGGED FOR REVIEW",
      body: `
<h2>CYBER_S.BANK ACCESS INTEGRITY LOG (HISTORIC)</h2>
<hr style="border: 1px solid rgba(0, 243, 255, 0.2);" />
<p><strong>Security Event:</strong> Minor location shift detected in temporary developer account.</p>
<table style="width: 100%; border-collapse: collapse; margin: 15px 0; color: #e2f1ff; font-family: monospace;">
  <tr style="background: rgba(18, 26, 44, 0.5);">
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">User Profile:</td>
    <td style="padding: 8px; border: 1px solid rgba(0, 243, 255, 0.1);">David Miller (david_temp) - <em>Contract Developer</em></td>
  </tr>
  <tr>
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">Risk Rating:</td>
    <td style="padding: 8px; color: #ffaa00; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">45% (MEDIUM)</td>
  </tr>
  <tr style="background: rgba(18, 26, 44, 0.5);">
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">Location & IP:</td>
    <td style="padding: 8px; border: 1px solid rgba(0, 243, 255, 0.1);">Mumbai, India (IP: 103.88.22.45)</td>
  </tr>
  <tr>
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">Device Telemetry:</td>
    <td style="padding: 8px; border: 1px solid rgba(0, 243, 255, 0.1);">DEV-WORKSTATION-12</td>
  </tr>
  <tr style="background: rgba(18, 26, 44, 0.5);">
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">Session Time:</td>
    <td style="padding: 8px; border: 1px solid rgba(0, 243, 255, 0.1);">11:30 PM</td>
  </tr>
  <tr>
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">Exfiltrated Files:</td>
    <td style="padding: 8px; border: 1px solid rgba(0, 243, 255, 0.1);">2 documents</td>
  </tr>
</table>
<h3>AI Behavioural Explanations:</h3>
<ul>
  <li style="margin-bottom: 5px; color: #ffbcbc;">Login from Mumbai VPN Gateway which is outside normal Vendor Chennai IP block.</li>
</ul>
<div style="margin-top: 20px; border-top: 1px dashed rgba(0, 243, 255, 0.2); padding-top: 15px;">
  <strong>DEFENSIVE REMEDIATION ACTION TAKEN:</strong><br/>
  <span style="color: #ffaa00; font-weight: bold;">[FLAGGED FOR REVIEW]</span>
</div>
      `,
      metadata: {
        username: "david_temp",
        fullName: "David Miller",
        role: "Contract Developer",
        ip: "103.88.22.45",
        location: "Mumbai, India",
        device: "DEV-WORKSTATION-12",
        downloadedFiles: 2
      }
    }
  ]
};

// Database helper functions
export const dbHelpers = {
  getUsers: () => db.users,
  getUserById: (id) => db.users.find(u => u.id === id),
  getUserByUsername: (username) => db.users.find(u => u.username === username),
  
  suspendUser: (id) => {
    const user = db.users.find(u => u.id === id);
    if (user) {
      user.status = "SUSPENDED";
      return true;
    }
    return false;
  },

  unsuspendUser: (id) => {
    const user = db.users.find(u => u.id === id);
    if (user) {
      user.status = "ACTIVE";
      return true;
    }
    return false;
  },

  addSession: (session) => {
    db.sessions.unshift(session);
    if (db.sessions.length > 50) db.sessions.pop(); // Keep last 50
  },

  addIncident: (incident) => {
    db.incidents.unshift(incident);
    if (db.incidents.length > 50) db.incidents.pop(); // Keep last 50
  },

  getIncidents: () => db.incidents,
  
  updateIncidentStatus: (id, status, mitigation = "") => {
    const incident = db.incidents.find(i => i.id === id);
    if (incident) {
      incident.status = status;
      if (mitigation) incident.mitigation = mitigation;
      return true;
    }
    return false;
  },

  addManagerEmail: (email) => {
    db.managerEmails.unshift(email);
    if (db.managerEmails.length > 50) db.managerEmails.pop();
  },

  getManagerEmails: () => db.managerEmails,
  
  updateSettings: (newSettings) => {
    db.settings = { ...db.settings, ...newSettings };
    return db.settings;
  },

  getSettings: () => db.settings,

  resetDb: () => {
    db.users.forEach(u => {
      u.status = "ACTIVE";
    });
    db.sessions = [];
    db.incidents = [];
    db.settings = {
      quantumSafeActive: true,
      autoSuspensionThreshold: 85
    };
    db.managerEmails = [
      {
        id: "msg_hist_1",
        incidentId: "inc_002",
        from: "cyber-security-engine@cybersbank.com",
        to: "manager@cybersbank.com",
        subject: "[ALERT: 78% RISK] Anomaly Triggered by Bob Mercer (Database Admin)",
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        unread: false,
        riskScore: 78,
        actionTaken: "FLAGGED FOR REVIEW",
        body: `
<h2>CYBER_S.BANK ACCESS INTEGRITY LOG (HISTORIC)</h2>
<hr style="border: 1px solid rgba(0, 243, 255, 0.2);" />
<p><strong>Security Event:</strong> Off-hours access anomaly detected in database administrator account.</p>
<table style="width: 100%; border-collapse: collapse; margin: 15px 0; color: #e2f1ff; font-family: monospace;">
  <tr style="background: rgba(18, 26, 44, 0.5);">
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">User Profile:</td>
    <td style="padding: 8px; border: 1px solid rgba(0, 243, 255, 0.1);">Bob Mercer (bob_dbadmin) - <em>Database Admin (Privileged)</em></td>
  </tr>
  <tr>
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">Risk Rating:</td>
    <td style="padding: 8px; color: #ffaa00; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">78% (HIGH)</td>
  </tr>
  <tr style="background: rgba(18, 26, 44, 0.5);">
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">Location & IP:</td>
    <td style="padding: 8px; border: 1px solid rgba(0, 243, 255, 0.1);">Moscow, Russia (IP: 185.190.140.22)</td>
  </tr>
  <tr>
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">Device Telemetry:</td>
    <td style="padding: 8px; border: 1px solid rgba(0, 243, 255, 0.1);">Linux-Admin-Shell</td>
  </tr>
  <tr style="background: rgba(18, 26, 44, 0.5);">
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">Session Time:</td>
    <td style="padding: 8px; border: 1px solid rgba(0, 243, 255, 0.1);">03:15 AM</td>
  </tr>
  <tr>
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">Exfiltrated Files:</td>
    <td style="padding: 8px; border: 1px solid rgba(0, 243, 255, 0.1);">18 documents</td>
  </tr>
</table>
<h3>AI Behavioural Explanations:</h3>
<ul>
  <li style="margin-bottom: 5px; color: #ffbcbc;">Foreign IP login detected (Moscow, Russia)</li>
  <li style="margin-bottom: 5px; color: #ffbcbc;">Login outside office hours (Attempted: 03:15)</li>
  <li style="margin-bottom: 5px; color: #ffbcbc;">Access from unauthorized device (Linux-Admin-Shell)</li>
</ul>
<div style="margin-top: 20px; border-top: 1px dashed rgba(0, 243, 255, 0.2); padding-top: 15px;">
  <strong>DEFENSIVE REMEDIATION ACTION TAKEN:</strong><br/>
  <span style="color: #ffaa00; font-weight: bold;">[FLAGGED FOR REVIEW]</span>
</div>
        `,
        metadata: {
          username: "bob_dbadmin",
          fullName: "Bob Mercer",
          role: "Database Admin (Privileged)",
          ip: "185.190.140.22",
          location: "Moscow, Russia",
          device: "Linux-Admin-Shell",
          downloadedFiles: 18
        }
      },
      {
        id: "msg_hist_2",
        incidentId: "inc_001",
        from: "cyber-security-engine@cybersbank.com",
        to: "manager@cybersbank.com",
        subject: "[ALERT: 45% RISK] Anomaly Triggered by David Miller (Contractor)",
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        unread: false,
        riskScore: 45,
        actionTaken: "FLAGGED FOR REVIEW",
        body: `
<h2>CYBER_S.BANK ACCESS INTEGRITY LOG (HISTORIC)</h2>
<hr style="border: 1px solid rgba(0, 243, 255, 0.2);" />
<p><strong>Security Event:</strong> Minor location shift detected in temporary developer account.</p>
<table style="width: 100%; border-collapse: collapse; margin: 15px 0; color: #e2f1ff; font-family: monospace;">
  <tr style="background: rgba(18, 26, 44, 0.5);">
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">User Profile:</td>
    <td style="padding: 8px; border: 1px solid rgba(0, 243, 255, 0.1);">David Miller (david_temp) - <em>Contract Developer</em></td>
  </tr>
  <tr>
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">Risk Rating:</td>
    <td style="padding: 8px; color: #ffaa00; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">45% (MEDIUM)</td>
  </tr>
  <tr style="background: rgba(18, 26, 44, 0.5);">
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">Location & IP:</td>
    <td style="padding: 8px; border: 1px solid rgba(0, 243, 255, 0.1);">Mumbai, India (IP: 103.88.22.45)</td>
  </tr>
  <tr>
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">Device Telemetry:</td>
    <td style="padding: 8px; border: 1px solid rgba(0, 243, 255, 0.1);">DEV-WORKSTATION-12</td>
  </tr>
  <tr style="background: rgba(18, 26, 44, 0.5);">
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">Session Time:</td>
    <td style="padding: 8px; border: 1px solid rgba(0, 243, 255, 0.1);">11:30 PM</td>
  </tr>
  <tr>
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">Exfiltrated Files:</td>
    <td style="padding: 8px; border: 1px solid rgba(0, 243, 255, 0.1);">2 documents</td>
  </tr>
</table>
<h3>AI Behavioural Explanations:</h3>
<ul>
  <li style="margin-bottom: 5px; color: #ffbcbc;">Login from Mumbai VPN Gateway which is outside normal Vendor Chennai IP block.</li>
</ul>
<div style="margin-top: 20px; border-top: 1px dashed rgba(0, 243, 255, 0.2); padding-top: 15px;">
  <strong>DEFENSIVE REMEDIATION ACTION TAKEN:</strong><br/>
  <span style="color: #ffaa00; font-weight: bold;">[FLAGGED FOR REVIEW]</span>
</div>
        `,
        metadata: {
          username: "david_temp",
          fullName: "David Miller",
          role: "Contract Developer",
          ip: "103.88.22.45",
          location: "Mumbai, India",
          device: "DEV-WORKSTATION-12",
          downloadedFiles: 2
        }
      }
    ];
    return true;
  }
};
