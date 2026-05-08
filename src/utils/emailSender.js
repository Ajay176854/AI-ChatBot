/* src/utils/emailSender.js */
const nodemailer = require('nodemailer');

async function createTransporter() {
  // Uses Ethereal (test inbox) in development.
  // In production: replace with your real SMTP credentials via env vars.
  if (process.env.SMTP_HOST) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return { transporter, previewUser: null };
  }
  // Ethereal test account for development
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  return { transporter, previewUser: testAccount.user };
}

async function sendProposalEmails(leadData, clientPdfBuffer, salesPdfBuffer) {
  const result = await createTransporter();
  const transporter = result.transporter || result;

  const salesTeamEmail = process.env.SALES_EMAIL || 'sales@aisalessuite.com';
  const companyName = 'AI Sales Suite';

  // ── Email to Client ─────────────────────────────────────────────────
  const clientMailOptions = {
    from: `"${companyName}" <noreply@aisalessuite.com>`,
    to: leadData.email,
    subject: `Your Proposal for ${leadData.service} – ${companyName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background: #050810; color: #d0d8f0; margin: 0; padding: 0; }
          .wrapper { max-width: 600px; margin: 0 auto; background: #0d1120; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #1a1040, #0d0f1e); padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid rgba(108,99,255,0.3); }
          .logo { font-size: 22px; font-weight: 700; color: #a78bfa; letter-spacing: 1px; }
          .tagline { font-size: 11px; color: #6c63ff; margin-top: 4px; }
          .body { padding: 36px 40px; }
          .greeting { font-size: 18px; font-weight: 600; color: #f0f4ff; margin-bottom: 12px; }
          p { font-size: 14px; line-height: 1.7; color: #8b9cc8; margin: 0 0 16px; }
          .highlight { background: rgba(108,99,255,0.1); border-left: 3px solid #6c63ff; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 20px 0; }
          .highlight span { color: #a78bfa; font-weight: 600; }
          .services { display: flex; flex-wrap: wrap; gap: 8px; margin: 20px 0; }
          .service-tag { background: rgba(34,211,238,0.1); border: 1px solid rgba(34,211,238,0.25); color: #22d3ee; padding: 5px 12px; border-radius: 20px; font-size: 12px; }
          .cta { text-align: center; margin: 30px 0; }
          .btn { display: inline-block; background: linear-gradient(135deg, #6c63ff, #a78bfa); color: #fff; text-decoration: none; padding: 13px 32px; border-radius: 8px; font-weight: 600; font-size: 14px; }
          .footer { background: #080a14; padding: 24px 40px; text-align: center; font-size: 11px; color: #4b5680; border-top: 1px solid rgba(255,255,255,0.05); }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <div class="logo">⚡ AI SALES SUITE</div>
            <div class="tagline">Intelligent Solutions for the Future</div>
          </div>
          <div class="body">
            <div class="greeting">Hello, ${leadData.name}! 👋</div>
            <p>Thank you for reaching out to us. We are thrilled to present your personalized project proposal for <strong style="color:#a78bfa;">${leadData.service}</strong>.</p>
            <div class="highlight">
              <p style="margin:0;">📎 Please find your <span>detailed proposal PDF</span> attached to this email, which includes a full cost breakdown and project timeline.</p>
            </div>
            <p>At AI Sales Suite, we specialize in:</p>
            <div class="services">
              <span class="service-tag">🤖 AI Chatbot Development</span>
              <span class="service-tag">🌐 Web Development</span>
              <span class="service-tag">🧠 AI Product Development</span>
              <span class="service-tag">📈 AI Digital Marketing</span>
            </div>
            <p>Our team will review your requirements and reach out within <strong style="color:#22d3ee;">24 business hours</strong> to schedule a discovery call.</p>
            <div class="cta">
              <a href="https://aisalessuite.com" class="btn">Visit Our Website</a>
            </div>
            <p style="font-size:12px;">If you have any immediate questions, reply to this email or call us at <strong style="color:#a78bfa;">+91 98765 43210</strong>.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} AI Sales Suite Pvt. Ltd. | Thiruvarur, Tamil Nadu</p>
            <p>You received this email because you submitted an inquiry on our website.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    attachments: [
      {
        filename: `Official_Proposal_${leadData.company.replace(/\s+/g, '_')}.pdf`,
        content: clientPdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };

  // ── Email to Sales Team ─────────────────────────────────────────────
  const salesMailOptions = {
    from: `"AI Sales Suite Bot" <bot@aisalessuite.com>`,
    to: salesTeamEmail,
    subject: `🔔 New Lead: ${leadData.name} | ${leadData.service}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background: #050810; color: #d0d8f0; margin: 0; padding: 0; }
          .wrapper { max-width: 600px; margin: 0 auto; background: #0d1120; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #10001f, #0d0f1e); padding: 28px 40px; border-bottom: 1px solid rgba(244,114,182,0.3); }
          .header h1 { font-size: 18px; color: #f472b6; margin: 0; }
          .header p { color: #8b9cc8; font-size: 12px; margin: 4px 0 0; }
          .body { padding: 30px 40px; }
          .lead-card { background: rgba(108,99,255,0.07); border: 1px solid rgba(108,99,255,0.2); border-radius: 10px; padding: 20px 24px; margin-bottom: 20px; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; }
          .row:last-child { border-bottom: none; }
          .label { color: #6c63ff; font-weight: 600; }
          .value { color: #f0f4ff; }
          .service-badge { display: inline-block; background: linear-gradient(135deg, #6c63ff, #a78bfa); color: #fff; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          .footer { background: #080a14; padding: 18px 40px; text-align: center; font-size: 11px; color: #4b5680; border-top: 1px solid rgba(255,255,255,0.05); }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>🔔 New Lead Captured</h1>
            <p>A new proposal has been auto-generated and sent to the client.</p>
          </div>
          <div class="body">
            <div class="lead-card">
              <div class="row"><span class="label">Name</span><span class="value">${leadData.name}</span></div>
              <div class="row"><span class="label">Email</span><span class="value">${leadData.email}</span></div>
              <div class="row"><span class="label">Phone</span><span class="value">${leadData.phone}</span></div>
              <div class="row"><span class="label">Company</span><span class="value">${leadData.company}</span></div>
              <div class="row"><span class="label">Service</span><span class="value"><span class="service-badge">${leadData.service}</span></span></div>
              <div class="row"><span class="label">Submitted</span><span class="value">${new Date().toLocaleString('en-IN')}</span></div>
            </div>
            <p style="font-size:13px; color:#8b9cc8;">📎 The proposal PDF has also been attached for your reference. Please follow up within 24 hours.</p>
          </div>
          <div class="footer">AI Sales Suite — Automated Lead Notification System</div>
        </div>
      </body>
      </html>
    `,
    attachments: [
      {
        filename: `Lead_Brief_${leadData.company.replace(/\s+/g, '_')}.pdf`,
        content: salesPdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };

  const [clientInfo, salesInfo] = await Promise.all([
    transporter.sendMail(clientMailOptions),
    transporter.sendMail(salesMailOptions),
  ]);

  // Return preview URLs for Ethereal (only in dev)
  return {
    clientPreview: nodemailer.getTestMessageUrl(clientInfo),
    salesPreview: nodemailer.getTestMessageUrl(salesInfo),
    clientMessageId: clientInfo.messageId,
    salesMessageId: salesInfo.messageId,
  };
}

module.exports = { sendProposalEmails };
