// Step 2 of the CMS login: GitHub sends the editor back here with a code.
// We swap it for an access token and hand it to the CMS window that opened the login popup.

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookie = request.headers.get('Cookie') || '';
  const expected = cookie.match(/(?:^|;\s*)cms_state=([^;]+)/)?.[1];

  let status = 'error';
  let content = { error: 'Inloggningen misslyckades. Försök igen.' };

  if (!code || !state || state !== expected) {
    content = { error: 'Ogiltig inloggning (state stämmer inte). Försök igen.' };
  } else {
    try {
      const res = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': 'seobyraboras-cms' },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${url.origin}/api/callback`,
        }),
      });
      const data = await res.json();
      if (data.access_token) {
        status = 'success';
        content = { token: data.access_token, provider: 'github' };
      } else {
        content = { error: data.error_description || 'GitHub gav ingen token.' };
      }
    } catch (e) {
      content = { error: 'Kunde inte nå GitHub.' };
    }
  }

  const message = `authorization:github:${status}:${JSON.stringify(content)}`;
  // Only hand the token to a window on this same site
  const html = `<!doctype html><html lang="sv"><head><meta charset="utf-8"><title>Loggar in...</title></head>
<body style="font-family:system-ui;padding:24px">${status === 'success' ? 'Inloggad. Fönstret stängs...' : 'Inloggningen misslyckades. Du kan stänga fönstret.'}
<script>
(function () {
  var origin = ${JSON.stringify(url.origin)};
  var message = ${JSON.stringify(message)};
  function receive(e) {
    if (e.origin !== origin) return;
    window.opener.postMessage(message, origin);
    window.removeEventListener('message', receive);
    setTimeout(function () { window.close(); }, 400);
  }
  window.addEventListener('message', receive, false);
  if (window.opener) window.opener.postMessage('authorizing:github', origin);
})();
</script></body></html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Set-Cookie': 'cms_state=; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
    },
  });
}
