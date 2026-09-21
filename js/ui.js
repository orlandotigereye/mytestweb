/**
 * Rockefeller System V10 - UI Module (ui.js)
 * 負責介面渲染、分頁切換、錯誤訊息吐司提示、視窗控制與手機舒適卡片轉化
 */

/**
 * 顯示前端懸浮提示訊息 (Toast)
 * @param {string} message 提示訊息文字
 */
export function displayFrontendError(message) {
    const messageBox = document.getElementById('messageBox');
    if (!messageBox) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = 'msg-toast';
    msgDiv.innerHTML = `<i class="fa-solid fa-circle-info"></i> ${message}`;
    messageBox.appendChild(msgDiv);
    setTimeout(() => {
        if (msgDiv.parentNode) msgDiv.parentNode.removeChild(msgDiv);
    }, 4000);
}

/**
 * 切換主模組分頁
 * @param {number} targetIndex 目標分頁索引 (0~5)
 */
export function switchModuleTab(targetIndex) {
    const tabs = document.querySelectorAll('.nav-tab-item');
    const sections = document.querySelectorAll('.module-content-section');
    
    tabs.forEach((tab, idx) => {
        tab.classList.toggle('active', idx === targetIndex);
    });
    
    sections.forEach((sec, idx) => {
        sec.classList.toggle('active', idx === targetIndex);
    });
    
    recalculateCurrentLineCount();
    initMobileCardTables();
}

/**
 * 切換翻譯器子分頁
 * @param {string} subTabId 子分頁DOM的ID
 */
export function switchTranslatorSubTab(subTabId) {
    document.querySelectorAll('.sub-translator-panel').forEach(el => el.style.display = 'none');
    const btnTrans = document.getElementById('btn-translateSub');
    const btnHist = document.getElementById('btn-historySub');
    
    if (btnTrans) btnTrans.style.background = '#78909c';
    if (btnHist) btnHist.style.background = '#78909c';
    
    const targetPanel = document.getElementById(subTabId);
    if (targetPanel) targetPanel.style.display = 'grid';
    
    if (subTabId === 'translateSub' && btnTrans) {
        btnTrans.style.background = '#f57f17';
    } else if (subTabId === 'historySub' && btnHist) {
        btnHist.style.background = '#f57f17';
    }
}

/**
 * 切換護眼/暗黑模式
 */
export function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    displayFrontendError('已切換佈景主題模式');
}

/**
 * 調整全域基準字體大小
 * @param {string} val 字體大小設定值 (例如 0.9rem, 1rem, 1.15rem)
 */
export function changeBaseFontSize(val) {
    document.documentElement.style.setProperty('--base-font-size', val);
    displayFrontendError(`字體大小已切換為：${val}`);
}

/**
 * 計算目前網頁實際行數並更新狀態列
 */
export function recalculateCurrentLineCount() {
    try {
        const totalLines = document.documentElement.outerHTML.split('\n').length;
        const statusBar = document.getElementById('statusBar');
        if (statusBar) {
            statusBar.innerHTML = `<div>目前實際行數計算: <b>${totalLines} 行</b> | 系統狀態: 正常運行</div><div>洛克菲勒 73 條旗艦金庫系統 V10</div>`;
        }
    } catch (e) {
        const statusBar = document.getElementById('statusBar');
        if (statusBar) {
            statusBar.textContent = `目前實際行數計算: 計算錯誤 | 系統狀態: 異常`;
        }
    }
}

/**
 * 開啟原文檢視彈跳視窗
 * @param {string} text 原文內容
 */
export function openSourceModal(text) {
    const modalContent = document.getElementById('modalSourceContent');
    const modal = document.getElementById('sourceViewModal');
    if (modalContent) modalContent.textContent = text;
    if (modal) modal.style.display = 'flex';
}

/**
 * 關閉原文檢視彈跳視窗
 */
export function closeSourceModal() {
    const modal = document.getElementById('sourceViewModal');
    if (modal) modal.style.display = 'none';
}

/**
 * 開啟沉浸式金句輪播彈跳視窗
 */
export function openZenCarouselModal() {
    const modal = document.getElementById('zenCarouselModal');
    if (modal) modal.style.display = 'flex';
}

/**
 * 關閉沉浸式金句輪播彈跳視窗
 */
export function closeZenCarouselModal() {
    const modal = document.getElementById('zenCarouselModal');
    if (modal) modal.style.display = 'none';
}

/**
 * HTML 特殊字元跳脫保護
 * @param {string} str 原始字串
 * @returns {string} 安全字串
 */
export function escapeHtml(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

/**
 * ==========================================
 * 手機專用卡片式響應排版工具函式 (autoCardTable.js)
 * ==========================================
 */
export function initMobileCardTables() {
    const tables = document.querySelectorAll('table.auto-card, .module-content-section table');
    
    tables.forEach(table => {
        const headers = Array.from(table.querySelectorAll('th')).map(th => {
            let text = th.innerText.trim();
            return text.length > 3 ? text.substring(0, 3) : text;
        });

        table.querySelectorAll('tbody tr').forEach(tr => {
            Array.from(tr.querySelectorAll('td')).forEach((td, idx) => {
                if (headers[idx]) {
                    td.setAttribute('data-label', headers[idx]);
                }
            });
        });
    });
}

if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        initMobileCardTables();
    });
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            initMobileCardTables();
        }
    });
}
