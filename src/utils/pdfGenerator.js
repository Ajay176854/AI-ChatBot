/* src/utils/pdfGenerator.js */
const PDFDocument = require('pdfkit');

function formatINR(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN');
}

// =========================================================================
// == CLIENT PROPOSAL PDF (Formal & Attractive) ==
// =========================================================================
function generateClientPDF(leadData) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end',  () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const pkg       = leadData.selectedPackage || {};
    const service   = leadData.service  || 'Service';
    const employees = leadData.employees || 'N/A';
    const tier      = pkg.tier    || 'Custom';
    const price     = pkg.price   || 0;
    const gst       = pkg.gst     || 0;
    const total     = pkg.total   || 0;
    const features  = pkg.features || [];

    // ── Header Band (Dark Theme, Formal) ──
    doc.rect(0, 0, 595, 120).fill('#0f172a'); // slate-900
    doc.fontSize(32).font('Helvetica-Bold').fillColor('#38bdf8').text('PROJECT PROPOSAL', 50, 40, { letterSpacing: 1 });
    doc.fontSize(10).font('Helvetica').fillColor('#94a3b8').text(`Tailored Solution: ${service} (${tier} Tier)`, 50, 80);
    
    // Date & Ref
    const dateStr = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    doc.fontSize(10).fillColor('#cbd5e1').text(`Date: ${dateStr}`, 400, 45, { align: 'right', width: 145 });
    doc.fillColor('#64748b').text(`Ref: PR-${Date.now().toString().slice(-6)}`, 400, 60, { align: 'right', width: 145 });

    // ── Company Info (Sender) ──
    doc.y = 150;
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#8b5cf6').text('PREPARED BY:');
    doc.moveDown(0.2);
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b').text('AI Sales Suite Pvt. Ltd.');
    doc.fontSize(9).font('Helvetica').fillColor('#475569')
       .text('AI Innovation Hub, Thiruvarur, TN 610001')
       .text('sales@aisalessuite.com | +91 98765 43210')
       .text('www.aisalessuite.com');

    // ── Client Info Box (Recipient) ──
    const clientBoxY = 145;
    doc.rect(320, clientBoxY, 225, 80).fill('#f8fafc').stroke('#e2e8f0');
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#8b5cf6').text('PREPARED FOR:', 335, clientBoxY + 15);
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text(leadData.name, 335, clientBoxY + 30);
    doc.fontSize(9).font('Helvetica').fillColor('#475569')
       .text(leadData.company || 'N/A', 335, clientBoxY + 45)
       .text(leadData.email, 335, clientBoxY + 58);

    doc.y = 260;
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
    doc.moveDown(2);

    // ── Introduction / Formal Greeting ──
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e293b').text('Executive Summary');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').lineGap(4).fillColor('#334155')
       .text(`Dear ${leadData.name},\n\nThank you for exploring our solutions for ${leadData.company}. Based on your stated team scale of ${employees} employees, we have formulated the ${tier} package for ${service}. This tailored plan ensures maximum operational impact and scalable growth.`);
    doc.moveDown(2);

    // ── Deliverables / Features (Clean Table Look) ──
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e293b').text('Project Deliverables (Scope of Work)');
    doc.moveDown(0.5);
    const tableTop = doc.y;
    features.forEach((feat, index) => {
      const isEven = index % 2 === 0;
      doc.rect(50, doc.y, 495, 24).fill(isEven ? '#f1f5f9' : '#ffffff');
      doc.fontSize(9).font('Helvetica').fillColor('#334155').text(`•  ${feat}`, 65, doc.y - 17);
      doc.y += 24;
    });

    // ── Cost Summary Box ──
    doc.y += 20;
    const summaryY = doc.y;
    // Fill a beautiful gradient-like solid block for cost
    doc.rect(295, summaryY, 250, 95).fill('#f8fafc').stroke('#8b5cf6', 1.5).stroke();
    
    doc.fontSize(10).font('Helvetica').fillColor('#475569')
       .text('Base Value (Scale Adjusted):', 310, summaryY + 15)
       .text('GST / Tax (18%):', 310, summaryY + 35);
       
    doc.font('Helvetica-Bold').fillColor('#1e293b')
       .text(formatINR(price), 310, summaryY + 15, { width: 220, align: 'right' })
       .text(formatINR(gst),   310, summaryY + 35, { width: 220, align: 'right' });

    doc.moveTo(310, summaryY + 55).lineTo(530, summaryY + 55).strokeColor('#cbd5e1').stroke();
    
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#8b5cf6')
       .text('Total Investment:', 310, summaryY + 65)
       .text(formatINR(total), 310, summaryY + 65, { width: 220, align: 'right' });

    // ── Terms & Conditions ──
    doc.y = summaryY + 120;
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e293b').text('Standard Terms & Expirations');
    doc.moveDown(0.3);
    doc.fontSize(8).font('Helvetica').fillColor('#64748b').lineGap(2)
       .text('1. Proposal Validity: This quotation is strictly valid for 15 days from the date of issue.')
       .text('2. Payment Structure: 50% mobilization advance upon contract sign-off; 50% prior to final delivery.')
       .text('3. Revision Policy: Up to 2 standard revision cycles are included; extra work is billed separately.')
       .text('4. Taxes: All quotes reflect current GST regulations in India.');

    // ── Footer ──
    doc.rect(0, 800, 595, 42).fill('#1e293b');
    doc.fontSize(9).font('Helvetica').fillColor('#94a3b8')
       .text('AI Sales Suite — Driving Business Intelligence', 0, 816, { align: 'center', width: 595 });

    doc.end();
  });
}


// =========================================================================
// == SALES TEAM BRIEF PDF (Clean, Spaced out, Utilitarian) ==
// =========================================================================
function generateSalesPDF(leadData) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 60, size: 'A4' });
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end',  () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const pkg       = leadData.selectedPackage || {};
    const service   = leadData.service  || 'Service';
    const employees = leadData.employees || 'N/A';
    const tier      = pkg.tier    || 'Custom';
    const total     = pkg.total   || 0;
    
    // ── Header Band ──
    doc.rect(0, 0, 595, 75).fill('#dc2626'); // alert red format
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#ffffff').text('🔥 HOT LEAD DISPATCH', 60, 25);
    
    doc.y = 100;
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#64748b').text(`Lead Captured On: ${new Date().toLocaleString()}`);
    doc.moveDown(2);

    // ── Helper for spacing rows ──
    function drawDataRow(label, value, yPos) {
      doc.fontSize(11).font('Helvetica').fillColor('#64748b').text(label, 60, yPos);
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#0f172a').text(value, 200, yPos - 2);
      doc.moveTo(60, yPos + 22).lineTo(535, yPos + 22).strokeColor('#e2e8f0').lineWidth(1).stroke();
    }

    let currentY = doc.y;

    doc.fontSize(16).fillColor('#0f172a').text('1. Prospect Identity', 60, currentY);
    currentY += 35;
    drawDataRow('Full Name:', leadData.name, currentY);
    currentY += 45; // Generous Spacing for readability
    drawDataRow('Email Address:', leadData.email, currentY);
    currentY += 45;
    drawDataRow('Phone Number:', leadData.phone, currentY);
    currentY += 60;

    doc.fontSize(16).fillColor('#0f172a').text('2. Business Profile', 60, currentY);
    currentY += 35;
    drawDataRow('Organization:', leadData.company, currentY);
    currentY += 45;
    drawDataRow('Employee Scale:', employees, currentY);
    currentY += 60;

    doc.fontSize(16).fillColor('#0f172a').text('3. Requirements & Budget', 60, currentY);
    currentY += 35;
    drawDataRow('Target Service:', service, currentY);
    currentY += 45;
    drawDataRow('Package Selection:', `${tier} Package`, currentY);
    currentY += 45;
    drawDataRow('Expected Value:', formatINR(total) + ' (incl. GST)', currentY);
    
    doc.moveDown(4);
    doc.rect(60, doc.y, 475, 80).fill('#fef08a'); // soft yellow box
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#854d0e').text('Sales Action Required:', 80, doc.y + 15);
    doc.fontSize(11).font('Helvetica').text('A client-facing proposal has already been auto-emailed to this prospect. Please follow up directly via phone within the next 2 hours to secure discovery phase. DO NOT DELAY.', 80, doc.y + 35, { width: 435 });

    doc.end();
  });
}

module.exports = { generateClientPDF, generateSalesPDF };
