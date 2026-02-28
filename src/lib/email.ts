"use server";

import { EmailClient, EmailMessage } from "@azure/communication-email";

// Initialize email client (lazy loaded)
let emailClient: EmailClient | null = null;

function getEmailClient(): EmailClient {
  if (!emailClient) {
    const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error("AZURE_COMMUNICATION_CONNECTION_STRING is not configured");
    }
    emailClient = new EmailClient(connectionString);
  }
  return emailClient;
}

// Email sender address - update this after configuring custom domain
const SENDER_ADDRESS =
  process.env.EMAIL_SENDER_ADDRESS ||
  "DoNotReply@<your-resource>.azurecomm.net";

// Wedding details - customize these
const WEDDING_DETAILS = {
  date: "1. svibnja 2027.",
  time: "19:00 sati",
  ceremonyVenue: "Crkva sv. Marka, Zagreb",
  receptionVenue: "Mansion Event Resort",
  receptionAddress: "Ul. Velimira Škorpika 11b, 10090, Zagreb, Croatia",
  contactEmail: "sven.scekic@gmail.com",
  contactPhone: "+385997898178",
};

interface GuestEmailData {
  name: string;
  surname: string;
  email: string;
  drinkPreferences?: string | null;
  otherRequests?: string | null;
}

function generateConfirmationEmailHtml(guest: GuestEmailData): string {
  const preferencesSection =
    guest.drinkPreferences || guest.otherRequests
      ? `
      <div style="background-color: #f8f5f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #5c4a3d; margin-top: 0;">Vaše preference:</h3>
        ${guest.drinkPreferences ? `<p><strong>Piće:</strong> ${guest.drinkPreferences}</p>` : ""}
        ${guest.otherRequests ? `<p><strong>Ostali zahtjevi:</strong> ${guest.otherRequests}</p>` : ""}
      </div>
    `
      : "";

  return `
<!DOCTYPE html>
<html lang="hr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Potvrda dolaska</title>
</head>
<body style="font-family: 'Georgia', serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 20px; margin-bottom: 30px;">
    <h1 style="color: #5c4a3d; margin-bottom: 10px;">Hvala na potvrdi!</h1>
    <p style="color: #8b7355; font-style: italic; font-size: 18px;">Radujemo se vašem dolasku</p>
  </div>

  <p>Dragi/a <strong>${guest.name} ${guest.surname}</strong>,</p>
  
  <p>Zaprimili smo vašu potvrdu dolaska na naše vjenčanje i iznimno nam je drago što ćete biti dio našeg posebnog dana!</p>

  <div style="background-color: #fdfbf7; border-left: 4px solid #d4af37; padding: 20px; margin: 25px 0;">
    <h2 style="color: #5c4a3d; margin-top: 0; font-size: 20px;">📅 Detalji vjenčanja</h2>
    
    <p style="margin: 10px 0;">
      <strong>Datum:</strong> ${WEDDING_DETAILS.date}<br>
      <strong>Vrijeme:</strong> ${WEDDING_DETAILS.time}
    </p>
    
    <p style="margin: 15px 0 5px 0;"><strong>⛪ Ceremonija:</strong></p>
    <p style="margin: 0; padding-left: 20px;">${WEDDING_DETAILS.ceremonyVenue}</p>
    
    <p style="margin: 15px 0 5px 0;"><strong>🍽️ Slavlje:</strong></p>
    <p style="margin: 0; padding-left: 20px;">
      ${WEDDING_DETAILS.receptionVenue}<br>
      <span style="color: #666; font-size: 14px;">${WEDDING_DETAILS.receptionAddress}</span>
    </p>
  </div>

  ${preferencesSection}

  <div style="background-color: #f0f7f4; padding: 20px; border-radius: 8px; margin: 25px 0;">
    <h3 style="color: #5c4a3d; margin-top: 0;">📞 Kontakt</h3>
    <p style="margin: 5px 0;">Ako imate bilo kakvih pitanja, slobodno nas kontaktirajte:</p>
    <p style="margin: 5px 0;">
      Email: <a href="mailto:${WEDDING_DETAILS.contactEmail}" style="color: #5c4a3d;">${WEDDING_DETAILS.contactEmail}</a><br>
      Telefon: ${WEDDING_DETAILS.contactPhone}
    </p>
  </div>

  <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0d8cf;">
    <p style="color: #8b7355; font-style: italic;">S ljubavlju,</p>
    <p style="color: #5c4a3d; font-size: 20px; font-weight: bold;">Sven & Tina</p>
  </div>

  <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
    Ova poruka je automatski poslana nakon potvrde vašeg dolaska.<br>
    Molimo ne odgovarajte na ovaj email.
  </p>
</body>
</html>
  `.trim();
}

function generateConfirmationEmailText(guest: GuestEmailData): string {
  let text = `
Hvala na potvrdi!

Dragi/a ${guest.name} ${guest.surname},

Zaprimili smo vašu potvrdu dolaska na naše vjenčanje i iznimno nam je drago što ćete biti dio našeg posebnog dana!

DETALJI VJENČANJA
-----------------
Datum: ${WEDDING_DETAILS.date}
Vrijeme: ${WEDDING_DETAILS.time}

Ceremonija:
${WEDDING_DETAILS.ceremonyVenue}

Slavlje:
${WEDDING_DETAILS.receptionVenue}
${WEDDING_DETAILS.receptionAddress}
`;

  if (guest.drinkPreferences || guest.otherRequests) {
    text += `
VAŠE PREFERENCE
---------------`;
    if (guest.drinkPreferences) {
      text += `\nPiće: ${guest.drinkPreferences}`;
    }
    if (guest.otherRequests) {
      text += `\nOstali zahtjevi: ${guest.otherRequests}`;
    }
    text += "\n";
  }

  text += `
KONTAKT
-------
Ako imate bilo kakvih pitanja, slobodno nas kontaktirajte:
Email: ${WEDDING_DETAILS.contactEmail}
Telefon: ${WEDDING_DETAILS.contactPhone}

S ljubavlju,
Sven & Tina

---
Ova poruka je automatski poslana nakon potvrde vašeg dolaska.
Molimo ne odgovarajte na ovaj email.
  `;

  return text.trim();
}

export async function sendRsvpConfirmationEmail(
  guest: GuestEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getEmailClient();

    console.log(SENDER_ADDRESS)
    const message: EmailMessage = {
      senderAddress: SENDER_ADDRESS,
      content: {
        subject: "Potvrda dolaska - Vjenčanje Sven & Tina",
        plainText: generateConfirmationEmailText(guest),
        html: generateConfirmationEmailHtml(guest),
      },
      recipients: {
        to: [
          {
            address: guest.email,
            displayName: `${guest.name} ${guest.surname}`,
          },
        ],
      },
    };

    const poller = await client.beginSend(message);
    const result = await poller.pollUntilDone();

    if (result.status === "Succeeded") {
      console.log(`Confirmation email sent to ${guest.email}`);
      return { success: true };
    } else {
      console.error(`Email send failed with status: ${result.status}`);
      return { success: false, error: `Status: ${result.status}` };
    }
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function sendBulkRsvpConfirmationEmails(
  guests: GuestEmailData[]
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const guest of guests) {
    if (!guest.email) {
      continue;
    }

    const result = await sendRsvpConfirmationEmail(guest);
    if (result.success) {
      sent++;
    } else {
      failed++;
    }

    // Small delay between emails to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return { sent, failed };
}
