// ==========================================
// ORDER CONFIRMATION EMAIL
// ==========================================
export const orderConfirmationEmail = (order) => {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" />
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <p style="margin: 0; font-weight: 600; color: #333;">${item.name}</p>
          <p style="margin: 4px 0 0; font-size: 13px; color: #888;">
            Qty: ${item.quantity}${item.size ? ` | Size: ${item.size}` : ''}
          </p>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600; color: #eab308;">
          $${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #111; font-size: 28px; margin: 0 0 10px;">Thank You for Your Order! 🎉</h1>
          <p style="color: #666; margin: 0;">
            We've received your order and will process it shortly.
          </p>
        </div>

        <!-- Order ID Card -->
        <div style="background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <p style="margin: 0 0 4px; font-size: 13px; color: #888;">Order ID</p>
          <p style="margin: 0; font-size: 20px; font-weight: 700; color: #111;">
            #${order._id.toString().slice(-8).toUpperCase()}
          </p>
          <p style="margin: 12px 0 0; font-size: 13px; color: #888;">
            Placed on ${new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <!-- Items -->
        <div style="background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <h2 style="margin: 0 0 16px; font-size: 18px; color: #111;">Order Items</h2>
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsHtml}
          </table>
          
          <!-- Totals -->
          <div style="margin-top: 20px; padding-top: 16px; border-top: 2px solid #f3f4f6;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #666; font-size: 14px;">Subtotal</span>
              <span style="color: #333; font-size: 14px;">$${order.total.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #666; font-size: 14px;">Shipping</span>
              <span style="color: #22c55e; font-size: 14px;">Free</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 1px solid #f3f4f6;">
              <span style="color: #111; font-weight: 700; font-size: 16px;">Total</span>
              <span style="color: #eab308; font-weight: 700; font-size: 16px;">$${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <!-- Shipping Address -->
        <div style="background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <h2 style="margin: 0 0 16px; font-size: 18px; color: #111;">Shipping Address</h2>
          <p style="margin: 0 0 4px; color: #333; font-weight: 600;">
            ${order.address.firstName} ${order.address.lastName}
          </p>
          <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">
            ${order.address.street}<br>
            ${order.address.city}, ${order.address.state} ${order.address.zipCode}<br>
            ${order.address.country}<br>
            Phone: ${order.address.phone}
          </p>
        </div>

        <!-- Payment -->
        <div style="background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <h2 style="margin: 0 0 12px; font-size: 18px; color: #111;">Payment Method</h2>
          <p style="margin: 0; color: #333;">
            <strong>${order.paymentMethod}</strong>
            ${
              order.paymentMethod === 'COD'
                ? '<br><span style="color: #eab308; font-size: 13px;">Pay on delivery</span>'
                : ''
            }
          </p>
        </div>

        <!-- Track Order CTA -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/track-order" 
             style="display: inline-block; background: #eab308; color: #111; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Track Your Order
          </a>
        </div>

        <!-- Footer -->
        <div style="text-align: center; color: #888; font-size: 13px; margin-top: 30px;">
          <p>Questions? Contact us at support@glitzbylissah.com</p>
          <p style="margin-top: 8px;">© ${new Date().getFullYear()} GlitzByLissah. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// ==========================================
// ORDER STATUS UPDATE EMAIL
// ==========================================
export const orderStatusUpdateEmail = (order, newStatus) => {
  const statusColors = {
    Shipped: '#3b82f6',
    'Out for Delivery': '#8b5cf6',
    Delivered: '#22c55e',
    Cancelled: '#ef4444',
    Processing: '#eab308',
  };

  const statusMessages = {
    Processing: 'Your order is being prepared.',
    Shipped: 'Great news! Your order is on the way.',
    'Out for Delivery': 'Your order is out for delivery today!',
    Delivered: 'Your order has been delivered. We hope you love it!',
    Cancelled: 'Your order has been cancelled.',
  };

  const color = statusColors[newStatus] || '#eab308';
  const message = statusMessages[newStatus] || 'Your order status has been updated.';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Status Update</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #111; font-size: 26px; margin: 0 0 10px;">Order Update</h1>
          <p style="color: #666; margin: 0;">
            Your order #${order._id.toString().slice(-8).toUpperCase()} status has changed.
          </p>
        </div>

        <div style="background: #fff; border-radius: 12px; padding: 32px; margin-bottom: 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <div style="display: inline-block; background: ${color}; color: #fff; padding: 10px 24px; border-radius: 999px; font-weight: 600; font-size: 14px; margin-bottom: 16px;">
            ${newStatus}
          </div>
          <p style="color: #666; margin: 0; font-size: 15px;">
            ${message}
          </p>
          ${
            order.trackingNumber
              ? `<p style="margin: 20px 0 0; padding-top: 20px; border-top: 1px solid #f3f4f6; color: #333;">
                  <strong>Tracking Number:</strong> ${order.trackingNumber}
                </p>`
              : ''
          }
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/track-order" 
             style="display: inline-block; background: #eab308; color: #111; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            View Order Status
          </a>
        </div>

        <div style="text-align: center; color: #888; font-size: 13px; margin-top: 30px;">
          <p>© ${new Date().getFullYear()} GlitzByLissah. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};