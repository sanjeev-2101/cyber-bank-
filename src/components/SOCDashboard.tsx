import React from 'react';
import { Shield, ShieldAlert, Users, Activity, Play, AlertOctagon, UserX, UserCheck, CheckCircle, Info } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  role: string;
  clearanceLevel: string;
  status: string;
}

interface LogSession {
  id: string;
  username: string;
  fullName: string;
  role: string;
  ip: string;
  location: string;
  timeString: string;
  device: string;
  downloadedFiles: number;
  riskScore: number;
  status: string;
  timestamp: string;
}

interface Incident {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  ip: string;
  location: string;
  riskScore: number;
  threatType: string;
  explanation: string;
  status: string;
  mitigation: string;
}

interface SOCDashboardProps {
  users: UserProfile[];
  sessions: LogSession[];
  incidents: Incident[];
  onTriggerSimulation: (scenarioType: string) => void;
  onSuspendUser: (id: string) => void;
  onUnsuspendUser: (id: string) => void;
  onResolveIncident: (id: string) => void;
  onSelectIncident: (incident: any) => void;
  selectedIncidentId?: string;
  isSimulating: boolean;
}

export const SOCDashboard: React.FC<SOCDashboardProps> = ({
  users,
  sessions,
  incidents,
  onTriggerSimulation,
  onSuspendUser,
  onUnsuspendUser,
  onResolveIncident,
  onSelectIncident,
  selectedIncidentId,
  isSimulating
}) => {

  const getRiskBadgeColor = (score: number) => {
    if (score >= 75) return 'bg-red-950/40 text-neon-red border-red-500/30';
    if (score >= 40) return 'bg-amber-950/40 text-neon-amber border-amber-500/30';
    return 'bg-green-950/40 text-neon-green border-green-500/30';
  };

  const activeThreatsCount = incidents.filter(i => i.status === 'ACTIVE').length;
  const avgRisk = sessions.length > 0 
    ? Math.round(sessions.reduce((sum, s) => sum + s.riskScore, 0) / sessions.length) 
    : 12;

  const totalSuspended = users.filter(u => u.status === 'SUSPENDED').length;

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="cyber-panel flex items-center justify-between p-4">
          <div>
            <div className="text-xs font-mono text-text-muted uppercase">ACTIVE THREATS</div>
            <div className={`text-2xl font-bold font-mono mt-1 ${activeThreatsCount > 0 ? 'text-neon-red text-glow-red animate-pulse' : 'text-neon-green'}`}>
              {activeThreatsCount}
            </div>
          </div>
          <ShieldAlert className={activeThreatsCount > 0 ? 'text-neon-red w-8 h-8' : 'text-neon-green w-8 h-8'} />
        </div>

        <div className="cyber-panel flex items-center justify-between p-4">
          <div>
            <div className="text-xs font-mono text-text-muted uppercase">AVERAGE RISK RATING</div>
            <div className="text-2xl font-bold font-mono mt-1 text-neon-cyan text-glow-cyan">
              {avgRisk}%
            </div>
          </div>
          <Activity className="text-neon-cyan w-8 h-8" />
        </div>

        <div className="cyber-panel flex items-center justify-between p-4">
          <div>
            <div className="text-xs font-mono text-text-muted uppercase">TOTAL MONITORED USERS</div>
            <div className="text-2xl font-bold font-mono mt-1 text-neon-purple text-glow-purple">
              {users.length}
            </div>
          </div>
          <Users className="text-neon-purple w-8 h-8" />
        </div>

        <div className="cyber-panel flex items-center justify-between p-4">
          <div>
            <div className="text-xs font-mono text-text-muted uppercase">ACCOUNTS SUSPENDED</div>
            <div className="text-2xl font-bold font-mono mt-1 text-neon-red">
              {totalSuspended}
            </div>
          </div>
          <Shield className="text-neon-amber w-8 h-8" />
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Scenario Simulator Center */}
        <div className="col-span-2 cyber-panel flex flex-col justify-between">
          <div>
            <div className="cyber-panel-header">
              <div className="cyber-panel-title">
                <Play className="text-glow-cyan text-neon-cyan" />
                Insider Threat Threat Vector Simulator
              </div>
            </div>

            <p className="text-xs text-text-muted mb-4">
              Trigger real-time bank operational scenarios to test how our AI behavioral analytics engine scores, maps travel telemetry, and flags privileged account abuse.
            </p>

            <div className="space-y-3">
              <button 
                onClick={() => onTriggerSimulation('NORMAL')}
                disabled={isSimulating}
                className="w-full flex items-center justify-between p-2.5 bg-bg-secondary/40 hover:bg-bg-tertiary border border-border-glow rounded text-left transition-all group"
              >
                <div className="max-w-[75%]">
                  <div className="text-xs font-bold text-neon-green font-mono">1. Normal HR Employee login</div>
                  <div className="text-[10px] text-text-muted mt-0.5">Alice logs in at 9:30 AM from Chennai Corporate Desktop. Normal files downloaded.</div>
                </div>
                <span className="text-[10px] font-mono border border-neon-green/30 text-neon-green px-1.5 py-0.5 rounded group-hover:bg-neon-green/10 transition-colors">
                  0% Risk
                </span>
              </button>

              <button 
                onClick={() => onTriggerSimulation('OFF_HOURS')}
                disabled={isSimulating}
                className="w-full flex items-center justify-between p-2.5 bg-bg-secondary/40 hover:bg-bg-tertiary border border-border-glow rounded text-left transition-all group"
              >
                <div className="max-w-[75%]">
                  <div className="text-xs font-bold text-neon-amber font-mono">2. Off-Hours Developer Access</div>
                  <div className="text-[10px] text-text-muted mt-0.5">Contractor David logs in at 11:30 PM. Triggering anomalous time warnings.</div>
                </div>
                <span className="text-[10px] font-mono border border-neon-amber/30 text-neon-amber px-1.5 py-0.5 rounded group-hover:bg-neon-amber/10 transition-colors">
                  ~35% Risk
                </span>
              </button>

              <button 
                onClick={() => onTriggerSimulation('FOREIGN_IP')}
                disabled={isSimulating}
                className="w-full flex items-center justify-between p-2.5 bg-bg-secondary/40 hover:bg-bg-tertiary border border-border-glow rounded text-left transition-all group"
              >
                <div className="max-w-[75%]">
                  <div className="text-xs font-bold text-neon-amber font-mono">3. Unusual Device & Foreign IP</div>
                  <div className="text-[10px] text-text-muted mt-0.5">Bob logs in at 3:15 AM from Moscow, Russia. Trigger email dispatch.</div>
                </div>
                <span className="text-[10px] font-mono border border-neon-amber/30 text-neon-amber px-1.5 py-0.5 rounded group-hover:bg-neon-amber/10 transition-colors">
                  ~70% Risk
                </span>
              </button>

              <button 
                onClick={() => onTriggerSimulation('IMPOSSIBLE_TRAVEL')}
                disabled={isSimulating}
                className="w-full flex items-center justify-between p-2.5 bg-bg-secondary/40 hover:bg-bg-tertiary border border-border-glow rounded text-left transition-all group"
              >
                <div className="max-w-[75%]">
                  <div className="text-xs font-bold text-neon-red font-mono">4. Impossible Travel (Chennai to London)</div>
                  <div className="text-[10px] text-text-muted mt-0.5">Charlie logs in from Chennai, then 5 mins later from London. Forces auto-lockout.</div>
                </div>
                <span className="text-[10px] font-mono border border-neon-red/30 text-neon-red px-1.5 py-0.5 rounded group-hover:bg-neon-red/10 transition-colors pulse-slow">
                  95% Risk
                </span>
              </button>

              <button 
                onClick={() => onTriggerSimulation('EXFILTRATION')}
                disabled={isSimulating}
                className="w-full flex items-center justify-between p-2.5 bg-bg-secondary/40 hover:bg-bg-tertiary border border-border-glow rounded text-left transition-all group"
              >
                <div className="max-w-[75%]">
                  <div className="text-xs font-bold text-neon-red font-mono">5. Privileged Data Bulk Download</div>
                  <div className="text-[10px] text-text-muted mt-0.5">Alice attempts to bulk download 500 documents (Baseline norm is 8).</div>
                </div>
                <span className="text-[10px] font-mono border border-neon-red/30 text-neon-red px-1.5 py-0.5 rounded group-hover:bg-neon-red/10 transition-colors">
                  ~80% Risk
                </span>
              </button>
            </div>
          </div>

          <div className="mt-4 p-2 bg-bg-secondary border border-border-glow/60 rounded text-[10px] text-text-muted font-mono flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-neon-cyan flex-shrink-0" />
            <span>Clicking triggers auto-submits login telemetry packets to our local backend server.</span>
          </div>
        </div>

        {/* Live Active Threats List */}
        <div className="col-span-3 cyber-panel flex flex-col h-[382px]">
          <div className="cyber-panel-header">
            <div className="cyber-panel-title">
              <AlertOctagon className="text-glow-red text-neon-red animate-pulse" />
              Real-Time Security Incident Center
            </div>
          </div>

          <div className="overflow-y-auto space-y-2 pr-1 flex-1">
            {incidents.length === 0 ? (
              <div className="text-center text-xs text-text-muted py-24">
                No active threat incidents.
              </div>
            ) : (
              incidents.map((inc) => {
                const isSelected = selectedIncidentId === inc.id;
                return (
                  <div 
                    key={inc.id}
                    onClick={() => onSelectIncident(inc)}
                    className={`p-3 rounded border text-left cursor-pointer transition-all flex justify-between items-center ${
                      isSelected 
                        ? 'bg-bg-tertiary border-neon-cyan' 
                        : (inc.status === 'ACTIVE' ? 'bg-red-950/10 border-red-500/20 hover:border-red-500/40' : 'bg-bg-secondary/40 border-border-glow/50 opacity-60')
                    }`}
                  >
                    <div className="max-w-[70%] space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-bright">{inc.threatType}</span>
                        <span className={`text-[8px] font-mono px-1.5 rounded-full ${
                          inc.status === 'ACTIVE' ? 'bg-neon-red/20 text-neon-red border border-neon-red/30 animate-pulse' : 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                        }`}>
                          {inc.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-text-muted truncate max-w-[280px] font-mono">
                        User: {inc.username} ({inc.location})
                      </div>
                      <div className="text-[10px] text-text-bright line-clamp-1">
                        {inc.explanation}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 border rounded ${getRiskBadgeColor(inc.riskScore)}`}>
                        {inc.riskScore}%
                      </span>
                      {inc.status === 'ACTIVE' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onResolveIncident(inc.id);
                          }}
                          className="cyber-btn cyber-btn-green text-[9px] px-2 py-1 font-mono flex items-center gap-1"
                        >
                          <CheckCircle className="w-2.5 h-2.5" />
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Live Login Telemetry Stream */}
        <div className="col-span-3 cyber-panel flex flex-col h-[320px]">
          <div className="cyber-panel-header">
            <div className="cyber-panel-title">
              <Activity className="text-glow-cyan text-neon-cyan" />
              Access Log Telemetry Stream
            </div>
            <span className="text-[10px] font-mono text-neon-cyan">
              PACKETS MONITORING: {sessions.length}
            </span>
          </div>

          <div className="overflow-x-auto overflow-y-auto flex-1 text-left">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-border-glow text-text-muted text-[10px] uppercase">
                  <th className="pb-2 font-semibold">Time</th>
                  <th className="pb-2 font-semibold">User</th>
                  <th className="pb-2 font-semibold">Location</th>
                  <th className="pb-2 font-semibold">Device</th>
                  <th className="pb-2 font-semibold text-right">Downloads</th>
                  <th className="pb-2 font-semibold text-right">Risk</th>
                  <th className="pb-2 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-glow/30">
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-text-muted">
                      Awaiting connection telemetry packets...
                    </td>
                  </tr>
                ) : (
                  sessions.map((sess) => (
                    <tr key={sess.id} className="hover:bg-bg-secondary/40">
                      <td className="py-2.5 text-text-muted">
                        {new Date(sess.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-2.5 font-semibold text-text-bright">{sess.username}</td>
                      <td className="py-2.5 text-text-muted truncate max-w-[120px]">{sess.location}</td>
                      <td className="py-2.5 text-text-muted truncate max-w-[100px]">{sess.device}</td>
                      <td className="py-2.5 text-right text-text-muted">{sess.downloadedFiles}</td>
                      <td className="py-2.5 text-right font-bold">
                        <span className={sess.riskScore >= 75 ? 'text-neon-red' : (sess.riskScore >= 40 ? 'text-neon-amber' : 'text-neon-green')}>
                          {sess.riskScore}%
                        </span>
                      </td>
                      <td className="py-2.5 text-center">
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                          sess.status === 'SUSPENDED' ? 'bg-red-500/10 text-neon-red border border-red-500/20' : 'bg-green-500/10 text-neon-green border border-green-500/20'
                        }`}>
                          {sess.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Privileged User Access Manager */}
        <div className="col-span-2 cyber-panel flex flex-col h-[320px]">
          <div className="cyber-panel-header">
            <div className="cyber-panel-title">
              <Users className="text-glow-purple text-neon-purple" />
              Privileged User Access Directory
            </div>
          </div>

          <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
            {users.map((u) => {
              const isSuspended = u.status === 'SUSPENDED';
              return (
                <div key={u.id} className="p-3 bg-bg-secondary/30 border border-border-glow/50 rounded flex justify-between items-center text-left hover:border-border-glow-active transition-all">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-bright">{u.fullName}</span>
                      <span className={`text-[8px] font-mono px-1 rounded ${
                        u.clearanceLevel === 'Critical' ? 'bg-red-500/10 text-neon-red' : (u.clearanceLevel === 'High' ? 'bg-purple-500/10 text-neon-purple' : 'bg-cyan-500/10 text-neon-cyan')
                      }`}>
                        {u.clearanceLevel}
                      </span>
                    </div>
                    <div className="text-[10px] text-text-muted font-mono">{u.role}</div>
                    <div className="text-[9px] text-text-muted font-mono">ID: {u.username}</div>
                  </div>

                  <div>
                    {isSuspended ? (
                      <button 
                        onClick={() => onUnsuspendUser(u.id)}
                        className="cyber-btn cyber-btn-green py-1 px-2.5 text-[10px] font-mono flex items-center gap-1"
                        title="Authorize User Access"
                      >
                        <UserCheck className="w-3 h-3" />
                        Activate
                      </button>
                    ) : (
                      <button 
                        onClick={() => onSuspendUser(u.id)}
                        className="cyber-btn cyber-btn-red py-1 px-2.5 text-[10px] font-mono flex items-center gap-1"
                        title="Lockout Compromised User"
                      >
                        <UserX className="w-3 h-3" />
                        Lockout
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
