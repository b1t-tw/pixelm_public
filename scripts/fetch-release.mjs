// Pull the published GitHub Releases of this repo into the site before `astro build`.
//
// The PixelM Creator X build workflow (tauri-action) uploads installers, updater bundles, .sig files
// and latest.json to a release here. Candidates are non-draft releases with a latest.json asset,
// newest first (the API's order). The app picks its update channel from its own version: builds whose
// version contains "-" read latest-beta.json, the rest read latest.json. This script writes:
//   public/latest-beta.json  updater manifest of the newest candidate, prerelease or not
//   public/latest.json       updater manifest of the newest non-prerelease candidate; while none
//                            exists, the newest prerelease (installed 4.0.0-alpha.1/.2 only read this)
//   src/data/release.json    { stable, preview } for the download section: stable is the newest
//                            non-prerelease, preview the newest candidate only if it is a prerelease
//
// Env: GITHUB_REPOSITORY (owner/repo) and GITHUB_TOKEN, both provided by GitHub Actions.
// Without GITHUB_REPOSITORY (local builds) nothing is written and the committed release.json is used.
import { rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const stableManifestFile = resolve(root, 'public/latest.json');
const betaManifestFile = resolve(root, 'public/latest-beta.json');
const dataFile = resolve(root, 'src/data/release.json');

const repo = process.env.GITHUB_REPOSITORY;
if (!repo) {
	console.log('GITHUB_REPOSITORY not set; keeping src/data/release.json as is');
	process.exit(0);
}

const headers = { 'X-GitHub-Api-Version': '2022-11-28' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const api = async (url, accept = 'application/vnd.github+json') => {
	const res = await fetch(url, { headers: { ...headers, Accept: accept } });
	if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
	return res;
};

const writeData = (data) => writeFileSync(dataFile, `${JSON.stringify(data, null, '\t')}\n`);

// Page through releases (newest first) until both the newest candidate and the newest stable one are
// known; a stable release may sit behind many prereleases.
const isCandidate = (r) => !r.draft && r.assets.some((a) => a.name === 'latest.json');
const candidates = [];
for (let page = 1; ; page++) {
	const batch = await (await api(`https://api.github.com/repos/${repo}/releases?per_page=100&page=${page}`)).json();
	candidates.push(...batch.filter(isCandidate));
	if (batch.length < 100 || candidates.some((r) => !r.prerelease)) break;
}

if (candidates.length === 0) {
	console.log(`no published release with latest.json in ${repo}`);
	rmSync(stableManifestFile, { force: true });
	rmSync(betaManifestFile, { force: true });
	writeData({ stable: null, preview: null });
	process.exit(0);
}

const newest = candidates[0];
const stable = candidates.find((r) => !r.prerelease) ?? null;
const updaterStable = stable ?? candidates.find((r) => r.prerelease);

// Downloads and validates a release's latest.json; memoized since one release can feed several outputs.
const manifests = new Map();
const manifestOf = async (release) => {
	if (manifests.has(release.id)) return manifests.get(release.id);
	const asset = release.assets.find((a) => a.name === 'latest.json');
	const text = await (await api(asset.url, 'application/octet-stream')).text();
	const manifest = JSON.parse(text);
	if (!manifest.version || !manifest.platforms || Object.keys(manifest.platforms).length === 0) {
		throw new Error(`${release.tag_name}/latest.json has no version or platforms`);
	}
	for (const [platform, entry] of Object.entries(manifest.platforms)) {
		if (!entry.url || !entry.signature) throw new Error(`${release.tag_name}/latest.json: ${platform} lacks url or signature`);
	}
	const result = { text, manifest };
	manifests.set(release.id, result);
	return result;
};

// Installers shown on the download page (NSIS .exe, .dmg); updater bundles and signatures are not.
const archOf = (name) => name.match(/(aarch64|universal|x64|x86_64|amd64)/)?.[1]?.replace(/x86_64|amd64/, 'x64') ?? 'x64';
const summarize = async (release) => ({
	version: (await manifestOf(release)).manifest.version.replace(/^v/, ''),
	prerelease: release.prerelease,
	pubDate: release.published_at,
	url: release.html_url,
	downloads: release.assets
		.filter((a) => /\.(exe|dmg)$/.test(a.name))
		.map((a) => ({
			os: a.name.endsWith('.dmg') ? 'macos' : 'windows',
			arch: archOf(a.name),
			name: a.name,
			url: a.browser_download_url,
			size: a.size,
		}))
		.sort((a, b) => b.os.localeCompare(a.os) || a.arch.localeCompare(b.arch)), // windows before macos
});

// Fetch and validate everything before writing anything.
const beta = await manifestOf(newest);
const updater = await manifestOf(updaterStable);
const data = {
	stable: stable && (await summarize(stable)),
	preview: newest.prerelease ? await summarize(newest) : null,
};

writeFileSync(betaManifestFile, beta.text);
writeFileSync(stableManifestFile, updater.text);
writeData(data);

console.log(`latest-beta.json: ${newest.tag_name} (${Object.keys(beta.manifest.platforms).join(', ')})`);
console.log(`latest.json: ${updaterStable.tag_name}${stable ? '' : ' (no stable release yet; newest prerelease)'} (${Object.keys(updater.manifest.platforms).join(', ')})`);
for (const [channel, r] of Object.entries(data)) {
	console.log(`${channel}: ${r ? `v${r.version}; downloads: ${r.downloads.map((d) => d.name).join(', ')}` : 'none'}`);
}
