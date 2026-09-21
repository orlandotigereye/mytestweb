/**
 * Rockefeller System V10 - UI Module (ui.js)
 * 負責介面渲染、分頁切換、錯誤訊息吐司提示、視窗控制與手機舒適卡片轉化、側邊隱藏式漢堡選單控制
 * 嚴格遵循完整輸出、無偽代碼、無省略原則。
 */

// 自動注入漢堡選單與佈景主題所需的基礎 CSS 樣式（金幣輝煌主題風格），確保其他程式載入即可直接運作
function injectDefaultStyles() {
    if (document.getElementById('rockefeller-ui-injected-styles')) return;
    const style = document.createElement('style');
    style.id = 'rockefeller-ui-injected-styles';
    style.textContent = `
        :root {
            --base-font-size: 0.5rem;
        }
        /* 側邊隱藏式漢堡選單基礎樣式 - 金光閃閃金幣輝煌主題 */
        .hidden-sidebar-menu {
            position: fixed;
            top: 0;
            left: -300px;
            width: 280px;
            height: 100%;
            background: linear-gradient(135deg, #2b1d0c, #4a3512, #1a1a1a);
            color: #ffd700;
            box-shadow: 4px 0 20px rgba(255, 215, 0, 0.4);
            transition: left 0.3s ease-in-out;
            z-index: 9999;
            padding: 20px;
            box-sizing: border-box;
            border-right: 2px solid #ffd700;
            overflow-y: auto;
            font-size: var(--base-font-size);
        }
        .hidden-sidebar-menu.open {
            left: 0;
        }
        /* 半透明遮罩 */
        .sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(2px);
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
            z-index: 9998;
        }
        .sidebar-overlay.active {
            opacity: 1;
            visibility: visible;
        }
        /* 訊息吐司提示 */
        #messageBox {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .msg-toast {
            background: linear-gradient(135deg, #2b1d0c, #1a1a1a);
            color: #ffd700;
            padding: 10px 16px;
            border-radius: 6px;
            border: 1px solid #ffd700;
            box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
            font-size: var(--base-font-size);
            animation: fadeInOut 4s forwards;
        }
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(-20px); }
            10% { opacity: 1; transform: translateY(0); }
            90% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-20px); }
        }
    `;
    document.head.appendChild(style);
}

/**
 * 顯示前端懸浮提示訊息 (Toast)
 * @param {string} message 提示訊息文字
 */
export function displayFrontendError(message) {
    let messageBox = document.getElementById('messageBox');
    if (!messageBox) {
        messageBox = document.createElement('div');
        messageBox.id = 'messageBox';
        document.body.appendChild(messageBox);
    }
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
    closeHiddenSidebarMenu();
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
 * @param {string} val 字體大小設定值 (例如 0.5rem)
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
 * 開啟側邊隱藏漢堡分頁選單與半透明遮罩
 */
export function openHiddenSidebarMenu() {
    const sidebar = document.getElementById('hiddenSidebarMenu');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('active');
}

/**
 * 關閉側邊隱藏漢堡分頁選單與半透明遮罩
 */
export function closeHiddenSidebarMenu() {
    const sidebar = document.getElementById('hiddenSidebarMenu');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
}

/**
 * 切換側邊隱藏漢堡分頁選單開關狀態
 */
export function toggleHiddenSidebarMenu() {
    const sidebar = document.getElementById('hiddenSidebarMenu');
    if (sidebar && sidebar.classList.contains('open')) {
        closeHiddenSidebarMenu();
    } else {
        openHiddenSidebarMenu();
    }
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
 * 手機專用卡片式響應排版工具函式 (autoCardTable.js)
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

// 自動初始化與事件綁定
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        injectDefaultStyles();
        initMobileCardTables();
        
        const hamburgerBtn = document.getElementById('hamburgerToggleBtn');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const closeSidebarBtn = document.getElementById('closeSidebarBtn');
        
        if (hamburgerBtn) {
            hamburgerBtn.addEventListener('click', toggleHiddenSidebarMenu);
        }
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', closeHiddenSidebarMenu);
        }
        if (closeSidebarBtn) {
            closeSidebarBtn.addEventListener('click', closeHiddenSidebarMenu);
        }
        
        recalculateCurrentLineCount();
    });
    
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            initMobileCardTables();
        }
    });
}
