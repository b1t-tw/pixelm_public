import { GADGETS } from './gadgets';

/** Rendered in the homepage #faq section and as its FAQPage JSON-LD; answers are plain text. */
export const FAQ: { q: string; a: string }[] = [
	{
		q: 'PixelM Creator X 是什麼？',
		a: 'PixelM Creator X 是位元創意為 PixelM 系列 LED 光舞道具（Pixel MR 系列 POV 視覺暫留旋轉道具，例如 LED poi）開發的燈光編輯軟體。可以把圖騰效果、單色、文字或圖片排進多軌時間軸，搭配 mp3 / wav 音樂預覽，再透過 USB 上傳到道具。',
	},
	{
		q: 'PixelM Creator X 要付費嗎？',
		a: '不用，PixelM Creator X 可在本站免費下載。',
	},
	{
		q: '支援 Mac 嗎？',
		a: '目前提供 Windows（64 位元）版本，macOS 版即將推出。',
	},
	{
		q: '支援哪些道具型號？',
		a: `支援 ${GADGETS.map((g) => g.name).join('、')}。清單外的道具可在軟體中選「自訂」，輸入頻率與燈珠數。`,
	},
	{
		q: '上傳時出現「偵測不到裝置」怎麼辦？',
		a: '先確認 USB 線已連接、道具已開機，再重新插拔道具。Windows 仍偵測不到時，請安裝 Pixel MR 驅動程式（本站下載區提供）後重新插拔。',
	},
	{
		q: '可以開啟舊版的 .pmc / .pmc3 專案檔嗎？',
		a: '.pmc3 可以直接開啟，存檔時會存成新版的 .pmc4；更舊的 .pmc 無法開啟，請使用舊版 PixelMCreator（僅 Windows，本站下載區提供）。',
	},
	{
		q: '可以使用哪些圖片和音樂格式？',
		a: '圖片支援 jpg、jpeg、png、bmp、gif；音樂支援 mp3、wav。',
	},
	{
		q: '哪裡可以買到 PixelM 道具？',
		a: 'PixelM 系列道具由 TRUE SPIN SHOP 生產與販售，購買或詢問道具相關問題請洽 TRUE SPIN SHOP 的 Facebook 粉絲專頁。',
	},
];
