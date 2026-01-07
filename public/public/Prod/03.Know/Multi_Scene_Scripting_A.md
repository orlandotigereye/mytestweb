# Advanced Technical: Multi-Scene Scripting | 進階技術：多場景劇本編寫

How to produce multi-environment automated narratives.
如何在單次自動錄製中產出跨場景的敘事影片。

---

## 🏗️ 1. The Concept | 核心概念
We use **Custom Commands** in the "Role" column to trigger a complete re-layout of the HTML stage mid-recording.
我們在 A 欄位使用「自定義指令」，在錄製中途觸發 HTML 舞台的完整重新佈局。

---

## 📊 2. Sheet Setup | 表格設定
Add a "SCENE" command followed by the preset name.
使用 "SCENE" 指令搭配預設名稱。

| Column A (Role/Command) | Column B (Text/Data) |
| :--- | :--- |
| **SCENE:cafe** | (System reloads Cafe backgrounds) |
| Character | "Ah, what a beautiful morning." |
| **SCENE:bedroom** | (System switches to bedroom, applies Dusk filter) |
| Character | "I'm so tired... time for bed." |

---

## 💻 3. HTML Implementation | HTML 實作邏輯
Add a `switchScene` function to your script:
在腳本中加入 `switchScene` 函式：

```javascript
const SCENES = {
    cafe: { bg: 'day', filter: 'brightness(1)', scale: 0.8 },
    bedroom: { bg: 'dusk', filter: 'brightness(0.6) sepia(0.2)', scale: 1.2 }
};

async function switchScene(sceneName) {
    const config = SCENES[sceneName];
    applyBG(config.bg);
    document.body.style.filter = config.filter;
    // Update character scale and position logic here
    console.log("SYS_LOG: Switched to Scene: " + sceneName);
}
```

---

## 🎬 4. Why this is a "Premium" Feature | 為什麼這是高階功能
- **Storytelling**: Allows riggers to sell "Story Packs" to their clients.
- **Complexity**: It is much harder to do manually than a single-background recording.
- **重点**：這讓您能製作「微短劇」，這是目前短影音平台上轉化率最高的內容類型。

---

## 🚀 Pro Tip | 專家建議
Use the **Automated Lighting Guide** in sync with your scene changes. A scene transition feels much more professional if the brightness and color temperature adjust to match the new background!

-----

*Created by Project Assistant on 2026-01-06*
