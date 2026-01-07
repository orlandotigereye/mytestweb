# Final Technical Sanity Check | 最終技術健全性檢查

Run this checklist to ensure your automation engine is 100% ready for Day 1.
執行此檢核表，確保您的自動化引擎已 100% 為第一天做好準備。

---

## 🛠️ 1. Environment Variables | 環境變數檢查
- [ ] **FFmpeg Check**: Open your terminal and type `ffmpeg -version`. If you see an error, the scripts will not be able to generate MP4 files.
- [ ] **FFmpeg 檢查**：在終端機輸入 `ffmpeg -version`。如果顯示錯誤，腳本將無法產生 MP4 影片。
- [ ] **Node.js Check**: Ensure `puppeteer-core` is installed in your project root. (Run `npm list puppeteer-core`).
- [ ] **Node.js 檢查**：確保專案根目錄已安裝 `puppeteer-core`。

---

## 🛠️ 2. Script Configuration | 腳本設定檢查
- [ ] **Chrome Path**: Open your `.js` scripts (e.g., `Pro_D.js`) and ensure the `chromePath` matches your actual Google Chrome location.
- [ ] **Chrome 路徑**：開啟 `.js` 腳本，確保 `chromePath` 與您電腦中的 Google Chrome 實際位置一致。
  - *Default*: `C:\Program Files\Google\Chrome\Application\chrome.exe`
- [ ] **Output Folders**: Ensure the folder `public/linve2D/` exists and is writable. (確保輸出資料夾存在且可寫入)

---

## 3. Source Material | 素材檢查
- [ ] **Google Sheets Privacy**: Ensure your script sheet is set to **"Anyone with the link can view"**.
- [ ] **表格權限**：確保您的劇本表格設定為「知道連結的人均可查看」。
- [ ] **Local HTML Paths**: Ensure the `htmlPath` in your `.js` scripts uses `path.resolve` so it can find the files regardless of where you run the command from.
- [ ] **路徑解析**：確保 `.js` 中的 `htmlPath` 使用 `path.resolve` 以正確定位檔案。

---

## 🧪 4. The Diagnostic Test | 診斷測試
Run the following command to perform a "Dry Run" of your system:
執行以下指令來進行系統「試跑」：
`node public/note_js/record_live2d_Final_Pro_D.js`

**Success Criteria (成功標準)**:
1. The terminal shows "Progress: 100%".
2. A file named `record_live2d_Final_Pro_D.mp4` appears in `public/linve2D/`.
3. The video plays smoothly with moving characters and audio.

---

## 🚀 Pro Tip | 專家建議
Keep a shortcut to the `public/linve2D/` folder on your desktop. This saves you 30 seconds every time you finish a recording and need to find the video file.

-----

*Created by Project Assistant on 2026-01-06*
