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
  managerEmails: []
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

  getSettings: () => db.settings
};
