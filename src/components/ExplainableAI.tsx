import React from 'react';
import { Eye, ShieldAlert, TrendingUp, Info } from 'lucide-react';

interface ExplainableAIProps {
  selectedIncident: {
    username: string;
    riskScore: number;
    threatType: string;
    explanation: string;
    ip: string;
    location: string;
    metadata?: {
      reasons: string[];
      contributions: {
        unusualIP: number;
        offHours: number;
        unauthorizedDevice: number;
        dataVolume: number;
        impossibleTravel: number;
      };
      impossibleTravelDetails?: {
        distance: number;
        speed: number;
      } | null;
      device?: string;
      downloadedFiles?: number;
    };
  } | null;
}

export const ExplainableAI: React.FC<ExplainableAIProps> = ({ selectedIncident }) => {
  if (!selectedIncident) {
    return (
      <div className="cyber-panel flex flex-col items-center justify-center p-6 text-center text-text-muted min-h-[300px]">
        <Eye className="w-12 h-12 mb-3 text-border-glow-active pulse-slow" />
        <h3 className="font-mono text-sm uppercase text-text-bright mb-1">Explainable AI Analyzer</h3>
        <p className="text-xs max-w-xs">
          Select any active threat or simulated incident from the logs to view its machine learning feature contributions and risk breakdown.
        </p>
      </div>
    );
  }

  // Retrieve raw contributions or use fallback defaults based on selected incident risk
  const contr = selectedIncident.metadata?.contributions || {
    unusualIP: selectedIncident.threatType.includes("IP") ? 40 : 15,
    offHours: selectedIncident.explanation.includes("hour") || selectedIncident.explanation.includes("AM") ? 25 : 0,
    unauthorizedDevice: selectedIncident.explanation.includes("device") ? 20 : 0,
    dataVolume: selectedIncident.explanation.includes("files") || selectedIncident.explanation.includes("download") ? 35 : 0,
    impossibleTravel: selectedIncident.threatType.includes("Travel") ? 95 : 0
  };

  const reasons = selectedIncident.metadata?.reasons || selectedIncident.explanation.split(". ").filter(Boolean);

  const getMeterColor = (score: number) => {
    if (score >= 75) return 'bg-neon-red';
    if (score >= 40) return 'bg-neon-amber';
    return 'bg-neon-cyan';
  };

  const getScoreColorText = (score: number) => {
    if (score >= 75) return 'text-neon-red text-glow-red';
    if (score >= 40) return 'text-neon-amber text-glow-amber';
    return 'text-neon-green text-glow-green';
  };

  return (
    <div className="cyber-panel flex flex-col justify-between h-full min-h-[300px]">
      <div>
        <div className="cyber-panel-header">
          <div className="cyber-panel-title">
            <ShieldAlert className="text-glow-red text-neon-red" />
            Explainable AI (XAI) Risk Diagnostics
          </div>
          <span className={`cyber-badge font-mono font-bold ${getScoreColorText(selectedIncident.riskScore)}`}>
            {selectedIncident.riskScore}% RISK
          </span>
        </div>

        <div className="mb-4">
          <div className="text-xs text-text-muted font-mono uppercase mb-1">Subject Profile:</div>
          <div className="text-sm font-semibold text-text-bright">
            {selectedIncident.username} <span className="text-xs font-mono font-normal text-text-muted">({selectedIncident.ip} // {selectedIncident.location})</span>
          </div>
          <div className="text-xs text-neon-cyan font-mono mt-1">
            Flagged Threat Type: <span className="text-text-bright">{selectedIncident.threatType}</span>
          </div>
        </div>

        {/* Feature weights progress meters */}
        <div className="space-y-3 mb-5">
          <div className="text-xs text-text-muted font-mono uppercase border-b border-border-glow pb-1 mb-2">
            Model Feature Contribution Weights:
          </div>

          {/* Impossible Travel Indicator */}
          {contr.impossibleTravel > 0 && (
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-neon-red font-semibold">Impossible Travel Geometrics</span>
                <span className="text-neon-red">{contr.impossibleTravel}%</span>
              </div>
              <div className="w-full h-2 bg-bg-primary rounded border border-red-500/20 overflow-hidden">
                <div className="h-full bg-neon-red animate-pulse" style={{ width: `${contr.impossibleTravel}%` }}></div>
              </div>
            </div>
          )}

          {/* Unusual IP Indicator */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span>Location & IP Anomaly Index</span>
              <span>{contr.unusualIP}%</span>
            </div>
            <div className="w-full h-2 bg-bg-primary rounded border border-border-glow overflow-hidden">
              <div className={`h-full ${getMeterColor(contr.unusualIP)}`} style={{ width: `${contr.unusualIP}%` }}></div>
            </div>
          </div>

          {/* Off-Hours Indicator */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span>Anomalous Login Hour Rating</span>
              <span>{contr.offHours}%</span>
            </div>
            <div className="w-full h-2 bg-bg-primary rounded border border-border-glow overflow-hidden">
              <div className={`h-full ${getMeterColor(contr.offHours)}`} style={{ width: `${contr.offHours}%` }}></div>
            </div>
          </div>

          {/* Unauthorized Device Indicator */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span>Device Signature Mismatch</span>
              <span>{contr.unauthorizedDevice}%</span>
            </div>
            <div className="w-full h-2 bg-bg-primary rounded border border-border-glow overflow-hidden">
              <div className={`h-full ${getMeterColor(contr.unauthorizedDevice)}`} style={{ width: `${contr.unauthorizedDevice}%` }}></div>
            </div>
          </div>

          {/* Exfiltration Download Volume Indicator */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span>Data Download Volume Ratio</span>
              <span>{contr.dataVolume}%</span>
            </div>
            <div className="w-full h-2 bg-bg-primary rounded border border-border-glow overflow-hidden">
              <div className={`h-full ${getMeterColor(contr.dataVolume)}`} style={{ width: `${contr.dataVolume}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Decision explanation text summary */}
      <div className="p-3 bg-bg-secondary border border-border-glow/60 rounded text-xs">
        <div className="font-bold flex items-center gap-1 mb-2 text-neon-cyan font-mono">
          <Info className="w-3.5 h-3.5" />
          DECISION REASONING STATEMENT
        </div>
        <p className="text-text-bright leading-relaxed">
          {selectedIncident.explanation}
        </p>

        {selectedIncident.metadata?.impossibleTravelDetails && (
          <div className="mt-2 text-[10px] text-neon-red font-mono bg-red-950/20 p-2 rounded border border-red-500/20">
            SPEED ANOMALY: Linear distance of {selectedIncident.metadata.impossibleTravelDetails.distance} km was covered in a timeframe requiring a speed of {selectedIncident.metadata.impossibleTravelDetails.speed.toLocaleString()} km/h. Natural flight constraints capped at 900 km/h. High confidence of compromised account session sharing.
          </div>
        )}
      </div>
    </div>
  );
};
