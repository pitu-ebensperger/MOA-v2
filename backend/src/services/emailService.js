import nodemailer from 'nodemailer';
import 'dotenv/config';

// Variable global para el transporter
let transporter = null;

/**
 * Inicializar transporter de nodemailer
 * Si no hay configuración SMTP, usa Ethereal (emails de prueba)
 */
const createTransporter = async () => {
  // Si ya existe un transporter, reutilizarlo
  if (transporter) return transporter;

  // Si hay configuración SMTP, usarla
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return transporter;
  }

  // Si no hay configuración, usar Ethereal (testing)
  const testAccount = await nodemailer.createTestAccount();
  
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return transporter;
};

/**
 * Enviar email de reset de contraseña
 * @param {Object} params
 * @param {string} params.email - Email del destinatario
 * @param {string} params.nombre - Nombre del usuario
 * @param {string} params.token - Token de reset
 * @returns {Promise<Object>} Resultado del envío
 */
export const sendPasswordResetEmail = async ({ email, nombre, token }) => {
  // En modo test o si está deshabilitado, no enviar correos reales
  if (process.env.NODE_ENV === 'test' || process.env.DISABLE_EMAILS === 'true') {
    return {
      success: true,
      messageId: `mock-${Date.now()}`,
      previewUrl: null,
      accepted: [email],
      mocked: true,
    };
  }

  // Inicializar transporter (Ethereal si no hay config)
  const emailTransporter = await createTransporter();
  
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${frontendUrl}/auth/restablecer-contrasena?token=${token}`;
  const expirationMinutes = 60;
  const currentYear = new Date().getFullYear();

  const mailOptions = {
    from: `"MOA" <${process.env.SMTP_FROM || 'noreply@moa.cl'}>`,
    to: email,
    subject: 'Restablecer tu contraseña - MOA',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Restablecer contraseña</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6B5444 0%, #443114 100%); padding: 40px 30px; text-align: center; border-radius: 0;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 600; letter-spacing: 2px;">MOA</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Muebles de calidad</p>
        </div>
        
        <!-- Content -->
        <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #1f1f1f; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">Hola ${nombre || 'Usuario'},</h2>
          
          <p style="margin: 16px 0; font-size: 15px; color: #4b5563;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta en MOA.
          </p>
          
          <p style="margin: 16px 0; font-size: 15px; color: #4b5563;">
            Haz clic en el siguiente botón para crear una nueva contraseña:
          </p>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" 
               style="background: #6B5444; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(107, 84, 68, 0.3);">
              Restablecer Contraseña
            </a>
          </div>
          
          <!-- Alternative Link -->
          <p style="margin: 24px 0; font-size: 13px; color: #6b7280; background: #f9fafb; padding: 16px; border-radius: 6px; border-left: 3px solid #6B5444;">
            <strong>O copia y pega este enlace en tu navegador:</strong><br>
            <a href="${resetLink}" style="color: #6B5444; word-break: break-all; text-decoration: underline;">${resetLink}</a>
          </p>
          
          <!-- Warning Box -->
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              ⚠️ <strong>Este enlace expira en ${expirationMinutes} minutos.</strong>
            </p>
          </div>
          
          <p style="margin: 24px 0 0 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
            Si no solicitaste este cambio, puedes ignorar este correo de forma segura. Tu contraseña actual permanecerá sin cambios.
          </p>
          
          <!-- Divider -->
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
          
          <!-- Security Notice -->
          <div style="background: #f3f4f6; padding: 16px; border-radius: 6px; margin: 24px 0;">
            <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.6;">
              <strong>🔒 Consejos de seguridad:</strong><br>
              • Nunca compartas tu contraseña con nadie<br>
              • MOA nunca te pedirá tu contraseña por email<br>
              • Usa una contraseña única y segura
            </p>
          </div>
          
          <!-- Footer -->
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 24px 0 0 0; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            © ${currentYear} MOA. Todos los derechos reservados.<br>
            Este es un correo automático, por favor no respondas.
          </p>
        </div>
        
        <!-- Spacer -->
        <div style="height: 20px;"></div>
        
      </body>
      </html>
    `,
    text: `
Hola ${nombre || 'Usuario'},

Recibimos una solicitud para restablecer la contraseña de tu cuenta en MOA.

Para crear una nueva contraseña, haz clic en el siguiente enlace:
${resetLink}

Este enlace expira en ${expirationMinutes} minutos.

Si no solicitaste este cambio, puedes ignorar este correo de forma segura. Tu contraseña actual permanecerá sin cambios.

Consejos de seguridad:
• Nunca compartas tu contraseña con nadie
• MOA nunca te pedirá tu contraseña por email
• Usa una contraseña única y segura

---
© ${currentYear} MOA. Todos los derechos reservados.
Este es un correo automático, por favor no respondas.
    `,
  };

  try {
    const info = await emailTransporter.sendMail(mailOptions);
    
    // Si es Ethereal, mostrar URL para ver el email
    if (info.envelope && nodemailer.getTestMessageUrl(info)) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      return { 
        success: true, 
        messageId: info.messageId,
        previewUrl, // URL para ver el email en Ethereal
        accepted: info.accepted,
        rejected: info.rejected 
      };
    }
    
    return { 
      success: true, 
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected 
    };
  } catch (error) {
    console.error('[EmailService] ❌ Error al enviar email:', error);
    throw new Error('No se pudo enviar el correo de recuperación');
  }
};

/**
 * Verificar configuración de email
 * @returns {Promise<boolean>}
 */
export const verifyEmailConfig = async () => {
  try {
    const emailTransporter = await createTransporter();
    await emailTransporter.verify();
    return true;
  } catch (error) {
    console.error('[EmailService] ❌ Error de configuración SMTP:', error.message);
    return false;
  }
};

/**
 * Enviar email de confirmación de orden
 * @param {Object} params
 * @param {Object} params.order - Datos de la orden
 * @param {Object} params.user - Datos del usuario
 * @returns {Promise<Object>} Resultado del envío
 */
export const sendOrderConfirmationEmail = async ({ order, user }) => {
  if (process.env.NODE_ENV === 'test' || process.env.DISABLE_EMAILS === 'true') {
    return {
      success: true,
      messageId: `mock-order-${order?.orden_id || Date.now()}`,
      accepted: [user.email],
      mocked: true,
    };
  }

  const emailTransporter = await createTransporter();
  
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const orderUrl = `${frontendUrl}/perfil/ordenes/${order.orden_id}`;
  const currentYear = new Date().getFullYear();
  
  // Formatear precio
  const formatPrice = (cents) => {
    const clp = cents / 100;
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(clp);
  };

  const mailOptions = {
    from: `"MOA" <${process.env.SMTP_FROM || 'noreply@moa.cl'}>`,
    to: user.email,
    subject: `¡Orden confirmada! #${order.orden_id} - MOA`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de orden</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6B5444 0%, #443114 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 600; letter-spacing: 2px;">MOA</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Muebles de calidad</p>
        </div>
        
        <!-- Content -->
        <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;">
              ✓ Orden confirmada
            </div>
          </div>
          
          <h2 style="color: #1f1f1f; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">¡Gracias por tu compra, ${user.nombre || 'Cliente'}!</h2>
          
          <p style="margin: 16px 0; font-size: 15px; color: #4b5563;">
            Hemos recibido tu orden <strong>#${order.orden_id}</strong> y la estamos preparando.
          </p>
          
          <!-- Order Summary -->
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid #e5e7eb;">
            <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #6B5444;">Resumen de tu orden</h3>
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Subtotal:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${formatPrice(order.subtotal_cents)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Envío:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${order.envio_cents ? formatPrice(order.envio_cents) : 'Gratis'}</td>
              </tr>
              <tr style="border-top: 2px solid #e5e7eb;">
                <td style="padding: 12px 0 0 0; color: #1f1f1f; font-weight: 600; font-size: 16px;">Total:</td>
                <td style="padding: 12px 0 0 0; text-align: right; font-weight: 700; font-size: 18px; color: #6B5444;">${formatPrice(order.total_cents)}</td>
              </tr>
            </table>
          </div>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${orderUrl}" 
               style="background: #6B5444; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(107, 84, 68, 0.3);">
              Ver detalles de mi orden
            </a>
          </div>
          
          <p style="margin: 24px 0; font-size: 14px; color: #6b7280; text-align: center;">
            Estado actual: <strong style="color: #6B5444;">${order.estado_pago === 'pendiente' ? 'Pago pendiente' : order.estado_pago}</strong>
          </p>
          
          <!-- Divider -->
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
          
          <!-- Help Section -->
          <div style="background: #f3f4f6; padding: 16px; border-radius: 6px;">
            <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.6;">
              <strong>¿Necesitas ayuda?</strong><br>
              Si tienes alguna pregunta sobre tu orden, no dudes en contactarnos.
            </p>
          </div>
          
          <!-- Footer -->
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 24px 0 0 0; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            © ${currentYear} MOA. Todos los derechos reservados.<br>
            Este es un correo automático, por favor no respondas.
          </p>
        </div>
        
        <!-- Spacer -->
        <div style="height: 20px;"></div>
        
      </body>
      </html>
    `,
    text: `
¡Gracias por tu compra, ${user.nombre || 'Cliente'}!

Hemos recibido tu orden #${order.orden_id} y la estamos preparando.

Resumen de tu orden:
- Subtotal: ${formatPrice(order.subtotal_cents)}
- Envío: ${order.envio_cents ? formatPrice(order.envio_cents) : 'Gratis'}
- Total: ${formatPrice(order.total_cents)}

Estado actual: ${order.estado_pago === 'pendiente' ? 'Pago pendiente' : order.estado_pago}

Puedes ver los detalles completos de tu orden aquí:
${orderUrl}

---
© ${currentYear} MOA. Todos los derechos reservados.
Este es un correo automático, por favor no respondas.
    `,
  };

  try {
    const info = await emailTransporter.sendMail(mailOptions);
    
    if (info.envelope && nodemailer.getTestMessageUrl(info)) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      return { 
        success: true, 
        messageId: info.messageId,
        previewUrl,
        accepted: info.accepted,
        rejected: info.rejected 
      };
    }
    
    return { 
      success: true, 
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected 
    };
  } catch (error) {
    console.error('[EmailService] ❌ Error al enviar email de confirmación:', error);
    throw new Error('No se pudo enviar el correo de confirmación');
  }
};

/**
 * Enviar email de prueba
 * Solo para desarrollo
 */
export const sendTestEmail = async (to) => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Test email solo disponible en desarrollo');
  }

  const emailTransporter = await createTransporter();
  const mailOptions = {
    from: `"MOA Test" <${process.env.SMTP_FROM || 'test@moa.cl'}>`,
    to,
    subject: 'Test Email - MOA',
    html: '<h1>Email funcionando correctamente</h1><p>Este es un email de prueba.</p>',
    text: 'Email funcionando correctamente. Este es un email de prueba.',
  };

  try {
    const info = await emailTransporter.sendMail(mailOptions);
    
    // Si es Ethereal, mostrar URL
    if (nodemailer.getTestMessageUrl(info)) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      return { success: true, messageId: info.messageId, previewUrl };
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EmailService] ❌ Error al enviar test email:', error);
    throw error;
  }
};
