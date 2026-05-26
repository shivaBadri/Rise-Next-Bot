import {
  buildFallbackText,
  buildMainMenuText,
  buildServiceText,
  findService,
  normalizeText
} from '../utils/menu.js';

import { upsertLead } from '../services/leadService.js';
import {
  sendInstagramText,
  sendWhatsAppMainMenu,
  sendWhatsAppServiceMenu,
  sendWhatsAppText
} from '../services/metaService.js';
import { askRiseNextAI } from '../services/openaiService.js';
import { company } from '../config/company.js';

export function verifyWebhook(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
}

export async function handleWebhook(req, res) {
  res.sendStatus(200);

  try {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      await handleWhatsApp(body);
    }

    if (body.object === 'instagram') {
      await handleInstagram(body);
    }
  } catch (error) {
    console.error('Webhook processing error:', error.response?.data || error.message);
  }
}

function getWhatsAppIncoming(message) {
  if (message.type === 'interactive') {
    return {
      text:
        message.interactive?.list_reply?.title ||
        message.interactive?.button_reply?.title ||
        '',
      selectedId:
        message.interactive?.list_reply?.id ||
        message.interactive?.button_reply?.id ||
        ''
    };
  }

  return {
    text: message.text?.body || '',
    selectedId: ''
  };
}

async function handleWhatsApp(body) {
  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value || {};
      const contact = value.contacts?.[0];
      const message = value.messages?.[0];

      if (!message) continue;

      const from = message.from;
      const { text, selectedId } = getWhatsAppIncoming(message);
      const normalized = normalizeText(text);

      const serviceKey = selectedId.startsWith('service_')
        ? selectedId.replace('service_', '')
        : '';

      const service =
        company.services.find((s) => s.key === serviceKey) ||
        findService(text);

      await upsertLead({
        channel: 'whatsapp',
        customerId: from,
        name: contact?.profile?.name,
        phone: from,
        incomingText: text || selectedId,
        selectedService: service?.label,
        payload: message
      });

      if (['hi', 'hello', 'menu', 'start'].includes(normalized)) {
        await sendWhatsAppMainMenu(from);
      } else if (selectedId === 'talk_team' || normalized.includes('talk')) {
        await sendWhatsAppText(
          from,
          `Thank you. Our Rise Next team will contact you shortly.\n\nCall: ${company.phone}\nEmail: ${company.email}\nWebsite: ${company.website}`
        );
      } else if (service) {
        await sendWhatsAppServiceMenu(from, service);
      } else if (process.env.OPENAI_API_KEY) {
        const aiReply = await askRiseNextAI(text);
        await sendWhatsAppText(from, aiReply);
      } else {
        await sendWhatsAppText(from, buildFallbackText());
      }
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

      const reply = ['hi', 'hello', 'menu', 'start'].includes(normalized)
        ? buildMainMenuText()
        : service
          ? buildServiceText(service)
          : process.env.OPENAI_API_KEY
            ? await askRiseNextAI(text)
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
