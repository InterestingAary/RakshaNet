/**
 * i18n.ts
 * Lightweight custom i18n implementation using pre-loaded JSON message files.
 * Supports en (English), hi (Hindi), te (Telugu).
 * Intentionally avoids next-intl's server-side routing requirement so this
 * can be used directly from client components and custom hooks.
 */

import enMessages from '@/messages/en.json';
import hiMessages from '@/messages/hi.json';
import teMessages from '@/messages/te.json';

export type Locale = 'en' | 'hi' | 'te';

export const LOCALES: Locale[] = ['en', 'hi', 'te'];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  hi: 'हिन्दी',
  te: 'తెలుగు',
};

type MessageTree = Record<string, Record<string, string>>;

const messages: Record<Locale, MessageTree> = {
  en: enMessages as MessageTree,
  hi: hiMessages as MessageTree,
  te: teMessages as MessageTree,
};

/**
 * Resolves a dot-delimited key like 'shelter.available' against the message tree.
 * Falls back to the English string, and finally to the raw key if not found.
 */
function resolveKey(tree: MessageTree, key: string): string {
  const parts = key.split('.');
  if (parts.length === 2) {
    const [namespace, leaf] = parts;
    return tree[namespace]?.[leaf] ?? messages['en'][namespace]?.[leaf] ?? key;
  }
  // Flat key fallback
  for (const ns of Object.values(tree)) {
    if (typeof ns === 'object' && key in ns) return (ns as Record<string, string>)[key];
  }
  return key;
}

/**
 * Returns a translator function bound to the given locale.
 * Usage:
 *   const t = useTranslations('hi');
 *   t('shelter.available') // → 'उपलब्ध'
 */
export function useTranslations(locale: Locale): (key: string) => string {
  const tree = messages[locale] ?? messages['en'];
  return (key: string) => resolveKey(tree, key);
}

/**
 * Non-hook version for use outside React components (e.g. in utility files).
 */
export function getTranslator(locale: Locale): (key: string) => string {
  const tree = messages[locale] ?? messages['en'];
  return (key: string) => resolveKey(tree, key);
}
