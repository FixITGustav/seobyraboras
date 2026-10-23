// Step 1 of the CMS login: send the editor to GitHub to approve access.
// Needs GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET as environment variables in Cloudflare Pages.

export async function onRequestGet({ request, env }) {
  if (!env.GITHUB_CLIENT_ID) {
    return new Response('GITHUB_CLIENT_ID saknas i Cloudflare Pages-inställningarna.', { status: 500 });
  }
  const url = new URL(request.url);
  const state = crypto.randomUUID();

  const github = new URL('https://github.com/login/oauth/authorize');
  github.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  github.searchParams.set('redirect_uri', `${url.origin}/api/callback`);
  github.searchParams.set('scope', url.searchParams.get('scope') || 'repo,user');
  github.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: github.toString(),
      'Set-Cookie': `cms_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
      'Cache-Control': 'no-store',
    },
  });
}
