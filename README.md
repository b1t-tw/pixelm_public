# PixelM 專頁

https://pixelm.bitcreative.cc — PixelM Creator X 介紹、下載、使用說明。Astro + Tailwind CSS，以 GitHub Pages 部署（`.github/workflows/deploy.yml`，自訂網域見 `public/CNAME`）。

| 路徑 | 內容 |
|---|---|
| `src/pages/index.astro` | 首頁：功能、支援道具、下載、關於 |
| `src/pages/manual.astro` | 使用說明，渲染 `src/content/manual/manual.md` |
| `src/content/manual/` | 由 `scripts/sync-manual.mjs` 從軟體 repo 的 `docs/` 複製，勿直接修改 |
| `src/data/gadgets.ts` | 支援道具清單（對應軟體 `src/core/gadgets.ts`）與舊版 / 驅動程式連結 |
| `src/data/release.json` | 目前版本與安裝檔連結；CI 由 `scripts/fetch-release.mjs` 覆寫，repo 內保留「尚未發佈」的預設值 |
| `public/latest.json` | Tauri updater manifest（CI 產生，不進版控），軟體 `plugins.updater.endpoints` 指向 `https://pixelm.bitcreative.cc/latest.json` |

## 開發

```sh
npm install
astro dev --background   # http://localhost:4321
npm run build
```

## 部署

GitHub repo（[b1t-tw/pixelm_public](https://github.com/b1t-tw/pixelm_public)）設定 › Pages › Source 選 **GitHub Actions**，Custom domain 填 `pixelm.bitcreative.cc`，DNS 設 `pixelm` CNAME 指向 `b1t-tw.github.io`。

`deploy.yml` 在 push 到 `main` 或手動執行時部署。Release 發佈 / 編輯 / 刪除時，`release.yml` 會在 `main` 上觸發 `deploy.yml`（不在 release tag 上建置，避免部署到舊版網站，也符合 `github-pages` environment 只允許 `main` 部署的限制）。

## 發佈新版軟體

軟體 repo 的 workflow 以 tauri-action 建置並上傳到**本 repo** 的 Release（`owner` / `repo` / `releaseCommitish: main`，需具本 repo `Contents: write` 的 PAT），檔案包含安裝檔、`.app.tar.gz`、`.sig` 與 `latest.json`。

1. tauri-action 建立草稿 Release；下載安裝檔測試，確認 `latest.json` 含 `windows-x86_64`、`darwin-aarch64`、`darwin-x86_64`。
2. 按 **Publish release**，`release.yml` 觸發 `deploy.yml`：`scripts/fetch-release.mjs` 取最新一個已發佈（含 prerelease）且有 `latest.json` 的 Release，寫出 `public/latest.json` 與 `src/data/release.json` 後建置部署。已安裝的軟體從此時起收到更新。

本 repo 必須是 public，否則 Release 檔案無法匿名下載。

## 更新使用說明

```sh
node scripts/sync-manual.mjs [/mnt/c/prj/pixelm_creator_x/docs]
```
