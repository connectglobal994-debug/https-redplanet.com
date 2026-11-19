import { NextRequest, NextResponse } from 'next/server';

type InvestorSubmission = {
  name?: unknown;
  email?: unknown;
  type?: unknown;
  investmentTier?: unknown;
  message?: unknown;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_NOTIFY_EMAIL = 'redplanetcodes@gmail.com';
const MAX_MESSAGE_LENGTH = 3000;

export async function POST(req: NextRequest) {
  let body: InvestorSubmission;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid submission payload.' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const type = typeof body.type === 'string' ? body.type.trim().slice(0, 100) : 'partnership';
  const investmentTier = typeof body.investmentTier === 'string' ? body.investmentTier.trim().slice(0, 100) : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!name || name.length > 160 || !email || !message) {
    return NextResponse.json({ error: 'Name, email and message are required. Name must be 160 characters or fewer.' }, { status: 400 });
  }
  if (!EMAIL_REGEX.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.` }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) {
    return NextResponse.json({
      success: false,
      status: 'NOT_CONFIGURED',
      error: 'Investor email delivery is not configured. This submission has not been saved by the platform. Please try again later or use the published contact details.',
    }, { status: 503 });
  }

  const receivedAt = new Date().toISOString();
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [DEFAULT_NOTIFY_EMAIL],
        reply_to: email,
        subject: `Red Planet enquiry — ${name}`,
        text: [
          'RED PLANET BUSINESS ENQUIRY',
          `Name: ${name}`,
          `Email: ${email}`,
          `Enquiry type: ${type || 'Not specified'}`,
          `Plan / tier: ${investmentTier || 'Not specified'}`,
          `Received: ${receivedAt}`,
          '',
          message,
        ].join('\n'),
      }),
    });

    if (!response.ok) {
      console.error('Investor notification provider returned status:', response.status);
      return NextResponse.json({
        success: false,
        status: 'DELIVERY_FAILED',
        error: 'The notification service could not deliver this enquiry. It has not been stored in a platform database.',
      }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      status: 'EMAIL_NOTIFICATION_SENT',
      message: 'Your enquiry email was sent to the Red Planet team. This confirmation means email delivery was accepted; it is not a platform CRM record.',
      timestamp: receivedAt,
    }, { status: 200 });
  } catch (error) {
    console.error('Investor notification request failed:', error);
    return NextResponse.json({
      success: false,
      status: 'DELIVERY_FAILED',
      error: 'The notification service is temporarily unavailable. The platform has not stored this enquiry.',
    }, { status: 502 });
  }
}

export async function GET() {
  const configured = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
  return NextResponse.json({
    service: 'Red Planet investor enquiry email notification',
    status: configured ? 'CONFIGURED_NOT_HEALTHCHECKED' : 'NOT_CONFIGURED',
    persistence: 'No database-backed CRM persistence is implemented yet.',
  }, { status: configured ? 200 : 503 });
}
