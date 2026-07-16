import { db, dbHelpers } from './db.js';
import { sendManagerEmail } from './emailService.js';

/**
 * Calculates geographic distance in kilometers using the Haversine formula
 */
function getGeoDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Simple geo coordinates registry for simulation
const CITY_COORDINATES = {
  "Chennai, India": { lat: 13.0827, lon: 80.2707 },
  "Mumbai, India": { lat: 19.0760, lon: 72.8777 },
  "London, UK": { lat: 51.5074, lon: -0.1278 },
  "Moscow, Russia": { lat: 55.7558, lon: 37.6173 },
  "Beijing, China": { lat: 39.9042, lon: 116.4074 },
  "New York, USA": { lat: 40.7128, lon: -74.0060 }
};

export const ThreatDetector = {
  evaluateLogin: (username, ip, location, timeString, device, downloadedFilesCount = 0) => {
    const user = dbHelpers.getUserByUsername(username);
    if (!user) {
      return {
        success: false,
        error: "User profile not found in directory."
      };
    }

    if (user.status === "SUSPENDED") {
      return {
        success: false,
        error: "Authentication failed. Account has been SUSPENDED due to suspected security compromise."
      };
    }

    // Convert timeString ("09:30" or "03:15") to decimal hour (e.g. 9.5, 3.25)
    const [hours, minutes] = timeString.split(":").map(Number);
    const loginHour = hours + minutes / 60;

    let riskScore = 0;
    const reasons = [];
    const contributions = {
      unusualIP: 0,
      offHours: 0,
      unauthorizedDevice: 0,
      dataVolume: 0,
      impossibleTravel: 0
    };

    // 1. Foreign / Unusual IP detection
    const isNormalIp = user.profile.normalIps.includes(ip);
    const isForeignIp = !location.includes("India"); // Chennai and Mumbai are domestic, others are foreign
    if (!isNormalIp) {
      if (isForeignIp) {
        contributions.unusualIP = 40;
        reasons.push(`Foreign IP login detected (${location})`);
      } else {
        contributions.unusualIP = 15;
        reasons.push("Unusual domestic IP address");
      }
    }

    // 2. Off-Hours login detection
    const normalStart = user.profile.normalLoginTimeStart;
    const normalEnd = user.profile.normalLoginTimeEnd;
    let isOffHours = false;
    
    if (loginHour < normalStart || loginHour > normalEnd) {
      isOffHours = true;
      const severity = Math.min(30, Math.ceil(Math.abs(loginHour - (loginHour < normalStart ? normalStart : normalEnd)) * 5));
      contributions.offHours = severity;
      reasons.push(`Login outside office hours (Attempted: ${timeString})`);
    }

    // 3. Unauthorized Device detection
    const isNormalDevice = user.profile.normalDevices.includes(device);
    if (!isNormalDevice) {
      contributions.unauthorizedDevice = 20;
      reasons.push(`Access from unauthorized device (${device})`);
    }

    // 4. Data exfiltration volume check
    const typicalDownloads = user.profile.typicalDownloadsPerSession;
    if (downloadedFilesCount > typicalDownloads) {
      const excessRatio = downloadedFilesCount / typicalDownloads;
      let dataScore = 0;
      if (excessRatio >= 50) {
        dataScore = 50;
        reasons.push(`Massive bulk download request (${downloadedFilesCount} confidential files)`);
      } else if (excessRatio >= 10) {
        dataScore = 30;
        reasons.push(`High volume file downloads (${downloadedFilesCount} files)`);
      } else if (excessRatio > 2) {
        dataScore = 15;
        reasons.push(`Abnormal file downloads count (${downloadedFilesCount} files)`);
      }
      contributions.dataVolume = dataScore;
    }

    // 5. Impossible Travel detection
    // Look at the user's latest active session in the database
    const userPreviousSessions = db.sessions.filter(s => s.username === username);
    let travelAlert = false;
    let calculatedSpeed = 0;
    let travelDistance = 0;

    if (userPreviousSessions.length > 0) {
      const prevSession = userPreviousSessions[0];
      const prevCoords = CITY_COORDINATES[prevSession.location];
      const currentCoords = CITY_COORDINATES[location];

      if (prevCoords && currentCoords && prevSession.location !== location) {
        // Find time difference in minutes
        // We will mock time difference. In our simulator, we set a specific 'timeDelta' or we use timestamps.
        // Let's assume standard timestamp difference or pass the difference from simulation.
        // If simulation says it occurred 5 minutes later, let's look at the time difference.
        // To compute simulated time difference, we can read a metadata field or compute from mock timestamps.
        // Let's parse time strings as if they occurred on the same day for simplicity, or look at session timestamps.
        const prevTimeParts = prevSession.timeString.split(":").map(Number);
        const currTimeParts = timeString.split(":").map(Number);
        
        const prevMinutes = prevTimeParts[0] * 60 + prevTimeParts[1];
        const currMinutes = currTimeParts[0] * 60 + currTimeParts[1];
        
        let timeDiffMinutes = currMinutes - prevMinutes;
        
        // Handle wrapping over midnight
        if (timeDiffMinutes < 0) {
          timeDiffMinutes += 24 * 60;
        }

        // Calculate distance
        travelDistance = getGeoDistance(prevCoords.lat, prevCoords.lon, currentCoords.lat, currentCoords.lon);
        
        if (timeDiffMinutes > 0 && timeDiffMinutes <= 60) { // check travel in under 1 hour
          const speedKmh = travelDistance / (timeDiffMinutes / 60);
          calculatedSpeed = Math.round(speedKmh);
          
          if (speedKmh > 900) { // Faster than commercial airplane
            travelAlert = true;
            contributions.impossibleTravel = 95; // Overrides everything, extreme risk
            reasons.push(`Impossible Travel: Moved from ${prevSession.location} to ${location} in ${timeDiffMinutes} mins (Required speed: ${calculatedSpeed} km/h)`);
          }
        }
      }
    }

    // Risk scoring compilation
    if (travelAlert) {
      // If impossible travel is active, risk score is immediately capped at high value
      riskScore = 95;
    } else {
      // Sum components and cap at 90% (saving 95%+ for impossible travel or multi-anomalies)
      riskScore = Math.min(90, 
        contributions.unusualIP + 
        contributions.offHours + 
        contributions.unauthorizedDevice + 
        contributions.dataVolume
      );
    }

    const isSuspicious = riskScore >= 40;
    const isAutoSuspended = riskScore >= db.settings.autoSuspensionThreshold;

    // Trigger remediation actions
    if (isAutoSuspended) {
      dbHelpers.suspendUser(user.id);
    }

    const resultSession = {
      id: "sess_" + Math.random().toString(36).substring(2, 9),
      userId: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      ip,
      location,
      timeString,
      device,
      downloadedFiles: downloadedFilesCount,
      riskScore,
      status: isAutoSuspended ? "SUSPENDED" : "ACTIVE",
      timestamp: new Date().toISOString()
    };

    // Log the session
    dbHelpers.addSession(resultSession);

    let incidentId = "no_incident";

    // If suspicious, create an incident alert log in DB
    if (isSuspicious) {
      const incident = {
        id: "inc_" + Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        userId: user.id,
        username: user.username,
        ip,
        location,
        riskScore,
        threatType: travelAlert ? "Impossible Travel Detected" : (riskScore >= 75 ? "Critical Insider Anomaly" : "Suspicious Behaviour Alert"),
        explanation: reasons.join(". "),
        status: isAutoSuspended ? "RESOLVED" : "ACTIVE",
        mitigation: isAutoSuspended ? "Account suspended automatically by Risk Engine" : ""
      };
      
      dbHelpers.addIncident(incident);
      incidentId = incident.id;
    }

    // Always dispatch email and WhatsApp alerts to recipient for EVERY login
    const alertReasons = reasons.length > 0 ? reasons : ["Successful standard login verified in system baseline directory."];
    
    sendManagerEmail({
      incidentId,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      riskScore,
      location,
      ip,
      timeString,
      device,
      downloadedFiles: downloadedFilesCount,
      reasons: alertReasons,
      contributions,
      actionTaken: isAutoSuspended ? "ACCOUNT AUTO-SUSPENDED" : (isSuspicious ? "FLAGGED FOR REVIEW" : "ACCESS AUTHORIZED"),
      impossibleTravelDetails: travelAlert ? { distance: Math.round(travelDistance), speed: calculatedSpeed } : null
    });

    return {
      success: true,
      session: resultSession,
      riskScore,
      reasons,
      contributions,
      autoSuspended: isAutoSuspended,
      emailAlertSent: true
    };
  }
};
