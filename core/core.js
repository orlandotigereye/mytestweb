/**
 * Core JS Library - Project Universal Logic
 * Path: /public/01js/core.js
 * V2.1.2 - Enhanced Global Availability & Local Compatibility
 */

var APP_CORE = {
    version: "2.1.2",
    // 1. Firebase Configuration (Centralized)
    firebaseConfig: {
        apiKey: "AIzaSyDRgBVUSuLlxsZiRCPUqfTUoHrNfZY70vs",
        authDomain: "inventory-y.firebaseapp.com",
        databaseURL: "https://inventory-y-default-rtdb.firebaseio.com",      
        projectId: "inventory-y"
    },
    db: null,
    _initialized: false,

    // 2. Initialization
    init: function() {
        if (this._initialized) return;
        console.log("Core: Initializing v" + this.version);
        
        if (typeof firebase !== 'undefined') {
            try {
                firebase.initializeApp(this.firebaseConfig);
                this.db = firebase.database();
                console.log("Core: Firebase Initialized");
            } catch (e) { console.error("Core: Firebase Init Error", e); }   
        }
        
        this.setupTabs();
        this._initialized = true;
        
        // Notify any listeners that core is ready
        window.dispatchEvent(new CustomEvent('coreReady', { detail: { core: this } }));
    },

    // 3. UI Components (No Alerts)
    showToast: function(msg, duration) {
        duration = duration || 3000;
        var t = document.getElementById('toast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'toast';
            t.className = 'toast';
            document.body.appendChild(t);
        }
        t.textContent = msg;
        t.style.display = 'block';
        setTimeout(() => t.style.display = 'none', duration);
    },

    toggleSpinner: function(show) {
        var s = document.getElementById('spinner');
        if (!s) {
            s = document.createElement('div');
            s.id = 'spinner';
            s.className = 'spinner-overlay';
            s.innerHTML = '<div class="loader"></div><p id="spinner-text" style="margin-top:10px; font-weight:bold; color:var(--accent-dark);">Processing...</p>';
            document.body.appendChild(s);
        }
        if(typeof show === 'string') document.getElementById('spinner-text').textContent = show;
        s.style.display = show ? 'flex' : 'none';
    },

    // 4. Tab System
    setupTabs: function() {
        window.switchTab = (tabId) => {
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            var targetContent = document.getElementById(tabId);
            var targetBtn = document.querySelector(`[onclick*="${tabId}"]`);
            if (targetContent) targetContent.classList.add('active');        
            if (targetBtn) targetBtn.classList.add('active');

            // Custom event for page-specific tab logic
            window.dispatchEvent(new CustomEvent('tabChanged', { detail: { tabId } }));
        };
    },

    // 5. Data Helpers
    getLocal: function(key) { return JSON.parse(localStorage.getItem(key) || '[]'); }, 
    saveLocal(key, data) { localStorage.setItem(key, JSON.stringify(data)); },

    async syncToFirebase(path, data) {
        if (!this.db || !navigator.onLine) return false;
        try {
            await this.db.ref(path).set(data);
            return true;
        } catch (e) { return false; }
    },

    // 6. Source Download
    downloadSelf(filename) {
        var content = "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
        var blob = new Blob([content], { type: 'text/html' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename || 'source.html';
        a.click();
    },

    // 7. Error Handling (Unified)
    handleError: function(err, context) {
        console.error("Error in " + context + ":", err);
        var logPanel = document.getElementById('logList'); // Assuming logList for logs
        if (logPanel) {
            logPanel.innerHTML += '<p style="color:red;">Error in ' + context + ': ' + (err.message || err) + '</p>';
        }
        APP_CORE.showToast('發生錯誤: ' + (err.message || err), 5000);
    }
};

// 關鍵修正：立即掛載到 window，確保異步載入時全域物件立即存在
window.APP_CORE = APP_CORE;

// Auto-init based on document state
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => APP_CORE.init());
} else {
    // Already loaded (e.g., when injected via path_helper after initial load)
    APP_CORE.init();
}