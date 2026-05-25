import { buildFallbackText, buildMainMenuText, buildServiceText, findService, normalizeText } from '../utils/menu.js';
import { upsertLead } from '../services/leadService.js';
import { sendInstagramText, sendWhatsAppText } from '../services/metaService.js';

export function verifyWebhook(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) return res.status(200).send(challenge);
  return res.sendStatus(403);
}

export async function handleWebhook(req, res) {
  res.sendStatus(200);
  try {
    const body = req.body;
    if (body.object === 'whatsapp_business_account') await handleWhatsApp(body);
    if (body.object === 'instagram') await handleInstagram(body);
  } catch (error) {
    console.error('Webhook processing error:', error.response?.data || error.message);
  }
}

async function handleWhatsApp(body) {
  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value || {};
      const contact = value.contacts?.[0];
      const message = value.messages?.[0];
      if (!message || message.type !== 'text') continue;

      const from = message.from;
      const text = message.text?.body || '';
      const service = findService(text);
      const normalized = normalizeText(text);
      const reply = normalized === 'hi' || normalized === 'hello' || normalized === 'menu'
        ? buildMainMenuText()
        : service
          ? buildServiceText(service)
          : buildFallbackText();

      await upsertLead({
        channel: 'whatsapp',
        customerId: from,
        name: contact?.profile?.name,
        phone: from,
        incomingText: text,
        selectedService: service?.label,
        payload: message
      });
      await sendWhatsAppText(from, reply);
    }
  }
}

async function handleInstagram(body) {
  for (const entry of body.entry || []) {
    for (const event of entry.messaging || []) {
      const senderId = event.sender?.id;
      const text = event.message?.text || event.postback?.payload || '';
      if (!senderId || !text) continue;

      const service = findService(text);
      const normalized = normalizeText(text);
      const reply = normalized === 'hi' || normalized === 'hello' || normalized === 'menu'
        ? buildMainMenuText()
        : service
          ? buildServiceText(service)
          : buildFallbackText();

      await upsertLead({
        channel: 'instagram',
        customerId: senderId,
        username: senderId,
        incomingText: text,
        selectedService: service?.label,
        payload: event
      });
      await sendInstagramText(senderId, reply);
    }
  }
}
