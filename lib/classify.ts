import type { MessageTopic } from './types';

export function classify(msg: string): MessageTopic {
  const m = msg.toLowerCase().trim();

  if (/dinner|food|eat|hungry|cook|order|pizza|lunch|breakfast|restaurant|snack/.test(m))
    return 'food';
  if (/(where|home|outside|work|office)/.test(m)) return 'location';
  // Order matters: more specific patterns first
  if (/(late|early|wait|how long|when|time|still|yet|already)/.test(m)) return 'time';
  if (/(weekend|tonight|plan|party|cancel|meet|tomorrow|trip|movie)/.test(m)) return 'plans';
  if (/(money|expensive|bill|pay|buy|afford|cost|price|spend)/.test(m)) return 'money';
  if (/(busy|call|text|seen|replied|read|ignore|phone|message|reply)/.test(m)) return 'phone';

  // Vague: simple one-word or punctuation responses
  if (/^(hi|hey|hello|ok|okay|k|\.+|lol|hm+|sup|yo|hmm|👋)$/i.test(m)) return 'vague';

  return 'generic';
}
