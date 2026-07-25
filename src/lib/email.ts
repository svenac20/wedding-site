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

// Friendly "from" name shown in the inbox (e.g. "Tina i Sven").
// NOTE: Azure Communication Services only honours a custom display name on a
// verified custom domain. On the free azurecomm.net managed domain the sender
// stays "DoNotReply", so leave EMAIL_SENDER_NAME unset until the domain is set up.
const SENDER_NAME = process.env.EMAIL_SENDER_NAME?.trim();

const FROM_ADDRESS = SENDER_NAME
  ? `${SENDER_NAME} <${SENDER_ADDRESS}>`
  : SENDER_ADDRESS;

// Wedding details - customize these
const WEDDING_DETAILS = {
  coupleNames: "Tina & Sven",
  date: "1. svibnja 2027.",
  dateShort: "1. svibnja 2027.",
  location: "Zagreb",
  time: "19:00 sati",
  ceremonyVenue: "Crkva sv. Marka, Zagreb",
  receptionVenue: "Mansion Event Resort",
  receptionAddress: "Ul. Velimira Škorpika 11b, 10090, Zagreb, Croatia",
  contacts: [
    { name: "Sven", email: "sven.scekic@gmail.com", phone: "+385997898178" },
    { name: "Tina", email: "tinamelkic@gmail.com", phone: "+385998373201" },
  ],
  websiteUrl: process.env.NEXT_PUBLIC_SITE_URL || "",
};

// Palette mirrored from the website (src/app/globals.css)
const COLORS = {
  ink: "#304254",
  blue: "#b2d6e9",
  blueDeep: "#a0bdca",
  blueLight: "#deebf0",
  blueMuted: "#a6aec4",
  pink: "#f7ebe9",
  gray: "#737373",
  offWhite: "#f9f7f8",
  white: "#ffffff",
};

const FONT_SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const FONT_SANS = "'Montserrat', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const FONT_SCRIPT = "'Great Vibes', 'Segoe Script', 'Brush Script MT', cursive";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface GuestEmailData {
  name: string;
  surname: string;
  email: string;
  drinkPreferences?: string | null;
  otherRequests?: string | null;
}

function detailRow(label: string, value: string): string {
  return `
        <tr>
          <td style="padding: 0 0 18px 0;">
            <p style="margin: 0 0 4px 0; font-family: ${FONT_SANS}; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: ${COLORS.gray};">${label}</p>
            <p style="margin: 0; font-family: ${FONT_SERIF}; font-size: 18px; line-height: 1.45; color: ${COLORS.ink};">${value}</p>
          </td>
        </tr>`;
}

function generateConfirmationEmailHtml(guest: GuestEmailData): string {
  const fullName = escapeHtml(`${guest.name} ${guest.surname}`.trim());
  const drinks = guest.drinkPreferences ? escapeHtml(guest.drinkPreferences) : "";
  const requests = guest.otherRequests ? escapeHtml(guest.otherRequests) : "";

  const preferencesSection =
    drinks || requests
      ? `
      <tr>
        <td class="gutter" style="padding: 0 40px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${COLORS.pink}; border-radius: 4px;">
            <tr>
              <td style="padding: 28px 30px;">
                <p style="margin: 0 0 20px 0; font-family: ${FONT_SERIF}; font-size: 15px; letter-spacing: 0.2em; text-transform: uppercase; color: ${COLORS.ink};">Vaše preference</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  ${drinks ? detailRow("Piće", drinks) : ""}
                  ${requests ? detailRow("Ostali zahtjevi", requests) : ""}
                </table>
                <p style="margin: 2px 0 0 0; font-family: ${FONT_SANS}; font-size: 12px; line-height: 1.6; color: ${COLORS.gray};">Ako se nešto promijeni, samo nam odgovorite na ovaj email.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr><td style="height: 32px; line-height: 32px; font-size: 0;">&nbsp;</td></tr>`
      : "";

  const websiteLink = WEDDING_DETAILS.websiteUrl
    ? `<p style="margin: 16px 0 0 0; font-family: ${FONT_SANS}; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase;">
        <a href="${WEDDING_DETAILS.websiteUrl}" style="color: ${COLORS.blueMuted}; text-decoration: none;">Posjetite našu stranicu</a>
      </p>`
    : "";

  return `
<!DOCTYPE html>
<html lang="hr" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Potvrda dolaska</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Great+Vibes&family=Montserrat:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    table { border-collapse: collapse; }
    a { color: ${COLORS.ink}; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .gutter { padding-left: 24px !important; padding-right: 24px !important; }
      .names { font-size: 26px !important; letter-spacing: 0.16em !important; }
      .script { font-size: 30px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.blueLight};">
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; font-size: 1px; line-height: 1px; color: ${COLORS.blueLight};">
    Vaša potvrda dolaska je zaprimljena — vidimo se ${WEDDING_DETAILS.dateShort}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${COLORS.blueLight};">
    <tr>
      <td align="center" style="padding: 32px 12px;">

        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width: 600px; max-width: 600px; background-color: ${COLORS.white};">

          <!-- Header -->
          <tr>
            <td align="center" class="gutter" style="background-color: ${COLORS.blue}; padding: 48px 40px;">
              <p class="names" style="margin: 0; font-family: ${FONT_SERIF}; font-size: 32px; font-weight: 300; letter-spacing: 0.24em; text-transform: uppercase; color: ${COLORS.white};">
                Tina &nbsp;&amp;&nbsp; Sven
              </p>
              <p style="margin: 18px 0 0 0; font-family: ${FONT_SANS}; font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: ${COLORS.white};">
                ${WEDDING_DETAILS.dateShort} &nbsp;·&nbsp; ${WEDDING_DETAILS.location}
              </p>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td align="center" class="gutter" style="padding: 48px 40px 0 40px;">
              <h1 style="margin: 0; font-family: ${FONT_SERIF}; font-size: 22px; font-weight: 400; letter-spacing: 0.2em; text-transform: uppercase; color: ${COLORS.ink};">
                Hvala na potvrdi
              </h1>
              <p class="script" style="margin: 12px 0 0 0; font-family: ${FONT_SCRIPT}; font-size: 34px; line-height: 1.3; color: ${COLORS.blueDeep};">
                Radujemo se vašem dolasku
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 28px auto 0 auto;">
                <tr><td style="width: 56px; height: 1px; background-color: ${COLORS.blue}; font-size: 0; line-height: 1px;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td class="gutter" style="padding: 32px 40px 36px 40px;">
              <p style="margin: 0 0 16px 0; font-family: ${FONT_SANS}; font-size: 15px; line-height: 1.75; color: ${COLORS.ink};">
                Dragi/a ${fullName},
              </p>
              <p style="margin: 0; font-family: ${FONT_SANS}; font-size: 15px; line-height: 1.75; color: ${COLORS.ink};">
                Zaprimili smo vašu potvrdu dolaska i iznimno nam je drago što ćete biti dio našeg posebnog dana. Ispod su svi detalji — sačuvajte ovaj email za svaki slučaj.
              </p>
            </td>
          </tr>

          <!-- Wedding details -->
          <tr>
            <td class="gutter" style="padding: 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${COLORS.blueLight}; border-radius: 4px;">
                <tr>
                  <td style="padding: 32px 30px 14px 30px;">
                    <p style="margin: 0 0 22px 0; font-family: ${FONT_SERIF}; font-size: 15px; letter-spacing: 0.2em; text-transform: uppercase; color: ${COLORS.ink};">Detalji vjenčanja</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      ${detailRow("Datum", WEDDING_DETAILS.date)}
                      ${detailRow("Vrijeme", WEDDING_DETAILS.time)}
                      ${detailRow("Ceremonija", WEDDING_DETAILS.ceremonyVenue)}
                      ${detailRow(
                        "Slavlje",
                        `${WEDDING_DETAILS.receptionVenue}<br><span style="font-family: ${FONT_SANS}; font-size: 13px; color: ${COLORS.gray};">${WEDDING_DETAILS.receptionAddress}</span>`
                      )}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr><td style="height: 32px; line-height: 32px; font-size: 0;">&nbsp;</td></tr>

          ${preferencesSection}

          <!-- Contact -->
          <tr>
            <td align="center" class="gutter" style="padding: 0 40px 40px 40px;">
              <p style="margin: 0 0 18px 0; font-family: ${FONT_SANS}; font-size: 11px; letter-spacing: 0.24em; text-transform: uppercase; color: ${COLORS.gray};">Imate pitanje?</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                ${WEDDING_DETAILS.contacts
                  .map(
                    (contact) => `
                <tr>
                  <td align="center" style="padding: 0 0 16px 0;">
                    <p style="margin: 0 0 2px 0; font-family: ${FONT_SERIF}; font-size: 16px; letter-spacing: 0.14em; text-transform: uppercase; color: ${COLORS.ink};">${contact.name}</p>
                    <p style="margin: 0; font-family: ${FONT_SANS}; font-size: 14px; line-height: 1.7; color: ${COLORS.ink};">
                      <a href="mailto:${contact.email}" style="color: ${COLORS.ink}; text-decoration: none;">${contact.email}</a><br>
                      <a href="tel:${contact.phone}" style="color: ${COLORS.ink}; text-decoration: none;">${contact.phone}</a>
                    </p>
                  </td>
                </tr>`
                  )
                  .join("")}
              </table>
              ${websiteLink}
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td align="center" style="background-color: ${COLORS.pink}; padding: 36px 40px;">
              <p style="margin: 0; font-family: ${FONT_SANS}; font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; color: ${COLORS.gray};">S ljubavlju</p>
              <p class="script" style="margin: 10px 0 0 0; font-family: ${FONT_SCRIPT}; font-size: 36px; line-height: 1.2; color: ${COLORS.ink};">
                ${WEDDING_DETAILS.coupleNames}
              </p>
            </td>
          </tr>

        </table>

        <p style="margin: 24px auto 0 auto; max-width: 600px; font-family: ${FONT_SANS}; font-size: 11px; line-height: 1.7; color: ${COLORS.gray}; text-align: center;">
          Ova poruka je automatski poslana nakon potvrde vašeg dolaska.
        </p>

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function generateConfirmationEmailText(guest: GuestEmailData): string {
  let text = `
TINA & SVEN
${WEDDING_DETAILS.dateShort} · ${WEDDING_DETAILS.location}

HVALA NA POTVRDI
Radujemo se vašem dolasku

Dragi/a ${guest.name} ${guest.surname},

Zaprimili smo vašu potvrdu dolaska i iznimno nam je drago što ćete biti dio našeg posebnog dana. Ispod su svi detalji - sačuvajte ovaj email za svaki slučaj.

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
    text += "\nAko se nešto promijeni, samo nam odgovorite na ovaj email.\n";
  }

  text += `
IMATE PITANJE?
--------------
${WEDDING_DETAILS.contacts
  .map((contact) => `${contact.name}: ${contact.email} · ${contact.phone}`)
  .join("\n")}
${WEDDING_DETAILS.websiteUrl ? `${WEDDING_DETAILS.websiteUrl}\n` : ""}
S ljubavlju,
${WEDDING_DETAILS.coupleNames}

---
Ova poruka je automatski poslana nakon potvrde vašeg dolaska.
  `;

  return text.trim();
}

export async function sendRsvpConfirmationEmail(
  guest: GuestEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getEmailClient();

    const message: EmailMessage = {
      senderAddress: FROM_ADDRESS,
      content: {
        subject: "Potvrda dolaska · Vjenčanje Tina & Sven",
        plainText: generateConfirmationEmailText(guest),
        html: generateConfirmationEmailHtml(guest),
      },
      replyTo: WEDDING_DETAILS.contacts.map((contact) => ({
        address: contact.email,
        displayName: contact.name,
      })),
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
