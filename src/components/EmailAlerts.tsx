import React, { useState } from 'react';
import { Mail, MailOpen, Trash2, ShieldAlert, ShieldCheck, UserX, UserCheck } from 'lucide-react';

interface ManagerEmail {
  id: string;
  incidentId: string;
  from: string;
  to: string;
  subject: string;
  timestamp: string;
  unread: boolean;
  riskScore: number;
  actionTaken: string;
  body: string;
  metadata: {
    username: string;
    fullName: string;
    role: string;
    ip: string;
    location: string;
    device: string;
    downloadedFiles: number;
  };
}

interface EmailAlertsProps {
  emails: ManagerEmail[];
  onMarkAsRead: (id: string) => void;
  onSuspendUser: (username: string) => void;
  onUnsuspendUser: (username: string) => void;
  userStatuses: Record<string, string>; // Maps username to status
}

export const EmailAlerts: React.FC<EmailAlertsProps> = ({ 
  emails, 
  onMarkAsRead, 
  onSuspendUser, 
  onUnsuspendUser,
  userStatuses
}) => {
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  const selectedEmail = emails.find(e => e.id === selectedEmailId);

  const handleSelectEmail = (email: ManagerEmail) => {
    setSelectedEmailId(email.id);
    if (email.unread) {
      onMarkAsRead(email.id);
    }
  };

  const getUsernameFromEmail = (email: ManagerEmail) => {
    return email.metadata.username;
  };

  return (
    <div className="cyber-panel scanline min-h-[400px] flex flex-col">
      <div className="cyber-panel-header">
        <div className="cyber-panel-title">
          <Mail className="text-glow-cyan text-neon-cyan" />
          Manager Email Alerts Inbox (manager@cybersbank.com)
        </div>
        {emails.filter(e => e.unread).length > 0 && (
          <span className="cyber-badge text-neon-red border-neon-red font-mono text-[9px] pulse-slow">
            {emails.filter(e => e.unread).length} Unread Security Alerts
          </span>
        )}
      </div>

      <div className="grid grid-cols-5 gap-4 flex-1 h-[320px]">
        {/* Email Sidebar */}
        <div className="col-span-2 border-r border-border-glow pr-2 overflow-y-auto space-y-2 h-[320px]">
          {emails.length === 0 ? (
            <div className="text-center text-xs text-text-muted py-10">
              No security alerts dispatched. Core systems running within standard parameters.
            </div>
          ) : (
            emails.map((email) => {
              const isSelected = email.id === selectedEmailId;
              const isUserSuspended = userStatuses[email.metadata.username] === "SUSPENDED";
              
              return (
                <div
                  key={email.id}
                  onClick={() => handleSelectEmail(email)}
                  className={`p-3 rounded text-left cursor-pointer border transition-all ${
                    isSelected 
                      ? 'bg-bg-tertiary/75 border-neon-cyan' 
                      : (email.unread ? 'bg-bg-secondary/90 border-red-500/25' : 'bg-bg-secondary/40 border-border-glow/50')
                  } hover:bg-bg-tertiary/50`}
                >
                  <div className="flex justify-between items-start gap-1 mb-1">
                    <span className="text-[10px] text-text-muted font-mono truncate max-w-[100px]">
                      {email.from.split('@')[0]}
                    </span>
                    <span className="text-[9px] text-text-muted font-mono">
                      {new Date(email.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-text-bright truncate flex items-center gap-1.5">
                    {email.unread && (
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-red inline-block animate-ping"></span>
                    )}
                    {email.subject}
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      email.riskScore >= 75 
                        ? 'bg-red-500/10 text-neon-red' 
                        : 'bg-amber-500/10 text-neon-amber'
                    }`}>
                      {email.riskScore}% RISK
                    </span>
                    <span className="text-[9px] font-mono text-text-muted">
                      {isUserSuspended ? 'SUSPENDED' : 'ACTIVE'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Email Detail Panel */}
        <div className="col-span-3 overflow-y-auto h-[320px] bg-bg-primary/50 p-4 rounded border border-border-glow/40 flex flex-col justify-between">
          {selectedEmail ? (
            <div className="flex flex-col h-full justify-between">
              {/* Header */}
              <div>
                <div className="flex justify-between items-start border-b border-border-glow pb-3 mb-3">
                  <div>
                    <h3 className="text-xs font-mono text-text-muted">From: <span className="text-text-bright">{selectedEmail.from}</span></h3>
                    <h3 className="text-xs font-mono text-text-muted">Subject: <span className="text-neon-cyan">{selectedEmail.subject}</span></h3>
                  </div>
                  <div className="text-[10px] font-mono text-text-muted">
                    {new Date(selectedEmail.timestamp).toLocaleString()}
                  </div>
                </div>

                {/* Body Content (Inserted Raw HTML from server template) */}
                <div 
                  className="text-xs text-left font-sans text-text-bright space-y-2 overflow-x-hidden"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                />
              </div>

              {/* Action Buttons */}
              <div className="border-t border-border-glow pt-4 mt-6 flex justify-between gap-3">
                {userStatuses[selectedEmail.metadata.username] === "SUSPENDED" ? (
                  <button 
                    onClick={() => onUnsuspendUser(selectedEmail.metadata.username)}
                    className="cyber-btn cyber-btn-green py-2 px-3 flex-1 flex items-center justify-center gap-1.5 text-xs"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Unsuspend Account (Approve Access)
                  </button>
                ) : (
                  <button 
                    onClick={() => onSuspendUser(selectedEmail.metadata.username)}
                    className="cyber-btn cyber-btn-red py-2 px-3 flex-1 flex items-center justify-center gap-1.5 text-xs"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    Suspend Account (Revoke Access)
                  </button>
                )}
                
                <div className="text-[9px] font-mono text-text-muted flex items-center">
                  Incident ID: {selectedEmail.incidentId}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-text-muted">
              <MailOpen className="w-10 h-10 mb-2 text-border-glow" />
              <div className="text-xs font-mono">No Email Selected</div>
              <div className="text-[10px] mt-1 text-center max-w-xs">
                Select an alert from the sidebar inbox to read the manager's report and initiate responses.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
