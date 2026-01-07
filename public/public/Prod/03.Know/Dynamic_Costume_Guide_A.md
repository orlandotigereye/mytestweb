# Advanced Technical: Dynamic Costume Swapping | 進階技術：動態服裝與部件切換

How to automate character outfit changes via Google Sheet commands.
如何透過 Google 表格指令自動執行角色換裝。

---

## 🏗️ 1. The Concept | 核心概念
We use the Live2D model's **Part Opacity** or **Expression** parameters. By sending a specific command in the Google Sheet, we toggle the visibility of different texture layers (e.g., Summer Outfit vs. Winter Outfit).
我們利用 Live2D 模型的「部件透明度」或「表情參數」。透過 Google 表格傳送指令，來切換不同紋理層的顯示（例如：夏季服裝 vs. 冬季服裝）。

---

## 📊 2. Sheet Setup | 表格設定
Add a **COSTUME** command in your script to trigger the change.
在劇本中加入 "COSTUME" 指令來觸發變換。

| Column A (Role/Command) | Column B (Outfit ID) |
| :--- | :--- |
| **COSTUME:set** | summer_dress |
| miku | "It's so hot today, I'm glad I changed!" |
| **COSTUME:set** | winter_coat |
| miku | "Wait, why is it snowing now? Brrr!" |

---

## 💻 3. HTML Implementation | HTML 實作邏輯
Add this logic to your command parser to handle the opacity toggle:
將此邏輯加入指令解析器中，處理透明度切換：

```javascript
if (role.startsWith('COSTUME:')) {
    const outfitId = text; // The ID from Column B
    // Logic to set part opacity via Live2D API
    // Example: model.setPartOpacity('part_' + outfitId, 1.0);
    console.log("SYS_LOG: Switched to Costume: " + outfitId);
    continue;
}
```

---

## 🎬 4. High-End Use Cases | 高階應用場景
- **Gacha Reveals**: Automate the reveal of a rare "Skin" for a model.
- **Story Progression**: Change the character's look as they go from "At Home" to "On Stage."
- **重點**：這能讓您的自動化影片具備極高的「敘事能力」，是吸引大客戶的關鍵。

---

## 🚀 Pro Tip | 專家建議
Combine this with **Automated Lighting**! When the character switches to "Pajamas," trigger a `LIGHTING:night` command simultaneously to create a perfect scene transition.

-----

*Created by Project Assistant on 2026-01-06*
