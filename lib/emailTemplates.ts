/**
 * Centralized email HTML templates for SST Home Solutions.
 * All templates share a consistent branded layout.
 */

const BRAND_COLOR = '#059669';
const BRAND_GRADIENT = 'linear-gradient(135deg,#059669,#d97706)';

function baseLayout(content: string, title: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:${BRAND_GRADIENT};padding:28px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:900;letter-spacing:-0.5px;">SST Home Solutions</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Modern Living, Grounded Search</p>
          </td>
        </tr>
        <tr><td style="padding:36px 40px;">${content}</td></tr>
        <tr>
          <td style="background:#f9fafb;padding:16px 40px;border-top:1px solid #f0f0f0;text-align:center;">
            <p style="margin:0;color:#a1a1aa;font-size:12px;">© ${new Date().getFullYear()} SST Home Solutions · Uttar Pradesh, India</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function heading(text: string): string {
  return `<h2 style="margin:0 0 16px;color:#18181b;font-size:20px;font-weight:700;">${text}</h2>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 14px;color:#52525b;font-size:14px;line-height:1.7;">${text}</p>`;
}

function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 12px;font-size:13px;color:#71717a;font-weight:600;white-space:nowrap;">${label}</td>
    <td style="padding:8px 12px;font-size:13px;color:#18181b;">${value}</td>
  </tr>`;
}

function infoTable(rows: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:10px;margin:16px 0;">${rows}</table>`;
}

function ctaButton(text: string, url: string): string {
  return `<div style="text-align:center;margin:24px 0;">
    <a href="${url}" style="display:inline-block;background:${BRAND_COLOR};color:#fff;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;">${text}</a>
  </div>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #f0f0f0;margin:20px 0;" />`;
}

// ── 1. Welcome / Registration ──────────────────────────────────────────────────
export function welcomeEmail(username: string, role: string): string {
  const content = `
    ${heading('Welcome to SST Home Solutions! 🎉')}
    ${paragraph(`Hi <strong>${username}</strong>, your account has been created successfully.`)}
    ${paragraph(`You've joined as a <strong>${role}</strong>. Here's what you can do now:`)}
    ${role === 'owner'
      ? paragraph('• List your properties and reach thousands of potential tenants<br/>• Manage inquiries and bookings from your dashboard<br/>• Track rent payments and generate agreements')
      : paragraph('• Browse thousands of verified properties<br/>• Send inquiries and schedule visits<br/>• Save your favourite listings')}
    ${ctaButton('Go to Dashboard', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080'}/dashboard`)}
    ${paragraph('<span style="color:#a1a1aa;font-size:12px;">If you didn\'t create this account, please contact support immediately.</span>')}`;
  return baseLayout(content, 'Welcome to SST Home Solutions');
}

// ── 2. New Inquiry (for property owner) ───────────────────────────────────────
export function newInquiryOwnerEmail(params: {
  ownerName: string;
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;
  propertyTitle: string;
  propertyId: string;
  inquiryId: string;
  message?: string;
}): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080';
  const content = `
    ${heading('New Inquiry Received 📩')}
    ${paragraph(`Hi <strong>${params.ownerName}</strong>, someone is interested in your property.`)}
    ${infoTable(
      infoRow('Property', params.propertyTitle) +
      infoRow('Tenant Name', params.tenantName) +
      infoRow('Phone', `<a href="tel:${params.tenantPhone}" style="color:#059669;">${params.tenantPhone}</a>`) +
      infoRow('Email', `<a href="mailto:${params.tenantEmail}" style="color:#059669;">${params.tenantEmail}</a>`) +
      (params.message ? infoRow('Message', params.message) : '')
    )}
    ${paragraph('Respond quickly to increase your chances of converting this lead!')}
    ${ctaButton('View Inquiry', `${appUrl}/dashboard/inquiries/${params.inquiryId}`)}`;
  return baseLayout(content, 'New Inquiry for Your Property');
}

// ── 3. Inquiry confirmation (for tenant) ──────────────────────────────────────
export function inquiryConfirmationEmail(params: {
  tenantName: string;
  propertyTitle: string;
  propertyCity: string;
  propertyId: string;
}): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080';
  const content = `
    ${heading('Inquiry Sent Successfully ✅')}
    ${paragraph(`Hi <strong>${params.tenantName}</strong>, your inquiry has been sent to the property owner.`)}
    ${infoTable(
      infoRow('Property', params.propertyTitle) +
      infoRow('Location', params.propertyCity)
    )}
    ${paragraph('The owner will get back to you shortly. You can track your inquiry status in your dashboard.')}
    ${ctaButton('View Property', `${appUrl}/properties/${params.propertyId}`)}`;
  return baseLayout(content, 'Your Inquiry Was Sent');
}

// ── 4. Property created (for owner) ───────────────────────────────────────────
export function propertyCreatedEmail(params: {
  ownerName: string;
  propertyTitle: string;
  propertyCity: string;
  rent: number;
  propertyId: string;
}): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080';
  const content = `
    ${heading('Property Listed Successfully 🏠')}
    ${paragraph(`Hi <strong>${params.ownerName}</strong>, your property has been listed on SST Home Solutions.`)}
    ${infoTable(
      infoRow('Title', params.propertyTitle) +
      infoRow('City', params.propertyCity) +
      infoRow('Monthly Rent', `₹${params.rent.toLocaleString('en-IN')}`)
    )}
    ${paragraph('Your listing is now live and visible to thousands of potential tenants.')}
    ${ctaButton('View Your Listing', `${appUrl}/properties/${params.propertyId}`)}`;
  return baseLayout(content, 'Property Listed on SST Home Solutions');
}

// ── 5. Rent updated (for owner) ────────────────────────────────────────────────
export function rentUpdatedEmail(params: {
  ownerName: string;
  propertyTitle: string;
  oldRent: number;
  newRent: number;
  propertyId: string;
}): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080';
  const diff = params.newRent - params.oldRent;
  const diffText = diff >= 0
    ? `<span style="color:#059669;">+₹${diff.toLocaleString('en-IN')}</span>`
    : `<span style="color:#ef4444;">-₹${Math.abs(diff).toLocaleString('en-IN')}</span>`;
  const content = `
    ${heading('Rent Updated Successfully 💰')}
    ${paragraph(`Hi <strong>${params.ownerName}</strong>, the rent for your property has been updated.`)}
    ${infoTable(
      infoRow('Property', params.propertyTitle) +
      infoRow('Previous Rent', `₹${params.oldRent.toLocaleString('en-IN')}`) +
      infoRow('New Rent', `₹${params.newRent.toLocaleString('en-IN')}`) +
      infoRow('Change', diffText)
    )}
    ${ctaButton('View Property', `${appUrl}/properties/${params.propertyId}`)}`;
  return baseLayout(content, 'Rent Updated — SST Home Solutions');
}

// ── 6. Property updated (for owner) ───────────────────────────────────────────
export function propertyUpdatedEmail(params: {
  ownerName: string;
  propertyTitle: string;
  propertyId: string;
  updatedFields: string[];
}): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080';
  const fieldList = params.updatedFields.map(f => `• ${f}`).join('<br/>');
  const content = `
    ${heading('Property Details Updated 📝')}
    ${paragraph(`Hi <strong>${params.ownerName}</strong>, your property listing has been updated.`)}
    ${infoTable(
      infoRow('Property', params.propertyTitle) +
      infoRow('Updated Fields', fieldList || 'General update')
    )}
    ${ctaButton('View Updated Listing', `${appUrl}/properties/${params.propertyId}`)}`;
  return baseLayout(content, 'Property Updated — SST Home Solutions');
}

// ── 7. Property marked as rented ──────────────────────────────────────────────
export function propertyRentedEmail(params: {
  ownerName: string;
  propertyTitle: string;
  propertyId: string;
}): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080';
  const content = `
    ${heading('Property Marked as Rented 🔑')}
    ${paragraph(`Hi <strong>${params.ownerName}</strong>, your property has been marked as rented out.`)}
    ${infoTable(infoRow('Property', params.propertyTitle))}
    ${paragraph('The property has been removed from active listings. You can re-list it anytime from your dashboard.')}
    ${ctaButton('Go to Dashboard', `${appUrl}/dashboard`)}`;
  return baseLayout(content, 'Property Rented — SST Home Solutions');
}

// ── 8. Admin new inquiry alert ─────────────────────────────────────────────────
export function adminNewInquiryEmail(params: {
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;
  propertyTitle: string;
  propertyCity: string;
  ownerName: string;
  inquiryId: string;
}): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080';
  const content = `
    ${heading('New Inquiry Received on Platform 🔔')}
    ${paragraph('A new inquiry has been submitted on SST Home Solutions.')}
    ${infoTable(
      infoRow('Tenant', params.tenantName) +
      infoRow('Phone', params.tenantPhone) +
      infoRow('Email', params.tenantEmail) +
      infoRow('Property', params.propertyTitle) +
      infoRow('City', params.propertyCity) +
      infoRow('Owner', params.ownerName)
    )}
    ${ctaButton('View in Admin Dashboard', `${appUrl}/admin/dashboard`)}`;
  return baseLayout(content, 'Admin Alert: New Inquiry');
}
