import nodemailer from 'nodemailer'

const createTransporter = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_USER !== 'your_email@gmail.com') {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })
  }
  return null
}

export const sendVerificationEmail = async (email, token, name) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
  const verificationLink = `${clientUrl}/verify-email?token=${token}`

  console.log(`[EMAIL DISPATCH] Verification link for ${email}: ${verificationLink}`)

  const transporter = createTransporter()
  if (!transporter) {
    return true
  }

  const mailOptions = {
    from: `"Pizza Delivery" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your Pizza Delivery account',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #ea580c; margin-top: 0;">Welcome to Pizza Delivery, ${name}!</h2>
        <p style="color: #4b5563; line-height: 1.5;">Thank you for registering. Please verify your email address to activate your account and start ordering delicious pizzas.</p>
        <div style="margin: 32px 0;">
          <a href="${verificationLink}" style="background-color: #ea580c; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Verify Email Address</a>
        </div>
        <p style="color: #9ca3af; font-size: 14px;">If the button above does not work, copy and paste this link into your browser:</p>
        <p style="color: #ea580c; font-size: 14px; word-break: break-all;">${verificationLink}</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0;">This link will expire in 24 hours. If you did not sign up, please ignore this email.</p>
      </div>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error(`Failed to send verification email: ${error.message}`)
    return false
  }
}

export const sendPasswordResetEmail = async (email, token, name) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
  const resetLink = `${clientUrl}/reset-password?token=${token}`

  console.log(`[EMAIL DISPATCH] Password reset link for ${email}: ${resetLink}`)

  const transporter = createTransporter()
  if (!transporter) {
    return true
  }

  const mailOptions = {
    from: `"Pizza Delivery Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset your Pizza Delivery password',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #ea580c; margin-top: 0;">Password Reset Request</h2>
        <p style="color: #4b5563; line-height: 1.5;">Hello ${name}, we received a request to reset your password. Click the button below to choose a new one:</p>
        <div style="margin: 32px 0;">
          <a href="${resetLink}" style="background-color: #ea580c; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #9ca3af; font-size: 14px;">If you did not request this, you can safely ignore this email.</p>
        <p style="color: #ea580c; font-size: 14px; word-break: break-all;">${resetLink}</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0;">This reset link is valid for 1 hour.</p>
      </div>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error(`Failed to send password reset email: ${error.message}`)
    return false
  }
}

export const sendLowStockAlertEmail = async (adminEmail, lowStockItems) => {
  console.log(`[STOCK ALERT DISPATCH] Low stock warning for ${lowStockItems.length} items to ${adminEmail}`)

  const transporter = createTransporter()
  if (!transporter) {
    return true
  }

  const itemsHtml = lowStockItems
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px; font-weight: 500;">${item.name}</td>
        <td style="padding: 10px; text-transform: capitalize; color: #6b7280;">${item.category}</td>
        <td style="padding: 10px; font-weight: bold; color: #dc2626;">${item.stock} ${item.unit || 'units'}</td>
        <td style="padding: 10px; color: #6b7280;">${item.threshold}</td>
      </tr>
    `
    )
    .join('')

  const mailOptions = {
    from: `"Pizza Delivery System" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `🚨 Inventory Alert: ${lowStockItems.length} Items Below Threshold`,
    html: `
      <div style="font-family: sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; border: 1px solid #fecaca; border-radius: 8px; background-color: #fffaf0;">
        <h2 style="color: #dc2626; margin-top: 0;">⚠️ Low Inventory Alert</h2>
        <p style="color: #4b5563;">The scheduled inventory monitor detected items with current stock below their configured safety thresholds.</p>
        <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 6px; overflow: hidden; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f3f4f6; text-align: left; font-size: 13px; color: #374151;">
              <th style="padding: 10px;">Item</th>
              <th style="padding: 10px;">Category</th>
              <th style="padding: 10px;">Current Stock</th>
              <th style="padding: 10px;">Threshold</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <p style="color: #4b5563; font-size: 14px;">Please restock these items soon in the Admin Inventory Panel to avoid order disruptions.</p>
      </div>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error(`Failed to send low stock alert email: ${error.message}`)
    return false
  }
}
