import { useState, useEffect, useRef } from 'react';
import { Shield, ShieldAlert, Cpu, Brain, Mail, Monitor, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { SOCDashboard } from './components/SOCDashboard';
import { CyberGlobe } from './components/CyberGlobe';
import { ExplainableAI } from './components/ExplainableAI';
import { AIProfile } from './components/AIProfile';
import { QPCManager } from './components/QPCManager';
import { EmailAlerts } from './components/EmailAlerts';
import { AIChatbot } from './components/AIChatbot';
import { playClickSound, playAlarmSound, playSuccessSound, playQuantumSound, toggleMute, getMuteState } from './utils/audio';

// Backend base URL (Vite proxy will route relative /api, but as a fallback we configure a direct url)
const API_BASE = '/api';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profiles' | 'qpc' | 'emails'>('dashboard');
  
  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    quantumSafeActive: true, 
    autoSuspensionThreshold: 85,
    smtpActive: false,
    whatsappActive: false,
    recipientEmail: '',
    recipientWhatsapp: ''
  });
  
  // Interaction states
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [activeLoginEvent, setActiveLoginEvent] = useState<{ fromCity: string; toCity?: string; isThreat: boolean } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Polling ref to clear interval
  const pollTimer = useRef<any>(null);

  const fetchAllData = async () => {
    try {
      const [resUsers, resSessions, resIncidents, resEmails, resSettings] = await Promise.all([
        fetch(`${API_BASE}/users`),
        fetch(`${API_BASE}/sessions`),
        fetch(`${API_BASE}/incidents`),
        fetch(`${API_BASE}/emails`),
        fetch(`${API_BASE}/settings`)
      ]);

      if (resUsers.ok) setUsers(await resUsers.json());
      if (resSessions.ok) setSessions(await resSessions.json());
      if (resIncidents.ok) {
        const incs = await resIncidents.json();
        setIncidents(incs);
        
        // Auto-select the first active incident if none is selected
        if (incs.length > 0 && !selectedIncident) {
          const activeInc = incs.find((i: any) => i.status === 'ACTIVE');
          if (activeInc) setSelectedIncident(activeInc);
        }
      }
      if (resEmails.ok) setEmails(await resEmails.json());
      if (resSettings.ok) setSettings(await resSettings.json());
    } catch (err) {
      console.warn("Failed to fetch state data from backend server.", err);
    }
  };

  useEffect(() => {
    fetchAllData();
    // Poll data every 3 seconds for real-time reactivity
    pollTimer.current = setInterval(fetchAllData, 3000);
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, []);

  // Update selected incident reference if the incidents list updates
  useEffect(() => {
    if (selectedIncident && incidents.length > 0) {
      const updated = incidents.find(i => i.id === selectedIncident.id);
      if (updated) setSelectedIncident(updated);
    }
  }, [incidents]);

  // Actions
  const handleSuspendUser = async (userId: string) => {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/suspend`, { method: 'POST' });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSuspendUserByUsername = async (username: string) => {
    const user = users.find(u => u.username === username);
    if (user) handleSuspendUser(user.id);
  };

  const handleUnsuspendUser = async (userId: string) => {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/unsuspend`, { method: 'POST' });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnsuspendUserByUsername = async (username: string) => {
    const user = users.find(u => u.username === username);
    if (user) handleUnsuspendUser(user.id);
  };

  const handleResolveIncident = async (incidentId: string) => {
    try {
      const res = await fetch(`${API_BASE}/incidents/${incidentId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RESOLVED', mitigation: 'Resolved by Administrator override.' })
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkEmailAsRead = async (emailId: string) => {
    try {
      const res = await fetch(`${API_BASE}/emails/${emailId}/read`, { method: 'POST' });
      if (res.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleQuantumSafe = async () => {
    try {
      const nextMode = !settings.quantumSafeActive;
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantumSafeActive: nextMode })
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated.settings);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Scenario Simulations runner
  const handleTriggerSimulation = async (scenarioType: string) => {
    setIsSimulating(true);
    setActiveTab('dashboard');

    try {
      if (scenarioType === 'NORMAL') {
        playClickSound();
        setActiveLoginEvent({ fromCity: 'Chennai, India', isThreat: false });
        
        await fetch(`${API_BASE}/simulate-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'alice_hr',
            ip: '182.72.196.12',
            location: 'Chennai, India',
            timeString: '09:30',
            device: 'HR-LAPTOP-04',
            downloadedFiles: 2
          })
        });

        setTimeout(() => setActiveLoginEvent(null), 5000);

      } else if (scenarioType === 'OFF_HOURS') {
        playAlarmSound();
        setActiveLoginEvent({ fromCity: 'Chennai, India', isThreat: false });

        await fetch(`${API_BASE}/simulate-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'david_temp',
            ip: '182.72.196.50',
            location: 'Chennai, India',
            timeString: '23:30',
            device: 'DEV-WORKSTATION-12',
            downloadedFiles: 4
          })
        });

        setTimeout(() => setActiveLoginEvent(null), 5000);

      } else if (scenarioType === 'FOREIGN_IP') {
        playAlarmSound();
        setActiveLoginEvent({ fromCity: 'Moscow, Russia', isThreat: true });

        await fetch(`${API_BASE}/simulate-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'bob_dbadmin',
            ip: '82.102.23.45',
            location: 'Moscow, Russia',
            timeString: '03:15',
            device: 'Linux-Admin-Shell',
            downloadedFiles: 18
          })
        });

        setTimeout(() => setActiveLoginEvent(null), 5000);

      } else if (scenarioType === 'EXFILTRATION') {
        playAlarmSound();
        setActiveLoginEvent({ fromCity: 'Chennai, India', isThreat: true });

        await fetch(`${API_BASE}/simulate-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'alice_hr',
            ip: '182.72.196.12',
            location: 'Chennai, India',
            timeString: '14:15',
            device: 'HR-LAPTOP-04',
            downloadedFiles: 500
          })
        });

        setTimeout(() => setActiveLoginEvent(null), 5000);

      } else if (scenarioType === 'IMPOSSIBLE_TRAVEL') {
        // Impossible Travel is a 2-stage event
        // Stage 1: Charlie logs in from Chennai
        playClickSound();
        setActiveLoginEvent({ fromCity: 'Chennai, India', isThreat: false });
        
        await fetch(`${API_BASE}/simulate-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'charlie_vp',
            ip: '182.72.196.22',
            location: 'Chennai, India',
            timeString: '10:45',
            device: 'VP-MACBOOK-PRO',
            downloadedFiles: 1
          })
        });

        await fetchAllData();

        // Stage 2: Wait 3 seconds, then Charlie logs in from London (Impossible travel!)
        setTimeout(async () => {
          playAlarmSound();
          setActiveLoginEvent({ 
            fromCity: 'Chennai, India', 
            toCity: 'London, UK', 
            isThreat: true 
          });

          await fetch(`${API_BASE}/simulate-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: 'charlie_vp',
              ip: '82.102.23.66',
              location: 'London, UK',
              timeString: '10:50', // 5 minutes later
              device: 'VP-IPAD-PRO',
              downloadedFiles: 3
            })
          });

          await fetchAllData();

          // Keep connection line visible on globe for 8s
          setTimeout(() => setActiveLoginEvent(null), 8000);
        }, 3000);
      }

      // Refresh stats
      setTimeout(fetchAllData, 500);
    } catch (err) {
      console.error("Simulation trigger failed", err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Compile user statuses mapping
  const userStatuses: Record<string, string> = {};
  users.forEach(u => {
    userStatuses[u.username] = u.status;
  });

  const unreadEmailsCount = emails.filter(e => e.unread).length;
  const [isMuted, setIsMuted] = useState(getMuteState());

  const handleTabChange = (tab: 'dashboard' | 'profiles' | 'qpc' | 'emails') => {
    playClickSound();
    setActiveTab(tab);
  };

  const handleMuteToggle = () => {
    const nextMuted = toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      // Play a quick test note to confirm unmute
      playClickSound();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent p-6 text-text-bright selection:bg-neon-cyan selection:text-bg-primary">
      
      {/* Top Banner Navigation Header */}
      <header className="cyber-panel p-4 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-950/30 border border-neon-purple/30 rounded flex items-center justify-center">
            <Shield className="w-6 h-6 text-neon-purple animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider font-mono text-glow-cyan text-neon-cyan">
              CYBER_S.BANK // SECURITY SOC
            </h1>
            <div className="text-[10px] font-mono text-text-muted flex items-center gap-1.5 mt-0.5">
              <span className="status-dot bg-neon-green animate-pulse"></span>
              <span>BEHAVIORAL AI & PRIVILEGE ENFORCEMENT ENGINE</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex gap-1.5 items-center">
          <button
            onClick={() => handleTabChange('dashboard')}
            className={`cyber-btn flex items-center gap-1.5 text-xs font-mono ${
              activeTab === 'dashboard' ? 'bg-neon-cyan/15 border-neon-cyan text-text-bright' : 'border-transparent text-text-muted hover:text-text-bright'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            SOC Live Dashboard
          </button>
          
          <button
            onClick={() => handleTabChange('profiles')}
            className={`cyber-btn flex items-center gap-1.5 text-xs font-mono ${
              activeTab === 'profiles' ? 'bg-neon-cyan/15 border-neon-cyan text-text-bright' : 'border-transparent text-text-muted hover:text-text-bright'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            AI Baselines
          </button>

          <button
            onClick={() => handleTabChange('qpc')}
            className={`cyber-btn flex items-center gap-1.5 text-xs font-mono ${
              activeTab === 'qpc' ? 'bg-neon-cyan/15 border-neon-cyan text-text-bright' : 'border-transparent text-text-muted hover:text-text-bright'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Quantum-Safe (QPC)
          </button>

          <button
            onClick={() => handleTabChange('emails')}
            className={`cyber-btn flex items-center gap-1.5 text-xs font-mono relative ${
              activeTab === 'emails' ? 'bg-neon-cyan/15 border-neon-cyan text-text-bright' : 'border-transparent text-text-muted hover:text-text-bright'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Manager Mailbox
            {unreadEmailsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-neon-red border border-bg-primary text-[8px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {unreadEmailsCount}
              </span>
            )}
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={handleMuteToggle}
            className={`cyber-btn border-border-glow p-2 flex items-center justify-center ${
              isMuted ? 'text-neon-red hover:text-neon-cyan' : 'text-neon-green hover:text-neon-red'
            }`}
            title={isMuted ? "Unmute Cyber Soundscape" : "Mute Soundscape"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => { playClickSound(); fetchAllData(); }}
            className="cyber-btn border-border-glow text-text-muted hover:text-neon-cyan p-2 flex items-center justify-center"
            title="Refresh Systems State"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </nav>
      </header>

      {/* Main Tab Routing Layout */}
      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left section: Dashboard list and threat simulation */}
            <div className="lg:col-span-2 space-y-6">
              <SOCDashboard
                users={users}
                sessions={sessions}
                incidents={incidents}
                onTriggerSimulation={handleTriggerSimulation}
                onSuspendUser={(id) => { playClickSound(); handleSuspendUser(id); }}
                onUnsuspendUser={(id) => { playSuccessSound(); handleUnsuspendUser(id); }}
                onResolveIncident={(id) => { playSuccessSound(); handleResolveIncident(id); }}
                onSelectIncident={(inc) => { playClickSound(); setSelectedIncident(inc); }}
                selectedIncidentId={selectedIncident?.id}
                isSimulating={isSimulating}
                settings={settings}
                onRefreshData={fetchAllData}
              />
            </div>

            {/* Right section: Global Globe Map + Explainable AI Info */}
            <div className="space-y-6">
              <CyberGlobe activeLoginEvent={activeLoginEvent} />
              
              <ExplainableAI selectedIncident={selectedIncident} />
            </div>
          </div>
        )}

        {activeTab === 'profiles' && (
          <AIProfile users={users} />
        )}

        {activeTab === 'qpc' && (
          <QPCManager 
            quantumSafeActive={settings.quantumSafeActive} 
            onToggleQuantumSafe={() => {
              playQuantumSound();
              handleToggleQuantumSafe();
            }} 
          />
        )}

        {activeTab === 'emails' && (
          <EmailAlerts
            emails={emails}
            onMarkAsRead={handleMarkEmailAsRead}
            onSuspendUser={(username) => {
              playClickSound();
              handleSuspendUserByUsername(username);
            }}
            onUnsuspendUser={(username) => {
              playSuccessSound();
              handleUnsuspendUserByUsername(username);
            }}
            userStatuses={userStatuses}
          />
        )}
      </main>

      {/* Floating AI Chatbot overlay */}
      <AIChatbot />

      {/* Bottom status bar */}
      <footer className="mt-8 text-center text-[10px] font-mono text-text-muted border-t border-border-glow/30 pt-4 flex justify-between">
        <div>CONNECTED TERMINAL HOST: <span className="text-neon-cyan">CYBER_S.BANK_SOC_04</span></div>
        <div>ENGINE VERSION: <span className="text-neon-purple font-bold">3.4.1-LWE // QUANTUM-PROOF</span></div>
        <div>DEEP LOGS SHIELDING: <span className="text-neon-green">ACTIVE</span></div>
      </footer>
    </div>
  );
}

export default App;
