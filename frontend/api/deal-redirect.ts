const CHEAPSHARK_REDIRECT_BASE = 'https://www.cheapshark.com/redirect';

const FETCH_OPTIONS: RequestInit = {
  redirect: 'follow',
  headers: {
    'User-Agent': 'LootRadar/1.0 (https://github.com/Alusem/LootRadar)',
    Accept: 'text/html,application/xhtml+xml',
  },
};

function isStoreUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return !host.includes('cheapshark.com');
  } catch {
    return false;
  }
}

/** Extrai URL de redirect de meta refresh ou link na página da CheapShark. */
function extractRedirectUrlFromHtml(html: string): string | null {
  const metaMatch = html.match(/content=["']0;\s*url=([^"']+)["']/i);
  if (metaMatch?.[1]) {
    const raw = metaMatch[1].replace(/&amp;/g, '&').trim();
    if (/^https?:\/\//i.test(raw)) return raw;
  }
  const linkMatch = html.match(/<a[^>]+id=["']redirect["'][^>]+href=["']([^"']+)["']/i)
    ?? html.match(/<a[^>]+href=["']([^"']+)["'][^>]+id=["']redirect["']/i);
  if (linkMatch?.[1]) {
    const raw = linkMatch[1].replace(/&amp;/g, '&').trim();
    if (/^https?:\/\//i.test(raw)) return raw;
  }
  // Fallback: primeiro <a href="https://..."> que aponte para loja (ex.: "Please click here" na página de redirect)
  const linkRegex = /<a[^>]+href=["'](https?:\/\/[^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = linkRegex.exec(html)) !== null) {
    const raw = match[1].replace(/&amp;/g, '&').trim();
    if (isStoreUrl(raw)) return raw;
  }
  return null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const dealID = url.searchParams.get('dealID')?.trim();
  if (!dealID) {
    return new Response(JSON.stringify({ error: 'dealID em falta' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const cheapSharkRedirect = `${CHEAPSHARK_REDIRECT_BASE}?dealID=${encodeURIComponent(dealID)}`;

  try {
    const res = await fetch(cheapSharkRedirect, {
      ...FETCH_OPTIONS,
      signal: AbortSignal.timeout(10000),
    });
    const finalUrl = res.url;
    if (finalUrl && isStoreUrl(finalUrl)) {
      return new Response(null, {
        status: 302,
        headers: { Location: finalUrl },
      });
    }
    if (res.ok) {
      const html = await res.text();
      const extracted = extractRedirectUrlFromHtml(html);
      if (extracted && isStoreUrl(extracted)) {
        return new Response(null, {
          status: 302,
          headers: { Location: extracted },
        });
      }
    }
  } catch {
    // fallback: redirect to CheapShark so the browser does the redirect
  }

  return new Response(null, {
    status: 302,
    headers: { Location: cheapSharkRedirect },
  });
}
