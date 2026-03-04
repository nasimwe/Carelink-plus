import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

export const sendPatientCodeSMS = async (
  phoneNumber: string,
  patientCode: string,
  facilityName?: string
): Promise<void> => {
  // Normalise Rwanda phone numbers to E.164
  let normalised = phoneNumber.trim().replace(/\s+/g, '');
  if (normalised.startsWith('07') || normalised.startsWith('08')) {
    normalised = '+250' + normalised.substring(1);
  } else if (normalised.startsWith('250')) {
    normalised = '+' + normalised;
  }

  const facilityLine = facilityName ? ` at ${facilityName}` : '';
  const message =
    `CareLink+ Rwanda: Your discharge profile has been created${facilityLine}.\n` +
    `Your Patient Code is: ${patientCode}\n` +
    `Share this code with any clinician if you need follow-up care nationwide.`;

  await client.messages.create({
    to: normalised,
    from: process.env.TWILIO_PHONE_NUMBER,
    body: message,
  });
};
