// src/app/api/proposal/route.js
import { NextResponse } from 'next/server';

// Must be server-side only (pdfkit and nodemailer are Node.js modules)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const leadData = await request.json();

    // Validate required fields
    if (!leadData.name || !leadData.email || !leadData.phone || !leadData.company || !leadData.service) {
      return NextResponse.json(
        { success: false, error: 'Missing required lead information.' },
        { status: 400 }
      );
    }

    // Dynamic require to ensure server-side only
    const { generateClientPDF, generateSalesPDF } = require('@/utils/pdfGenerator');
    const { sendProposalEmails } = require('@/utils/emailSender');

    // Generate both PDFs side-by-side in memory
    const [clientPdfBuffer, salesPdfBuffer] = await Promise.all([
      generateClientPDF(leadData),
      generateSalesPDF(leadData)
    ]);

    // Send emails with specialized attachments
    const emailResult = await sendProposalEmails(leadData, clientPdfBuffer, salesPdfBuffer);

    return NextResponse.json({
      success: true,
      message: 'Proposal generated and emails sent successfully!',
      // Ethereal preview links (visible in dev mode only)
      preview: {
        clientEmail: emailResult.clientPreview || null,
        salesEmail: emailResult.salesPreview || null,
      },
    });
  } catch (error) {
    console.error('Proposal API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate proposal. Please try again.' },
      { status: 500 }
    );
  }
}
