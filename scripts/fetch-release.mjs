// Pull the newest published GitHub Release of this repo into the site before `astro build`.
//
// The PixelM Creator X build workflow (tauri-action) uploads installers, updater bundles, .sig files
// and latest.json to a release here. This script picks the newest non-draft release that has a
// latest.json asset (prereleases included) and writes:
//   public/latest.json      Tauri updater manifest, served at https://pixelm.bitcreative.cc/latest.json
//   src/data/release.json   version + installer links for the download section
//
// Env: GITHUB_REPOSITORY (owner/repo) and GITHUB_TOKEN, both provided by GitHub Actions.
// Without GITHUB_REPOSITORY (local builds) nothing is written and the committed release.json is used.
import { rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const manifestFile = resolve(root, 'public/latest.json');
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

const releases = await (await api(`https://api.github.com/repos/${repo}/releases?per_page=30`)).json();
const release = releases.find((r) => !r.draft && r.assets.some((a) => a.name === 'latest.json'));

if (!release) {
	console.log(`no published release with latest.json in ${repo}`);
	rmSync(manifestFile, { force: true });
	writeFileSync(dataFile, `${JSON.stringify({ version: null, pubDate: null, url: null, downloads: [] }, null, '\t')}\n`);
	process.exit(0);
}

const manifestAsset = release.assets.find((a) => a.name === 'latest.json');
const manifestText = await (await api(manifestAsset.url, 'application/octet-stream')).text();
const manifest = JSON.parse(manifestText);
if (!manifest.version || !manifest.platforms || Object.keys(manifest.platforms).length === 0) {
	throw new Error(`${release.tag_name}/latest.json has no version or platforms`);
}
for (const [platform, entry] of Object.entries(manifest.platforms)) {
	if (!entry.url || !entry.signature) throw new Error(`${release.tag_name}/latest.json: ${platform} lacks url or signature`);
}

// Installers shown on the download page (NSIS .exe, .dmg); updater bundles and signatures are not.
const archOf = (name) => name.match(/(aarch64|universal|x64|x86_64|amd64)/)?.[1]?.replace(/x86_64|amd64/, 'x64') ?? 'x64';
const downloads = release.assets
	.filter((a) => /\.(exe|dmg)$/.test(a.name))
	.map((a) => ({
		os: a.name.endsWith('.dmg') ? 'macos' : 'windows',
		arch: archOf(a.name),
		name: a.name,
		url: a.browser_download_url,
		size: a.size,
	}))
	.sort((a, b) => b.os.localeCompare(a.os) || a.arch.localeCompare(b.arch)); // windows before macos

writeFileSync(manifestFile, manifestText);
writeFileSync(
	dataFile,
	`${JSON.stringify(
		{
			version: manifest.version.replace(/^v/, ''),
			pubDate: release.published_at,
			url: release.html_url,
			downloads,
		},
		null,
		'\t',
	)}\n`,
);
console.log(`${release.tag_name}: ${Object.keys(manifest.platforms).join(', ')}; downloads: ${downloads.map((d) => d.name).join(', ')}`);
