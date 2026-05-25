import axios from 'axios';
import { addOutgoingMessage } from './leadService.js';

const graphVersion = process.env.META_GRAPH_VERSION || 'v21.0';
const graphBase = `https://graph.facebook.com/${graphVersion}`;

export async function sendWhatsAppText(to, text) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId || token.includes('PASTE_')) {
    console.log('ℹ️ WhatsApp token not configured. Mock reply:', { to, text });
    return { mocked: true };
  }
  const res = await axios.post(
    `${graphBase}/${phoneNumberId}/messages`,
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { preview_url: false, body: text }
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
  await addOutgoingMessage({ channel: 'whatsapp', customerId: to, text, payload: res.data });
  return res.data;
}

export async function sendInstagramText(recipientId, text) {
  const token = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;
  const pageId = process.env.INSTAGRAM_PAGE_ID;
  if (!token || !pageId || token.includes('PASTE_')) {
    console.log('ℹ️ Instagram token not configured. Mock reply:', { recipientId, text });
    return { mocked: true };
  }
  const res = await axios.post(
    `${graphBase}/${pageId}/messages`,
    {
      recipient: { id: recipientId },
      messaging_type: 'RESPONSE',
      message: { text }
    },
    { params: { access_token: token } }
  );
  await addOutgoingMessage({ channel: 'instagram', customerId: recipientId, text, payload: res.data });
  return res.data;
}
