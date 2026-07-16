import nodemailer from 'nodemailer';
import { dbHelpers } from './db.js';

// Setup Nodemailer transporter from env config
const createSmtpTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }
  return null;
};

/**
 * Sends a real WhatsApp alert using Twilio API (without twilio package)
 */
async function sendWhatsAppAlert(alertData) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const fromWhatsapp = process.env.TWILIO_FROM_WHATSAPP || 'whatsapp:+14155238886';
  let recipient = process.env.ALERT_RECIPIENT_WHATSAPP || '+91XXXXXXXXXX';

  if (!recipient.startsWith('+') && recipient !== '+91XXXXXXXXXX') {
    recipient = '+' + recipient;
  }

  const { fullName, riskScore, actionTaken, location, timeString } = alertData;
  const messageBody = `🚨 CYBER_S.BANK SECURITY ALERT: Anomaly detected! User: ${fullName} | Risk Score: ${riskScore}% | Location: ${location} | Time: ${timeString} | Action: ${actionTaken}. Please verify immediately!`;

  if (sid && token && recipient && recipient !== '+91XXXXXXXXXX') {
    try {
      console.log(`[WHATSAPP CHANNEL] Attempting dispatch to ${recipient}...`);
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          To: `whatsapp:${recipient}`,
          From: fromWhatsapp,
          Body: messageBody
        })
      });

      const resJson = await response.json();
      if (response.ok) {
        console.log(`[WHATSAPP SUCCESS] Alert successfully sent to WhatsApp! Message SID: ${resJson.sid}`);
      } else {
        console.warn(`[WHATSAPP FAILURE] Twilio responded with status ${response.status}: ${resJson.message}`);
      }
    } catch (err) {
      console.error(`[WHATSAPP ERROR] Failed to send Twilio WhatsApp alert.`, err);
    }
  } else {
    // Print logs in simulated mode
    console.log("\n" + "=".repeat(80));
    console.log(`[SIMULATED WHATSAPP ALREADY DISPATCHED]`);
    console.log(`TO: ${recipient}`);
    console.log(`ALERT MESSAGE: ${messageBody}`);
    console.log("=".repeat(80) + "\n");
  }
}

/**
 * Formats and dispatches an email alert to the Bank Manager
 */
export async function sendManagerEmail(alertData) {
  const {
    incidentId,
    username,
    fullName,
    role,
    riskScore,
    location,
    ip,
    timeString,
    device,
    downloadedFiles,
    reasons,
    contributions,
    actionTaken,
    impossibleTravelDetails
  } = alertData;

  const emailId = "msg_" + Math.random().toString(36).substring(2, 9);
  
  // Format console logs with visual framing
  console.log("\n" + "=".repeat(80));
  console.log(`[ALERT DISPATCH] TO: manager@cybersbank.com`);
  console.log(`[ALERT DISPATCH] SUBJECT: URGENT: Suspicious Behavior & Privilege Anomaly Detected - ${fullName}`);
  console.log(`[ALERT DISPATCH] RISK SCORE: ${riskScore}% | ACTION: ${actionTaken}`);
  console.log(`[ALERT DISPATCH] TELEMETRY: IP ${ip} (${location}) | DEVICE: ${device} | TIME: ${timeString}`);
  console.log(`[ALERT DISPATCH] THREAT FACTORS:`);
  reasons.forEach(reason => console.log(`  - ${reason}`));
  if (impossibleTravelDetails) {
    console.log(`  - Travel Stats: ${impossibleTravelDetails.distance} km traveled at ${impossibleTravelDetails.speed} km/h`);
  }
  console.log("=".repeat(80) + "\n");

  const emailHtml = `
<h2>CYBER_S.BANK ACCESS INTEGRITY LOG</h2>
<hr style="border: 1px solid rgba(0, 243, 255, 0.2);" />
<p><strong>Security Event:</strong> Anomaly detected in privileged user account.</p>
<table style="width: 100%; border-collapse: collapse; margin: 15px 0; color: #e2f1ff; font-family: monospace;">
  <tr style="background: rgba(18, 26, 44, 0.5);">
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">User Profile:</td>
    <td style="padding: 8px; border: 1px solid rgba(0, 243, 255, 0.1);">${fullName} (${username}) - <em>${role}</em></td>
  </tr>
  <tr>
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">Risk Rating:</td>
    <td style="padding: 8px; color: ${riskScore >= 75 ? '#ff0055' : '#ffaa00'}; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">${riskScore}% (CRITICAL)</td>
  </tr>
  <tr style="background: rgba(18, 26, 44, 0.5);">
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">Location & IP:</td>
    <td style="padding: 8px; border: 1px solid rgba(0, 243, 255, 0.1);">${location} (IP: ${ip})</td>
  </tr>
  <tr>
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">Device Telemetry:</td>
    <td style="padding: 8px; border: 1px solid rgba(0, 243, 255, 0.1);">${device}</td>
  </tr>
  <tr style="background: rgba(18, 26, 44, 0.5);">
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">Session Time:</td>
    <td style="padding: 8px; border: 1px solid rgba(0, 243, 255, 0.1);">${timeString}</td>
  </tr>
  <tr>
    <td style="padding: 8px; font-weight: bold; border: 1px solid rgba(0, 243, 255, 0.1);">Exfiltrated Files:</td>
    <td style="padding: 8px; border: 1px solid rgba(0, 243, 255, 0.1);">${downloadedFiles} documents</td>
  </tr>
</table>

<h3>AI Behavioural Explanations:</h3>
<ul>
  ${reasons.map(r => `<li style="margin-bottom: 5px; color: #ffbcbc;">${r}</li>`).join('')}
</ul>

${impossibleTravelDetails ? `
<div style="background: rgba(255, 0, 85, 0.15); border: 1px solid #ff0055; padding: 10px; border-radius: 4px; margin: 10px 0;">
  <strong>IMPOSSIBLE TRAVEL GEOMETRICS:</strong><br/>
  Linear distance calculated: ${impossibleTravelDetails.distance} km.<br/>
  Simulated speed requirement: <strong>${impossibleTravelDetails.speed.toLocaleString()} km/h</strong> (commercial flights cap at 900 km/h).
</div>
` : ''}

<div style="margin-top: 20px; border-top: 1px dashed rgba(0, 243, 255, 0.2); padding-top: 15px;">
  <strong>DEFENSIVE REMEDIATION ACTION TAKEN:</strong><br/>
  <span style="color: ${actionTaken.includes('AUTO-SUSPENDED') ? '#ff0055' : '#ffaa00'}; font-weight: bold;">
    [${actionTaken}]
  </span>
</div>
  `;

  // Create email structure for dashboard manager client
  const email = {
    id: emailId,
    incidentId,
    from: "cyber-security-engine@cybersbank.com",
    to: "manager@cybersbank.com",
    subject: `[ALERT: ${riskScore}% RISK] Anomaly Triggered by ${fullName} (${role})`,
    timestamp: new Date().toISOString(),
    unread: true,
    riskScore,
    actionTaken,
    body: emailHtml,
    metadata: alertData
  };

  dbHelpers.addManagerEmail(email);

  // --- Real SMTP Dispatching Option ---
  const recipientEmail = process.env.ALERT_RECIPIENT_EMAIL || 'sanjeevkumarnagarajan2@gmail.com';
  const smtpTransporter = createSmtpTransporter();

  if (smtpTransporter) {
    try {
      console.log(`[SMTP CHANNEL] Attempting email alert dispatch to ${recipientEmail}...`);
      await smtpTransporter.sendMail({
        from: `"CYBER_S.BANK Security SOC" <${process.env.SMTP_USER}>`,
        to: recipientEmail,
        subject: `🚨 [ALERT: ${riskScore}% RISK] Suspicious Behavior Detected - ${fullName}`,
        html: emailHtml
      });
      console.log(`[SMTP SUCCESS] Alert email successfully sent to ${recipientEmail}`);
    } catch (err) {
      console.error(`[SMTP ERROR] Failed to send email alert to ${recipientEmail}.`, err);
    }
  } else {
    console.log("\n" + "=".repeat(80));
    console.log(`[SIMULATED SMTP DISPATCH]`);
    console.log(`TO: ${recipientEmail}`);
    console.log(`SUBJECT: 🚨 [ALERT: ${riskScore}% RISK] Suspicious Behavior Detected - ${fullName}`);
    console.log("=".repeat(80) + "\n");
  }

  // --- WhatsApp Triggering ---
  await sendWhatsAppAlert(alertData);
}
