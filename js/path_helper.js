/**
 * Royal Gold Path Helper - Project Universal Router
 * Path: /public/01js/path_helper.js
 * V1.7 - Enhanced Root Detection with smarter fallback
 */

const ROUTER_CONFIG = {
    VERSION: '20260120.07', 
    GLOBAL_CSS: '00css/global.css',
    CORE_JS: '01js/core.js'
};

const ROUTER = {
    /**
     * 獲取專案根目錄路徑
     */
    get root() {
        const loc = window.location;
        const path = loc.pathname.replace(/\\/g, '/');
        
        // 1. 本地檔案模式 (file://)
        if (loc.protocol === 'file:') {
            const parts = path.split('/');
            // 尋找最後一個 public 的位置
            const pubIdx = parts.map(p => p.toLowerCase()).lastIndexOf('public');
            if (pubIdx !== -1) {
                // 如果在 public 下，計算距離 public 的深度
                // 例如 /.../public/Sale/Sale2/indexC.html -> parts 有 8 個，pubIdx 是 4
                // 深度 = 8 - 4 - 2 = 2 (../../)
                const depth = parts.length - pubIdx - 2;
                return '../'.repeat(Math.max(0, depth));
            }
            return './';
        }

        // 2. 伺服器模式 (Netlify / Live Server / Web Server) 
        
        // 優先策略：偵測當前路徑中的 /public/ 並以此作為基準
        const pubSearch = path.toLowerCase().lastIndexOf('/public/');
        if (pubSearch !== -1) {
            // 返回包含 /public/ 的完整前綴，例如 "/my-app/public/"
            return path.substring(0, pubSearch + 8);
        }

        // 次要策略：如果沒有 /public/，檢查是否在根目錄或子目錄
        // 假設 01js 必定在根目錄下
        return '/';
    },

    resolve(target) {
        let r = this.root;
        // 確保 root 以 / 結尾 (除了 file:// 的 ../ 這種情況)
        if (window.location.protocol !== 'file:' && !r.endsWith('/')) {
            r += '/';
        }
        
        const t = target.replace(/^\//, ''); // 移除目標路徑開頭的斜線

        let finalUrl = '';
        if (window.location.protocol === 'file:') {
            finalUrl = r + t;
        } else {
            // 伺服器模式使用絕對路徑
            const origin = window.location.origin;
            // 確保 r 是以 / 開頭的絕對路徑
            const absoluteRoot = r.startsWith('/') ? r : '/' + r;
            finalUrl = origin + absoluteRoot + t;
            // 移除重複的斜線 (除了 http://)
            finalUrl = finalUrl.replace(/([^:])\/\//g, '$1/');
        }

        // 加入版本號防止快取
        const sep = finalUrl.includes('?') ? '&' : '?';
        return `${finalUrl}${sep}v=${ROUTER_CONFIG.VERSION}`;
    },

    init() {
        const cssUrl = this.resolve(ROUTER_CONFIG.GLOBAL_CSS);
        const jsUrl = this.resolve(ROUTER_CONFIG.CORE_JS);

        console.log(`ROUTER V1.7 [${window.location.protocol}]: Initializing...`, {
            detected_root: this.root,
            css: cssUrl,
            js: jsUrl
        });

        // 注入 CSS
        if (!document.querySelector(`link[href*="${ROUTER_CONFIG.GLOBAL_CSS}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssUrl;
            document.head.appendChild(link);
        }

        // 注入 Core JS
        if (!document.querySelector(`script[src*="${ROUTER_CONFIG.CORE_JS}"]`)) {
            const script = document.createElement('script');
            script.src = jsUrl;
            script.async = false;
            document.head.appendChild(script);
        }
    }
};

// 立即執行初始化
ROUTER.init();