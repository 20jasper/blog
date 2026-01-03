import type { EdgeFunction } from '@netlify/edge-functions';

const JSONWTF_BASE = new URL('https://jsonwtf.org');

const handler: EdgeFunction = (request, _context) => {
	const url = new URL(request.url);
	const host = url.hostname;
	const path = url.pathname;

	// only serve jsonwtf urls from jsonwtf.org
	if (host === 'jsonwtf.org') {
		if (path === '/') {
			return Response.redirect(new URL('/quiz', JSONWTF_BASE), 301);
		}
		if (path !== '/quiz') {
			return new Response('Not Found', { status: 404 });
		}
	}

	// serve rest from jacobasper.com
	if (host === 'jacobasper.com') {
		if (path === '/' || path.startsWith('/projects')) {
			return new URL('/blog', request.url);
		}
		if (path === '/quiz') {
			return Response.redirect(new URL('/quiz', JSONWTF_BASE), 301);
		}
	}

	return;
};

export default handler;
