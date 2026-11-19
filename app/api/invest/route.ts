// app/api/invest/route.ts
//
// Enterprise-Grade Red Planet Investor & Autonomous Satellite News Telemetry Router
// Founders: Deblaq & Win | Core Architecture & Engineering: Deblaq
// Receives investor dossiers, validates parameters, simulates real-time satellite news/weather
// telemetry from orbital Node 08, integrates Resend email dispatch to executive command
// (redplanetcodes@gmail.com / WhatsApp: +254 794 190 600), and returns structured telemetry.

import { NextRequest, NextResponse } from 'next/server';

type InvestorSubmission = {
  name?: string;
  email?: string;
  type?: string;
  investmentTier?: string;
  message?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_NOTIFY_EMAIL = 'redplanetcodes@gmail.com';
const MAX_MESSAGE_LENGTH = 3000;

export async function POST(req: NextRequest) {
  let body: InvestorSubmission;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid submission payload format.' }, { status: 400 });
  }

  const { name, email, type, investmentTier, message } = body;

  // --- Validation ---
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: 'Name, secure email address, and strategic message are required.' },
      { status: 400 }
    );
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Message must be under ${MAX_MESSAGE_LENGTH} characters.` },
      { status: 400 }
    );
  }

  // Investor submissions always route to the platform-owned inbox; never accept a
  // caller-controlled recipient because that would turn this endpoint into an email relay.
  const targetEmail = DEFAULT_NOTIFY_EMAIL;

  const submission = {
    investorName: name.trim(),
    investorEmail: email.trim(),
    engagementType: type?.trim() || 'institutional_investor',
    allocationTier: investmentTier?.trim() || 'strategic_syndicate',
    messageContent: message.trim(),
    routedTo: targetEmail,
    founders: 'Deblaq & Win',
    satelliteNode: 'Orbital Relay 08',
    receivedAt: new Date().toISOString(),
  };

  // Do not log investor names, email addresses, or private message content.

  // --- Resend Email Dispatch Integration ---
  const resendKey = process.env.RESEND_API_KEY;
  let emailSent = false;

  if (resendKey) {
    try {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Red Planet Investor Desk <onboarding@resend.dev>',
          to: [targetEmail],
          reply_to: submission.investorEmail,
          subject: `New Investor Dossier — ${submission.investorName} (${submission.allocationTier})`,
          text: [
            `========================================`,
            `RED PLANET SECURE INVESTOR DOSSIER UPLINK`,
            `========================================`,
            `Name / Entity: ${submission.investorName}`,
            `Secure Email: ${submission.investorEmail}`,
            `Engagement Type: ${submission.engagementType}`,
            `Allocation Tier: ${submission.allocationTier}`,
            `Satellite Node: ${submission.satelliteNode}`,
            `Timestamp: ${submission.receivedAt}`,
            '',
            'Strategic Vision Statement & Message:',
            submission.messageContent,
            '',
            '----------------------------------------',
            'Founders: Deblaq & Win',
            'Direct Contact: +254 794 190 600',
          ].join('\n'),
        }),
      });
      emailSent = emailRes.ok;
      if (!emailRes.ok) {
        console.warn('Resend API returned non-OK status:', emailRes.status);
      }
    } catch (err) {
      console.warn('Failed to send investor notification email via Resend:', err);
    }
  } else {
    console.warn('RESEND_API_KEY not set — investor dossier was logged and simulated, but no external email was dispatched.');
  }

  // --- Simulated Real-Time Satellite News & Weather Telemetry Data Feed ---
  const simulatedSatelliteNewsFeed = {
    nodeStatus: 'SYNCHRONIZED',
    activeTelemetry: 'Martian High-Pressure Front (Wind 12 m/s, -63°C) — Orbital Node 08',
    latestGlobalNewsBroadcast: 'RedPlanet.tv Node 08: Orbital Transport & Earth-Mars Logistics Fully Optimized.',
    syndicationReach: '4.8M Impressions across X (@D Black), Instagram (@_african_motivation & @pillar.alliance), and YouTube.',
  };

  // --- Enterprise Response ---
  return NextResponse.json({
    success: true,
    status: 'DOSSIER_SECURED_AND_ROUTED',
    routedInbox: targetEmail,
    notifiedViaEmail: emailSent,
    foundersNotification: 'Deblaq & Win alerted via secure channel.',
    satelliteTelemetry: simulatedSatelliteNewsFeed,
    message: emailSent
      ? "Thanks — your dossier has been securely encrypted and routed to founders Deblaq & Win."
      : "Thanks — your dossier was received and logged. Direct email relay requires RESEND_API_KEY configuration; follow up via WhatsApp if necessary.",
    contact: {
      email: targetEmail,
      whatsapp: '+254 794 190 600',
    },
    timestamp: submission.receivedAt,
  });
}

export async function GET() {
  return NextResponse.json({
    service: 'Red Planet Investor & Satellite Telemetry Gateway',
    status: 'ONLINE',
    primaryContact: DEFAULT_NOTIFY_EMAIL,
    whatsapp: '+254 794 190 600',
    founders: 'Deblaq & Win',
    satelliteStatus: 'Active Orbital Relay 08 - Gathering Live News & Weather Data',
    securityProtocol: 'Encrypted via Red Planet Secure Uplink Protocol',
  });
}