import type { EdgeFunction } from '@netlify/edge-functions';

const JSONWTF_BASE = new URL('https://jsonwtf.org');
const JACOBASPER = new URL('https://jacobasper.com');

const matchesPath = (expected: string, actual: string): boolean =>
	expected === actual || expected + '/' === actual;

const FILE_EXTENSIONS = [
	'.css',
	'.js',
	'.webp',
	'.png',
	'.jpg',
	'.jpeg',
	'.gif',
	'.svg',
	'.ico',
];

const isFile = (path: string) =>
	path.startsWith('/_astro/') ||
	FILE_EXTENSIONS.some((ext) => path.endsWith(ext));

const redirect = (url: URL) => {
	const res = Response.redirect(url, 301);
	return res;
};

const handler: EdgeFunction = (request, _context) => {
	const url = new URL(request.url);
	const host = url.hostname;
	const path = url.pathname;
	console.log({ host, path });

	if (isFile(path)) {
		return;
	}

	// only serve jsonwtf urls from jsonwtf.org
	if (host === JSONWTF_BASE.hostname) {
		if (path === '/') {
			return redirect(new URL('/quiz', JSONWTF_BASE));
		}
		if (!matchesPath('/quiz', path)) {
			return redirect(new URL(path, JACOBASPER));
		}
	}

	// serve rest from jacobasper.com
	if (host === JACOBASPER.hostname) {
		if (path === '/' || path.startsWith('/projects')) {
			return new URL('/blog', request.url);
		}
		if (matchesPath('/quiz', path)) {
			return redirect(new URL('/quiz', JSONWTF_BASE));
		}
	}

	return;
};

export default handler;
