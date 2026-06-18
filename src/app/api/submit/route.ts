import { NextRequest } from "next/server";
import nodemailer from "nodemailer";
import { saveSubmission } from "@/lib/db";

// Helper to format WhatsApp URLs with prefilled messages
function getWhatsAppLink(phoneStr: string, message: string) {
  let cleaned = phoneStr.replace(/\D/g, "");
  // If UAE number lacks country code (starts with 05 and is 10 digits), replace the leading 0 with 971
  if (cleaned.startsWith("05") && cleaned.length === 10) {
    cleaned = "971" + cleaned.substring(1);
  } else if (cleaned.startsWith("5") && cleaned.length === 9) {
    // If UAE number lacks leading 0 (e.g. 50 123 4567), prepend 971
    cleaned = "971" + cleaned;
  }
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formType } = body;

    if (!formType) {
      return Response.json(
        { success: false, message: "Missing formType in request body." },
        { status: 400 }
      );
    }

    // Determine target recipient email
    const recipientEmail = process.env.NOTIFICATION_EMAIL || "ijas@mccollinsmedia.com, meghna@mccollinsmedia.com";

    // Build the email details based on the form type
    let subject = "";
    let htmlContent = "";
    let textContent = "";

    if (formType === "register") {
      const { name, age, phone, email, address, registering, shareList, learnList, note } = body;

      if (!name || !age || !phone || !email || !address || !registering) {
        return Response.json(
          { success: false, message: "Missing required fields for registration." },
          { status: 400 }
        );
      }

      const welcomeMessage = `Hello ${name}, 😊 \n\nthank you for your request to join the Arabian Ranches Circle! We have received your details and are excited to welcome you. \n\nOne of our community hosts will share further details shortly. \n\nPlease let us know if you have any questions!`;
      const whatsAppUrl = getWhatsAppLink(phone, welcomeMessage);

      subject = `New Registration Request: ${name}`;
      textContent = `
New Registration Request received!

Name: ${name}
Age: ${age}
WhatsApp: ${phone} (Connect: ${whatsAppUrl})
Email: ${email}
Sub-community: ${address}
Registering for: ${registering}
Interests to Share: ${shareList && shareList.length > 0 ? shareList.join(", ") : "None selected"}
Interests to Learn: ${learnList && learnList.length > 0 ? learnList.join(", ") : "None selected"}
Note/Bio: ${note || "None"}
      `.trim();

      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #c79a4b; border-radius: 8px; overflow: hidden; background-color: #faf8f5;">
          <div style="background-color: #c79a4b; padding: 24px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 24px; font-weight: normal; letter-spacing: 1px;">New Registration Request</h2>
            <p style="margin: 4px 0 0 0; font-style: italic; opacity: 0.9;">~ join the circle ~</p>
          </div>
          <div style="padding: 24px; color: #333333; line-height: 1.6;">
            <p style="margin-top: 0; font-size: 16px;">A new seat request has been submitted on the Arabian Ranches Circle website. Here are the details:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; font-weight: bold; width: 35%;">Full Name</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; font-weight: bold;">Age Group</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea;">${age}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; font-weight: bold;">WhatsApp</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea;"><a href="https://wa.me/${phone.replace(/[^0-9]/g, "")}" style="color: #c79a4b; text-decoration: none; font-weight: bold;">${phone}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; font-weight: bold;">Email</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea;"><a href="mailto:${email}" style="color: #c79a4b; text-decoration: none;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; font-weight: bold;">Sub-Community</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea;">${address}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; font-weight: bold;">Registering For</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea;">${registering}</td>
              </tr>
            </table>

            <div style="margin-top: 24px; padding: 16px; background-color: #f3edd7; border-left: 4px solid #c79a4b; border-radius: 4px;">
              <h4 style="margin: 0 0 8px 0; color: #7f5d1b;">Expertise / Skills to Share</h4>
              <p style="margin: 0; font-size: 14px;">${shareList && shareList.length > 0 ? shareList.join(", ") : "None selected"}</p>
            </div>

            <div style="margin-top: 16px; padding: 16px; background-color: #f3edd7; border-left: 4px solid #c79a4b; border-radius: 4px;">
              <h4 style="margin: 0 0 8px 0; color: #7f5d1b;">Interests to Learn</h4>
              <p style="margin: 0; font-size: 14px;">${learnList && learnList.length > 0 ? learnList.join(", ") : "None selected"}</p>
            </div>

            ${note ? `
              <div style="margin-top: 24px;">
                <h4 style="margin: 0 0 8px 0; color: #333333;">About this member:</h4>
                <blockquote style="margin: 0; padding: 12px 20px; border-left: 3px solid #cccccc; font-style: italic; background-color: #f9f9f9; color: #555555;">
                  ${note.replace(/\n/g, "<br/>")}
                </blockquote>
              </div>
            ` : ""}

            <div style="margin-top: 32px; text-align: center;">
              <a href="${whatsAppUrl}" target="_blank" style="display: inline-block; background-color: #25D366; color: white; padding: 14px 28px; font-weight: bold; text-decoration: none; border-radius: 6px; font-size: 16px; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.25); font-family: Arial, sans-serif;">
                Connect on WhatsApp
              </a>
            </div>
          </div>
          <div style="background-color: #eaeaea; padding: 16px; text-align: center; font-size: 12px; color: #666666;">
            This email was generated automatically from the Arabian Ranches Circle website.
          </div>
        </div>
      `;
    } else if (formType === "become-buddy") {
      const { name, phone, free, helpList } = body;

      if (!name || !phone || !free) {
        return Response.json(
          { success: false, message: "Missing required fields for becoming a buddy." },
          { status: 400 }
        );
      }

      const welcomeMessage = `Hello ${name}, thank you so much for volunteering to be a Buddy with the Arabian Ranches Circle! We are extremely grateful for your kindness. A host will reach out to you shortly to match you with a neighbour. Welcome to the team!`;
      const whatsAppUrl = getWhatsAppLink(phone, welcomeMessage);

      subject = `New Buddy Volunteer Sign-up: ${name}`;
      textContent = `
New Buddy Volunteer Sign-up received!

Name: ${name}
WhatsApp: ${phone} (Connect: ${whatsAppUrl})
Availability: ${free}
Happy to help with: ${helpList && helpList.length > 0 ? helpList.join(", ") : "None selected"}
      `.trim();

      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #c79a4b; border-radius: 8px; overflow: hidden; background-color: #faf8f5;">
          <div style="background-color: #c79a4b; padding: 24px; text-align: center; color: white;">
            <h2 style="margin: 0; font-size: 24px; font-weight: normal; letter-spacing: 1px;">Become a Buddy Volunteer</h2>
            <p style="margin: 4px 0 0 0; font-style: italic; opacity: 0.9;">~ a hand to hold ~</p>
          </div>
          <div style="padding: 24px; color: #333333; line-height: 1.6;">
            <p style="margin-top: 0; font-size: 16px;">A new volunteer has offered to be a Buddy. Here are the details:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; font-weight: bold; width: 35%;">Volunteer Name</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; font-weight: bold;">WhatsApp</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea;"><a href="https://wa.me/${phone.replace(/[^0-9]/g, "")}" style="color: #c79a4b; text-decoration: none; font-weight: bold;">${phone}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; font-weight: bold;">Availability</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea;">${free}</td>
              </tr>
            </table>

            <div style="margin-top: 24px; padding: 16px; background-color: #f3edd7; border-left: 4px solid #c79a4b; border-radius: 4px;">
              <h4 style="margin: 0 0 8px 0; color: #7f5d1b;">Happy to help with:</h4>
              <p style="margin: 0; font-size: 14px;">${helpList && helpList.length > 0 ? helpList.join(", ") : "None selected"}</p>
            </div>

            <div style="margin-top: 32px; text-align: center;">
              <a href="${whatsAppUrl}" target="_blank" style="display: inline-block; background-color: #25D366; color: white; padding: 14px 28px; font-weight: bold; text-decoration: none; border-radius: 6px; font-size: 16px; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.25); font-family: Arial, sans-serif;">
                Connect on WhatsApp
              </a>
            </div>
          </div>
          <div style="background-color: #eaeaea; padding: 16px; text-align: center; font-size: 12px; color: #666666;">
            This email was generated automatically from the Arabian Ranches Circle website.
          </div>
        </div>
      `;
    } else if (formType === "request-buddy") {
      const { name, phone, often, needList } = body;

      if (!name || !phone || !often) {
        return Response.json(
          { success: false, message: "Missing required fields for requesting a buddy." },
          { status: 400 }
        );
      }

      const welcomeMessage = `Hello ${name}, we have received your request for a Buddy with the Arabian Ranches Circle. We are revieweing your details to match you with a suitable buddy in your neighbourhood and will reach out to you shortly. Rest assured, all matching is kept private.`;
      const whatsAppUrl = getWhatsAppLink(phone, welcomeMessage);

      subject = `New Buddy Help Request: ${name}`;
      textContent = `
New Buddy Help Request received!

Recipient Name: ${name}
WhatsApp: ${phone} (Connect: ${whatsAppUrl})
Frequency/When: ${often}
Needs help with: ${needList && needList.length > 0 ? needList.join(", ") : "None selected"}
      `.trim();

      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #c79a4b; border-radius: 8px; overflow: hidden; background-color: #faf8f5;">
          <div style="background-color: #1a1a1a; padding: 24px; text-align: center; color: #c79a4b; border-bottom: 1px solid #c79a4b;">
            <h2 style="margin: 0; font-size: 24px; font-weight: normal; letter-spacing: 1px;">Buddy Help Request (Private)</h2>
            <p style="margin: 4px 0 0 0; font-style: italic; opacity: 0.9;">~ a hand to hold ~</p>
          </div>
          <div style="padding: 24px; color: #333333; line-height: 1.6;">
            <p style="margin-top: 0; font-size: 16px;">A new request for a Buddy has been submitted. Please handle this match confidentially.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; font-weight: bold; width: 35%;">Member Name</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; font-weight: bold;">WhatsApp</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea;"><a href="https://wa.me/${phone.replace(/[^0-9]/g, "")}" style="color: #c79a4b; text-decoration: none; font-weight: bold;">${phone}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; font-weight: bold;">How Often / When</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea;">${often}</td>
              </tr>
            </table>

            <div style="margin-top: 24px; padding: 16px; background-color: #f3edd7; border-left: 4px solid #c79a4b; border-radius: 4px;">
              <h4 style="margin: 0 0 8px 0; color: #7f5d1b;">Requested tasks / assistance:</h4>
              <p style="margin: 0; font-size: 14px;">${needList && needList.length > 0 ? needList.join(", ") : "None selected"}</p>
            </div>

            <div style="margin-top: 32px; text-align: center;">
              <a href="${whatsAppUrl}" target="_blank" style="display: inline-block; background-color: #25D366; color: white; padding: 14px 28px; font-weight: bold; text-decoration: none; border-radius: 6px; font-size: 16px; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.25); font-family: Arial, sans-serif;">
                Connect on WhatsApp
              </a>
            </div>
          </div>
          <div style="background-color: #eaeaea; padding: 16px; text-align: center; font-size: 12px; color: #666666;">
            This email was generated automatically from the Arabian Ranches Circle website.
          </div>
        </div>
      `;
    } else {
      return Response.json(
        { success: false, message: "Invalid formType." },
        { status: 400 }
      );
    }

    // Save submission to local database
    await saveSubmission({
      id: Date.now().toString() + "-" + Math.random().toString(36).substring(2, 6),
      submittedAt: new Date().toISOString(),
      ...body
    });

    // SMTP Configuration
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || `"Arabian Ranches Circle" <${smtpUser || "noreply@arabianranches.com"}>`;

    // Fallback mode if SMTP configuration is missing
    if (!smtpUser || !smtpPass) {
      console.warn("=================================================");
      console.warn("WARNING: SMTP credentials not fully configured.");
      console.warn(`Simulating email notification to: ${recipientEmail}`);
      console.warn(`Subject: ${subject}`);
      console.warn(`Plaintext content:\n${textContent}`);
      console.warn("=================================================");

      return Response.json(
        { 
          success: true, 
          message: "Form received successfully (Demo Mode - email logged to console)." 
        },
        { status: 200 }
      );
    }

    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost || "smtp.gmail.com",
      port: parseInt(smtpPort || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Send email
    await transporter.sendMail({
      from: smtpFrom,
      to: recipientEmail,
      subject: subject,
      text: textContent,
      html: htmlContent,
    });

    return Response.json(
      { success: true, message: "Notification email sent successfully." },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Error handling form submission:", error);
    return Response.json(
      { 
        success: false, 
        message: "An internal server error occurred while sending notification email.",
        error: error.message 
      },
      { status: 500 }
    );
  }
}
