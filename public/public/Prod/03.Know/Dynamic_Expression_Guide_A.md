# Advanced Technical: Dynamic Expression Randomizer | 進階技術：動態表情隨機發生器

How to add "Soul" and random life-like movements to your automated models.
如何為您的自動化模型增添「靈魂」與隨機的生命感動作。

---

## 🏗️ 1. The Concept | 核心概念
We add an **"Idle Loop"** to your HTML script that randomly triggers minor expressions when the `runScript()` function is not currently speaking a line.
我們在 HTML 腳本中加入「閒置迴圈」，當 `runScript()` 函式目前沒有在讀台詞時，隨機觸發細微表情。

---

## 💻 2. JavaScript Implementation | 指令碼實作
Add this function to your HTML's `<script>` section:
在 HTML 的指令碼區段加入此函式：

```javascript
function startIdleAnimations() {
    setInterval(() => {
        if (!playing) { // Only trigger if character is IDLE (僅在閒置時觸發)
            const randomExpression = ["smile", "blink", "head_tilt"][Math.floor(Math.random() * 3)];
            // Logic to trigger the Live2D expression via L2Dwidget (觸發表情邏輯)
            console.log("SYS_LOG: Triggering random idle: " + randomExpression);
        }
    }, 5000); // Trigger every 5 seconds
}
```

---

## 🎭 3. Why this is a "Pro" Feature | 為什麼這是專業功能
- **Human-Like**: Prevents the "Statue Look" where characters are perfectly still between lines. (防止像雕像一樣完全靜止)
- **High Retention**: People watch longer when the character feels "Alive." (增加觀看時長)
- **Premium Value**: You can charge more for your **Custom Showcase Service** if you include "Natural Idle Animations." (提升服務價值)

---

## 🚀 4. Recommended Idle Settings | 建議設定
- **Smile**: 10% frequency.
- **Eye Blink**: (Usually built into the model, but you can force extra ones).
- **Head Tilt**: 5% frequency (Subtle Angle change).

---

## 🚀 Pro Tip | 專家建議
Coordinate your random idle animations with your **Automated Lighting**. A "Deep Breath" movement looks incredible when combined with a subtle "Dusk" filter!

-----

*Created by Project Assistant on 2026-01-06*
