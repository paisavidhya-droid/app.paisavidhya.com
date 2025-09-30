// client\src\hooks\useUTM.js
import { useMemo } from 'react';

export default function useUTM() {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const utm = {
      source: params.get('utm_source') || undefined,
      medium: params.get('utm_medium') || undefined,
      campaign: params.get('utm_campaign') || undefined,
      content: params.get('utm_content') || undefined,
    };
    const page = { url: window.location.href, referrer: document.referrer || '' };
    return { utm, page };
  }, []);
}
