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
  } catch {
    // fallback: redirect to CheapShark so the browser does the redirect
  }

  return new Response(null, {
    status: 302,
    headers: { Location: cheapSharkRedirect },
  });
}
