import React, { useState } from 'react';
import { Brain, ShieldAlert, CheckCircle, ShieldCheck, Clock, MapPin, Laptop, HardDriveDownload } from 'lucide-react';

interface AIUserProfile {
  id: string;
  username: string;
  fullName: string;
  role: string;
  clearanceLevel: string;
  status: string;
  profile: {
    normalLoginTimeStart: number;
    normalLoginTimeEnd: number;
    normalIps: string[];
    normalDevices: string[];
    normalDataScope: string[];
    typicalDownloadsPerSession: number;
  };
}

interface AIProfileProps {
  users: AIUserProfile[];
}

export const AIProfile: React.FC<AIProfileProps> = ({ users }) => {
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);

  const selectedUser = users[selectedUserIndex];

  // Helper to format decimal hour to AM/PM
  const formatHour = (hour: number) => {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    const displayMinute = m.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${ampm}`;
  };

  return (
    <div className="cyber-panel scanline">
      <div className="cyber-panel-header">
        <div className="cyber-panel-title">
          <Brain className="text-glow-purple text-neon-purple animate-pulse" />
          AI Behavioural Learning & Baselines Profile
        </div>
        <span className="cyber-badge text-neon-purple border-neon-purple font-mono text-[9px]">
          ML profiling active
        </span>
      </div>

      <p className="text-xs text-text-muted mb-6">
        Our Neural Anomaly Detector analyzes and trains on the daily telemetry data of privileged bank administrators. 
        It locks in behavioral patterns to establish standard employee baselines. Deviations are evaluated for access control actions.
      </p>

      {/* User Selector Tab Panel */}
      <div className="flex border-b border-border-glow mb-6 overflow-x-auto">
        {users.map((u, idx) => (
          <button
            key={u.id}
            onClick={() => setSelectedUserIndex(idx)}
            className={`px-4 py-2.5 text-xs font-mono tracking-wider uppercase border-b-2 transition-all whitespace-nowrap ${
              selectedUserIndex === idx 
                ? 'border-neon-purple text-text-bright' 
                : 'border-transparent text-text-muted hover:text-text-bright'
            }`}
          >
            {u.fullName.split(' ')[0]} ({u.role.split(' ')[0]})
          </button>
        ))}
      </div>

      {selectedUser && (
        <div className="grid grid-cols-2 gap-6 text-left">
          {/* Baseline summary details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-text-bright flex items-center gap-1.5 mb-1.5 uppercase font-mono">
                <ShieldCheck className="w-4 h-4 text-neon-green" />
                Learned Operational Baselines
              </h3>
              <p className="text-[11px] text-text-muted">
                These values represent normal operational bounds identified over the last 90-day learning baseline cycle.
              </p>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="p-3 bg-bg-secondary/40 border border-border-glow/40 rounded flex items-start gap-3">
                <Clock className="w-4 h-4 text-neon-cyan mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-text-muted uppercase">Authorized Operating Hours:</div>
                  <div className="text-text-bright font-semibold">
                    {formatHour(selectedUser.profile.normalLoginTimeStart)} - {formatHour(selectedUser.profile.normalLoginTimeEnd)}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-bg-secondary/40 border border-border-glow/40 rounded flex items-start gap-3">
                <MapPin className="w-4 h-4 text-neon-cyan mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-text-muted uppercase">Authorized Network Gateways (IPs):</div>
                  <div className="text-text-bright font-semibold space-y-0.5">
                    {selectedUser.profile.normalIps.map(ip => (
                      <div key={ip}>{ip} (Domestic HQ Block)</div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-bg-secondary/40 border border-border-glow/40 rounded flex items-start gap-3">
                <Laptop className="w-4 h-4 text-neon-cyan mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-text-muted uppercase">Trusted Device Signatures:</div>
                  <div className="text-text-bright font-semibold">
                    {selectedUser.profile.normalDevices.join(', ')}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-bg-secondary/40 border border-border-glow/40 rounded flex items-start gap-3">
                <HardDriveDownload className="w-4 h-4 text-neon-cyan mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-text-muted uppercase">File Download Baseline Threshold:</div>
                  <div className="text-text-bright font-semibold">
                    ~{selectedUser.profile.typicalDownloadsPerSession} files per session (Anomaly threshold: &gt; {selectedUser.profile.typicalDownloadsPerSession * 2} files)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Visualizer and Anomaly Gauge */}
          <div className="space-y-4">
            <h4 className="text-xs text-text-muted uppercase font-mono border-b border-border-glow pb-1 mb-2">
              Behavioral Dimensions Analytics
            </h4>

            {/* Timeline hour graph */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-text-muted uppercase flex justify-between">
                <span>Login Hour Distribution Timeline (24 Hours)</span>
                <span className="text-neon-cyan">Normal Hours Green</span>
              </span>
              
              <div className="relative h-6 bg-bg-primary rounded border border-border-glow flex items-center">
                {/* Visual rendering of 24h bar */}
                <div 
                  className="absolute h-full bg-neon-green/15 border-l border-r border-neon-green/40 flex items-center justify-center"
                  style={{
                    left: `${(selectedUser.profile.normalLoginTimeStart / 24) * 100}%`,
                    width: `${((selectedUser.profile.normalLoginTimeEnd - selectedUser.profile.normalLoginTimeStart) / 24) * 100}%`
                  }}
                >
                  <span className="text-[8px] font-mono text-neon-green opacity-60">WORK BASICS</span>
                </div>

                {/* Clock markers */}
                <div className="absolute left-[0%] text-[8px] font-mono text-text-muted translate-x-1">12AM</div>
                <div className="absolute left-[25%] text-[8px] font-mono text-text-muted">6AM</div>
                <div className="absolute left-[50%] text-[8px] font-mono text-text-muted">-12PM-</div>
                <div className="absolute left-[75%] text-[8px] font-mono text-text-muted">6PM</div>
              </div>
            </div>

            {/* Privilege scope details */}
            <div className="p-4 bg-bg-primary border border-border-glow rounded">
              <span className="text-[10px] font-mono text-text-muted uppercase block mb-2">
                Authorized Sensitive Asset Scopes:
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedUser.profile.normalDataScope.map((scope, sIdx) => (
                  <span 
                    key={sIdx} 
                    className="text-[10px] font-mono px-2 py-1 bg-purple-950/20 text-neon-purple border border-purple-500/20 rounded"
                  >
                    {scope}
                  </span>
                ))}
              </div>
              
              <div className="mt-4 border-t border-border-glow/30 pt-3">
                <span className="text-[10px] font-mono text-text-muted uppercase block mb-1">
                  Access Enforcement Strategy:
                </span>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Clearance Level is rated <span className="text-neon-cyan">{selectedUser.clearanceLevel}</span>. 
                  Any off-hours access or unauthorized device verification will force a mandatory verification flow. 
                  Download exfiltration attempts exceeding 10x normal bounds will invoke immediate account lockout and notify security staff.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
