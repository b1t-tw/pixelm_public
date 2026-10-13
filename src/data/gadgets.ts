/** Mirrors GADGETS in pixelm_creator_x/src/core/gadgets.ts. */
export const GADGETS = [
	{ leds: 36, freq: 1333, name: 'Pixel MR-36LED' },
	{ leds: 48, freq: 1100, name: 'Pixel MR-48LED' },
	{ leds: 80, freq: 2100, name: 'Pixel MR Pro-80LED' },
	{ leds: 120, freq: 1800, name: 'Pixel MR Pro-120LED' },
	{ leds: 80, freq: 3000, name: 'Pixel MR Pro V2-80LED' },
	{ leds: 120, freq: 2100, name: 'Pixel MR Pro V2-120LED' },
] as const;

/** Legacy Qt PixelMCreator 3 and the Windows driver, still hosted on railustre.tw. */
export const LEGACY = {
	version: '3.213110',
	download: 'https://drive.google.com/drive/folders/1XiKvSbpl2zzdw2uHou2tTY3Gyv56ZSrY?usp=drive_link',
	mirror: 'https://drive.google.com/drive/folders/1XiKvSbpl2zzdw2uHou2tTY3Gyv56ZSrY?usp=share_link',
	manual: 'https://drive.google.com/file/d/1LcZkxiQHAu5bPICkn205EpJrJs2JvcPA/view?usp=drive_link',
	driver: 'https://drive.google.com/file/d/1dPU4VifIfELpaEjY0ER0RRpPTMCzqe6x/view?usp=drive_link',
};
