import bitcreativeLogo from '../assets/bitcreative.png';

/** schema.org JSON-LD node; every page emits one @graph built from `siteGraph` plus its own nodes. */
export type SchemaNode = Record<string, unknown>;

const site = import.meta.env.SITE;

export const absolute = (path: string) => new URL(path, site).href;

/** Stable @id references shared across pages. */
export const ids = {
	org: absolute('/#bitcreative'),
	website: absolute('/#website'),
	app: absolute('/#app'),
	shop: absolute('/#truespinshop'),
};

/** Site-wide nodes: the publisher and the website. sameAs lists only verified official 位元創意 profiles. */
export const siteGraph: SchemaNode[] = [
	{
		'@type': 'Organization',
		'@id': ids.org,
		name: '位元創意有限公司',
		alternateName: ['位元創意', 'b1t creative', 'Bit Creative'],
		url: 'https://bitcreative.cc',
		logo: absolute(bitcreativeLogo.src),
		sameAs: ['https://github.com/b1t-tw'],
	},
	{
		'@type': 'WebSite',
		'@id': ids.website,
		name: 'PixelM Creator X',
		url: absolute('/'),
		inLanguage: 'zh-Hant',
		publisher: { '@id': ids.org },
	},
];
