<script>
    /**
     * 【遠端模組化 SDK】StrokeAnalyzer
     * 處理漢字筆劃、字母 (A=1...Z=26)、干支、洛書數、五行與 64 卦計算。
     */
    class StrokeAnalyzer {
        constructor() {
            this.dict = null;
            this.numMap = { '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9 };
            this.luoShuMap = {
                1: { name: "坎", element: "水" }, 2: { name: "艮", element: "土" }, 3: { name: "震", element: "木" },
                4: { name: "巽", element: "木" }, 5: { name: "艮", element: "土" }, 6: { name: "乾", element: "土" },
                7: { name: "兌", element: "金" }, 8: { name: "坤", element: "土" }, 9: { name: "離", element: "火" }
            };
            this.hexagramNames = ["乾為天", "坤為地", "水雷屯", "山水蒙", "水天需", "天水訟", "水地比", "風地觀"];
            this.todayGanZhi = "丙午年 甲午月 丁卯日 丁未時";
        }

        async init() {
            if (this.dict) return true;
            try {
                const response = await fetch("https://raw.githubusercontent.com/max32002/chinese_dictionary/0db111bb3dbe335a956732413557a710ef6901dc/Dictionary.json");
                this.dict = await response.json();
                return true;
            } catch (err) { return false; }
        }

        getTodayGanZhi() { return this.todayGanZhi; }

        getCharValue(char) {
            if (this.numMap.hasOwnProperty(char)) return this.numMap[char];
            if (/[a-zA-Z]/.test(char)) {
                return char.toLowerCase().charCodeAt(0) - 96;
            }
            return (this.dict && this.dict[char]) ? this.dict[char].strokes_total : 0;
        }

        calculateTotal(str) { return [...str].reduce((sum, char) => sum + this.getCharValue(char), 0); }

        getLuoShuInfo(total) {
            let remainder = total % 9;
            if (remainder === 0) remainder = 9;
            return this.luoShuMap[remainder] || { name: "未知", element: "未知" };
        }

        getHexagramInfo(total) {
            const index = (total + 10) % 64; 
            const order = (index === 0) ? 64 : index;
            return { name: this.hexagramNames[index % this.hexagramNames.length] + "卦", order: order };
        }

        getDetailList(str) { return [...str].map(char => ({ char, strokes: this.getCharValue(char) })); }
    }

    window.StrokeAnalyzer = StrokeAnalyzer;

    const analyzer = new StrokeAnalyzer();
    analyzer.init();

    async function runModule() {
        const input = document.getElementById('charInput').value;
        const total = analyzer.calculateTotal(input);
        const luoShu = analyzer.getLuoShuInfo(total);
        const hexagram = analyzer.getHexagramInfo(total);
        const ganZhi = analyzer.getTodayGanZhi();
        const details = analyzer.getDetailList(input);
        
        document.getElementById('ganZhiDisplay').innerText = `今日干支: ${ganZhi}`;
        document.getElementById('totalDisplay').innerText = `總數值: ${total}`;
        document.getElementById('luoShuDisplay').innerText = `洛書數: ${luoShu.name}`;
        document.getElementById('elementDisplay').innerText = `五行屬性: ${luoShu.element}`;
        document.getElementById('hexagramDisplay').innerText = `今日 64 卦: ${hexagram.name}`;
        document.getElementById('hexagramIndexDisplay').innerText = `卦序: 第 ${hexagram.order} 卦`;
        
        let html = `<table class="data-table"><tr><th>字元</th><th>數值/筆劃</th></tr>`;
        details.forEach(item => { html += `<tr><td>${item.char}</td><td>${item.strokes}</td></tr>`; });
        html += `</table>`;
        document.getElementById('detailDisplay').innerHTML = html;
    }

    function downloadCode() {
        const blob = new Blob([document.documentElement.outerHTML], {type: 'text/html'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'stroke_hexagram_module.html';
        a.click();
    }
</script>