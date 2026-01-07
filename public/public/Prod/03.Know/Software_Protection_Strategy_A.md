# Software Protection & Licensing Strategy | 軟體保護與授權策略

How to protect your "Pro" scripts as your business scales.
如何在事業擴張時保護您的「專業版」腳本。

---

## 🔒 1. Current State: Trust-Based | 現狀：信任機制
- **Method**: Direct delivery of `.js` and `.html` files.
- **Risk**: Users can easily copy and share the files with others.
- **現狀**：目前採用直接交付原始碼的方式，存在使用者私自分享的風險。

---

## 🔒 2. Intermediate: License Key Verification | 中期：授權碼驗證
As you reach **Milestone 3**, implement a simple "Phone Home" check in your `.js` scripts.
當您達成第三里程碑時，在 `.js` 腳本中加入簡單的「遠端驗證」檢查。

- **Tool**: **Gumroad License API**.
- **Action**: When the script starts, it asks the user for a License Key.
- **Code Logic**: The script sends the key to Gumroad's API. If valid, it continues; if not, it exits.
- **行動**：腳本啟動時要求輸入授權碼，並透過 Gumroad API 進行驗證。

---

## 🔒 3. Advanced: Obfuscation & Bundling | 進階：程式碼混淆
Prevent users from reading and removing the license check.
防止使用者讀取並移除授權檢查邏輯。

- **Tool**: **JavaScript Obfuscator**.
- **Action**: Run your Pro scripts through an obfuscator to make the logic unreadable to humans.
- **Packaging**: Use a tool like **Pkg** to bundle your Node.js script into a single `.exe` file. This hides the source code completely.
- **行動**：對腳本進行混淆處理，並封裝成 `.exe` 執行檔以完全隱藏原始碼。

---

## 🔒 4. The "End Game": Cloud API (SaaS) | 終極目標：雲端 API
Move the automation logic to your own server.
將自動化邏輯移至您自己的伺服器。
- The user's local script only acts as a "Client" that sends data to your "Server."
- Since the core logic is on your server, it can never be pirated.
- **重點**：這就是轉型為 SaaS (軟體即服務) 的技術優勢。

---

## 🚀 Pro Tip | 專家建議
Don't worry about protection until you have at least **50 paid sales**. Focusing on marketing and user growth is more important than security in the very beginning!

-----

*Created by Project Assistant on 2026-01-06*
