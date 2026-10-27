// ==========================================
// ADMIN NOTIFICATION EMAIL
// ==========================================
export const customInquiryAdminEmail = (inquiry) => {
  const typeLabels = {
    'engagement-ring': 'Engagement Ring',
    'wedding-band': 'Wedding Band',
    'anniversary-gift': 'Anniversary Gift',
    necklace: 'Necklace / Pendant',
    earrings: 'Earrings',
    bracelet: 'Bracelet',
    redesign: 'Redesign / Reset',
    other: 'Other',
  };

  const budgetLabels = {
    'under-500': 'Under 500',
    '500-1000': '500 – 1,000',
    '1000-2500': '1,000 – 2,500',
    '2500-5000': '2,500 – 5,000',
    '5000-plus': '5,000+',
    open: 'Open / Not sure',
  };

  const timelineLabels = {
    'within-6-weeks': 'Within 6 weeks',
    'within-3-months': 'Within 3 months',
    'no-rush': 'No rush',
    'specific-date': 'Specific date',
  };

  const imagesHtml =
    inquiry.images && inquiry.images.length > 0
      ? inquiry.images
          .map(
            (img) =>
              `<a href="${img.url}" target="_blank"><img src="${img.url}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; margin-right: 8px; margin-bottom: 8px;" /></a>`
          )
          .join('')
      : '<p style="color: #999; font-size: 13px;">No images uploaded</p>';

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>New Custom Inquiry</title></head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #111; font-size: 24px; margin: 0 0 8px;">New Custom Inquiry</h1>
          <p style="color: #666; margin: 0; font-size: 14px;">Someone wants a bespoke piece. Reply within 24 hours.</p>
        </div>
        <div style="background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
          <h2 style="margin: 0 0 16px; font-size: 16px; color: #111;">Contact</h2>
          <p style="margin: 0 0 4px; color: #333;"><strong>${inquiry.name}</strong></p>
          <p style="margin: 0 0 4px; color: #666; font-size: 14px;">${inquiry.email}</p>
          ${inquiry.phone ? `<p style="margin: 0; color: #666; font-size: 14px;">${inquiry.phone}</p>` : ''}
        </div>
        <div style="background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
          <h2 style="margin: 0 0 16px; font-size: 16px; color: #111;">Request</h2>
          <table style="width: 100%; font-size: 14px;">
            <tr><td style="padding: 4px 0; color: #888;">Type</td><td style="padding: 4px 0; color: #111; font-weight: 600; text-align: right;">${typeLabels[inquiry.type] || inquiry.type}</td></tr>
            <tr><td style="padding: 4px 0; color: #888;">Budget</td><td style="padding: 4px 0; color: #111; font-weight: 600; text-align: right;">${inquiry.currency} ${budgetLabels[inquiry.budget] || inquiry.budget}</td></tr>
            <tr><td style="padding: 4px 0; color: #888;">Timeline</td><td style="padding: 4px 0; color: #111; font-weight: 600; text-align: right;">${timelineLabels[inquiry.timeline] || inquiry.timeline}</td></tr>
            ${inquiry.preferredDate ? `<tr><td style="padding: 4px 0; color: #888;">Target date</td><td style="padding: 4px 0; color: #eab308; font-weight: 600; text-align: right;">${new Date(inquiry.preferredDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td></tr>` : ''}
          </table>
        </div>
        <div style="background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
          <h2 style="margin: 0 0 12px; font-size: 16px; color: #111;">Their vision</h2>
          <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${inquiry.vision}</p>
        </div>
        ${inquiry.images && inquiry.images.length > 0 ? `<div style="background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 16px;"><h2 style="margin: 0 0 12px; font-size: 16px; color: #111;">Inspiration images</h2><div>${imagesHtml}</div></div>` : ''}
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/custom-inquiries" style="display: inline-block; background: #eab308; color: #111; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Open in Admin</a>
        </div>
        <div style="text-align: center; color: #888; font-size: 13px; margin-top: 30px;">
          <p>Inquiry ID: ${inquiry._id}</p>
          <p style="margin-top: 4px;">&copy; ${new Date().getFullYear()} GlitzByLissah</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// ==========================================
// CUSTOMER ACKNOWLEDGMENT EMAIL
// ==========================================
export const customInquiryCustomerEmail = (inquiry) => {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>We Received Your Custom Inquiry</title></head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #111; font-size: 26px; margin: 0 0 10px;">We've received your inquiry</h1>
          <p style="color: #666; margin: 0;">Thank you, ${inquiry.name}. Lissah is personally reviewing your request.</p>
        </div>
        <div style="background: #fff; border-radius: 12px; padding: 28px; margin-bottom: 20px;">
          <h2 style="margin: 0 0 16px; font-size: 18px; color: #111;">What happens next</h2>
          <table style="width: 100%; font-size: 14px; line-height: 1.7;">
            <tr><td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; width: 40px; color: #eab308; font-weight: 700;">1.</td><td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #333;">We'll reach out within <strong>24 hours</strong> to ask any clarifying questions.</td></tr>
            <tr><td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #eab308; font-weight: 700;">2.</td><td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #333;">Our designers will sketch concepts and source stones for your piece.</td></tr>
            <tr><td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #eab308; font-weight: 700;">3.</td><td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #333;">You'll approve the design and we'll begin crafting.</td></tr>
            <tr><td style="padding: 12px 0; color: #eab308; font-weight: 700;">4.</td><td style="padding: 12px 0; color: #333;">Your piece arrives in a signature box, ready for the moment.</td></tr>
          </table>
        </div>
        <div style="background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
          <h2 style="margin: 0 0 12px; font-size: 16px; color: #111;">A summary of what you shared</h2>
          <p style="margin: 0; padding: 12px; background: #fafaf7; border-radius: 8px; color: #333; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${inquiry.vision}</p>
        </div>
        <div style="text-align: center; margin: 30px 0; padding: 20px; background: #fef9e7; border-radius: 12px;">
          <p style="margin: 0; color: #666; font-size: 14px;">Questions in the meantime?</p>
          <p style="margin: 8px 0 0; color: #111; font-weight: 600;"><a href="mailto:support@glitzbylissah.com" style="color: #eab308; text-decoration: none;">support@glitzbylissah.com</a></p>
        </div>
        <div style="text-align: center; color: #888; font-size: 13px; margin-top: 30px;">
          <p>&copy; ${new Date().getFullYear()} GlitzByLissah. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};