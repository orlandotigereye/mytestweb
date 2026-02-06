# ✨ Gemini CLI 長期記憶雲端備份 ✨
> **備份日期**：2026-02-06
> **狀態**：Royal Gold 統一標準 v5.5 (完整固化版)

---

## 1. 核心交互規範 (Core Interaction)
- **語言偏好**：使用繁體中文，採 English and Traditional Chinese 分隔模式 ("---")。
- **UI 禁令**：絕對禁止使用 `alert()`，統一改用 `APP_CORE.showToast()`。
- **介面標準**：所有 HTML 採用 **RWD 響應式設計**，必須具備 **分頁模式 (Tabbed Interface)** 與 **13px 小字模式**。
- **原始碼功能**：每個程式必須包含一個「下載自身原始碼」的按鈕。

## 2. Royal Gold 統一標準 (Unified Standards)
- **代碼四層結構**：
  1. CSS
  2. Fixed Data (固定數據)
  3. Script (邏輯腳本)
  4. HTML (頁面結構)
- **內嵌策略**：所有核心 `global.css` 與 `core.js` 內容必須直接 **Inline (內嵌)** 於 HTML 檔案中，實現 100% 離線運行。
- **路徑管理**：使用 `path_helper.js` 進行動態路徑導向（除 `public/APK` 外）。

## 3. 語法與穩定性鐵律 (Syntax & Integrity)
- **ES5 語法標準**：為了極致相容性，嚴禁使用 `let`, `const`, `arrow functions (=>)`, `backticks (`)`, `spread operator (...)`。必須使用 `var` 與傳統 `function`。
- **控制字元十六進位化 (Hex Guard)**：
  - 換行符號使用 `\x0A`。
  - 單引號使用 `\x27`。
  - **目的**：防止檔案寫入工具將 `
` 轉換為實體斷行，導致 `SyntaxError`。
- **DOM 安全性**：執行 DOM 操作前必須進行存在性檢查 (`if(el)`)。

## 4. 檔案與開發流程 (File & Dev Workflow)
- **命名規則**：永遠建立新檔而非覆蓋舊檔，檔名採英文字母遞增 (例如 `AppA.html` -> `AppB.html`)。
- **元數據頭部 (Metadata Header)**：檔案頂端必須包含 JSON 格式的註釋區塊，包含 `AppID`, `Version`, `LastModified`, `Dependencies`。
- **統一錯誤守衛 (Unified Error Guard)**：在 `APP_CORE` 中實作 `handleError(err, context)` 集中處理錯誤與通知。

## 5. 文件與存放路徑 (File Paths)
- **Notion 文件**：`public/02.Notion/`
- **Gumroad 文件**：`public/01.GumRoad/`
- **知識與備份**：`public/03.Know/`
- **每日紀錄**：`public/03.Know/01.Day/` (格式：YYYYMMDD_Serial.txt)
- **SOP 檔案**：`public/06.SOP/`
- **影片與壓縮檔**：`public/07.ZIP/`, `public/08.MP4/`

---
*備份完畢。此檔案可作為換機或重置環境時的指令注入參考。*
