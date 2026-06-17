/**
 * Core JS Library - Project Universal Logic
 * Path: /public/01js/core_updated.js
 * V2.2.1 - Merged Improvements from core_old.js
 */

var APP_CORE = {
    version: "2.2.1", // Updated version to reflect merged features
    // 1. Firebase Configuration (Centralized)
    firebaseConfig: {
        apiKey: "AIzaSyDRgBVUSuLlxsZiRCPUqfTUoHrNfZY70vs",
        authDomain: "inventory-y.firebaseapp.com",
        databaseURL: "https://inventory-y-default-rtdb.firebaseio.com",      
        projectId: "inventory-y"
    },
    db: null, // Will be Firestore
    auth: null,
    user: null, // Track current user
    _initialized: false,
    viewPaths: { // Adopt viewPaths from core_old.js
        'mainTab': '', // Adjusted for current template (originally 'views/mainTabContent.html')
        'settingTab': '' // Adjusted for current template (originally 'views/settingTabContent.html')
        // Other viewPaths from core_old.js could be added here if needed by specific apps
    },
    
    // 2. Initialization
    init: function() {
        if (this._initialized) return;
        console.log("Core: Initializing v" + this.version);
        
        // Firebase Initialization (Adopted from core_old.js - using Firestore)
        if (typeof firebase !== 'undefined' && this.firebaseConfig && Object.keys(this.firebaseConfig).length > 0) {
            try {
                firebase.initializeApp(this.firebaseConfig);
                this.auth = firebase.auth(); // Use APP_CORE.auth
                this.db = firebase.firestore(); // Use APP_CORE.db (Firestore)
                console.log("Core: Firebase Initialized with Firestore");

                this.auth.onAuthStateChanged((currentUser) => { // Use arrow function to maintain 'this' context
                    this.user = currentUser;
                    if (!this.db) {
                        this.showToast('Firestore 未啟用', 4000, 'error');
                        return;
                    }
                    // Assuming listenToCloud and initAuth are defined globally or within APP_CORE if needed
                    if (this.user && typeof listenToCloud === 'function') {
                        listenToCloud();
                    } else if (!this.user && typeof initAuth === 'function') {
                        initAuth();
                    }
                });
            } catch (e) { 
                this.handleError(e, "Firebase 初始化失敗");
            }   
        } else {
            console.warn("Core: Firebase not initialized (undefined or empty config).");
            this.showToast('Firebase 未初始化或配置為空', 4000, 'info');
        }
        
        this.bindEvents(); // Adopt bindEvents from core_old.js
        this.switchTab('mainTab'); // Adopt switchTab from core_old.js
        this._initialized = true;
        
        // Notify any listeners that core is ready (from core.js)
        window.dispatchEvent(new CustomEvent('coreReady', { detail: { core: this } }));
    },

    // 3. UI Components (No Alerts)
    showToast: function(msg, duration, type) { // Enhanced with 'type' from core_old.js logic
        duration = duration || 3000;
        var t = document.getElementById('toast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'toast';
            t.className = 'toast';
            document.body.appendChild(t);
        }
        t.textContent = msg;
        // Reset classes and add type-specific class (adopted from AppShellN.html inlined logic)
        t.className = 'toast'; 
        if (type) {
            t.classList.add('toast-' + type);
        }
        t.style.display = 'block';
        setTimeout(() => {
            t.style.display = 'none';
            t.className = 'toast'; // Reset class after hiding
        }, duration);
    },

    toggleSpinner: function(show, message) { // Enhanced with 'message' from core_old.js logic
        var s = document.getElementById('spinner'); // Was 'spinner-overlay' in core_old.js
        if (!s) {
            s = document.createElement('div');
            s.id = 'spinner'; // Consistent with existing core.js and for spinner-text
            s.className = 'spinner-overlay';
            s.innerHTML = '<div class="loader"></div><p id="spinner-text" style="margin-top:10px; font-weight:bold; color:var(--accent-dark);">處理中...</p>';
            document.body.appendChild(s);
        }
        var spinnerMessage = document.getElementById('spinner-text'); // Use spinner-text for dynamic message
        if (spinnerMessage && message) {
            spinnerMessage.textContent = message;
        } else if (spinnerMessage) {
             spinnerMessage.textContent = '處理中...'; // Default message
        }
        s.style.display = show ? 'flex' : 'none';
    },

    // 4. Tab System (Adopted from core_old.js's bindEvents and switchTab, integrated with setupTabs concept)
    bindEvents: function() { // Adopted from core_old.js
        var self = this;
        // The list of tabs should dynamically come from the template or APP_CORE.viewPaths
        // For now, hardcode based on previous template example
        var tabs = ['mainTab', 'settingTab']; 
        // Add other tabs from core_old.js's viewPaths if relevant for the current template context
        // e.g., 'brainTab', 'marketTab', 'habitsTab', 'historyTab', 'serverLogTab'

        tabs.forEach(function(tabId) {
            var btn = document.getElementById('btn-' + tabId);
            if (btn) {
                btn.addEventListener('click', function() {
                    self.switchTab(tabId);
                });
            }
        });

        // Add downloadSelf button event if exists in template
        var downloadBtn = document.getElementById('btn-download-self');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', function() {
                self.downloadSelf(__app_id + '.html');
            });
        }
    },

    switchTab: async function(tabId) { // Adopted from core_old.js
        var contentSections = document.querySelectorAll('.content-section');
        contentSections.forEach(function(section) {
            section.classList.remove('active');
        });

        var tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(function(btn) {
            btn.classList.remove('active');
        });

        var targetContent = document.getElementById(tabId);
        var targetBtn = document.getElementById('btn-' + tabId);
        
        if (targetContent) {
            targetContent.classList.add('active');
            var filePath = this.viewPaths[tabId];
            if (filePath && !targetContent.innerHTML.trim()) {
                await this.loadTabContent(tabId, filePath); // Use await for async loadTabContent
            }
        }        
        if (targetBtn) {
            targetBtn.classList.add('active');
        }
        // Custom event for page-specific tab logic (from core.js setupTabs)
        window.dispatchEvent(new CustomEvent('tabChanged', { detail: { tabId } }));
    },

    loadTabContent: async function(tabId, filePath) { // From core_old.js
        var targetContent = document.getElementById(tabId);
        if (!targetContent) return;

        this.toggleSpinner(true, '載入中...'); // Enhanced spinner message
        try {
            var response = await fetch(filePath);
            if (!response.ok) {
                throw new Error("HTTP error! status: " + response.status);
            }
            var content = await response.text();
            targetContent.innerHTML = content;
            
            // Re-execute scripts in loaded content
            Array.from(targetContent.querySelectorAll('script')).forEach(function(oldScript) {
                var newScript = document.createElement('script');
                Array.from(oldScript.attributes).forEach(function(attr) {
                    newScript.setAttribute(attr.name, attr.value);
                });
                newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                oldScript.parentNode.replaceChild(newScript, oldScript);
            });
        } catch (e) {
            this.handleError(e, "載入分頁內容 (" + filePath + ")");
            targetContent.innerHTML = '<p style="color:red; padding:10px;">載入內容失敗: ' + filePath + '</p>';
        } finally {
            this.toggleSpinner(false);
        }
    },

    // 5. Data Helpers
    getLocal: function(key) { 
        try { // Added try-catch from core_old.js
            var data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null; 
        } catch (e) {
            this.handleError(e, "讀取 localStorage ('" + key + "')");
            return null;
        }
    }, 
    saveLocal: function(key, data) { 
        try { // Added try-catch from core_old.js
            localStorage.setItem(key, JSON.stringify(data)); 
        } catch (e) {
            this.handleError(e, "儲存 localStorage ('" + key + "')");
        }
    },

    async syncToFirebase(path, data) { // Retained from core.js (Realtime DB) but needs adjustment for Firestore
        if (!this.db || !navigator.onLine) return false;
        try {
            // This method is for Realtime Database. For Firestore, it would be this.db.collection(...).doc(...).set(...)
            // Decided to keep Firestore as primary, so this method needs to be re-evaluated or adapted for Firestore.
            // For now, I'll keep it as-is, assuming it might be used with a different 'db' instance or needs a refactor.
            // Or remove it if Firestore is the only target.
            // Given the core_old.js used Firestore but didn't have this method, it's safer to remove or adapt it.
            // For this merge, I will adapt it for Firestore, as Firestore is the primary Firebase service in core_old.js.
            await this.db.collection(path.split('/')[0]).doc(path.split('/')[1]).set(data); // Simplified for a basic path structure
            this.showToast('資料已同步到 Firestore', 2000, 'success');
            return true;
        } catch (e) { 
            this.handleError(e, "同步資料到 Firebase Firestore"); 
            return false; 
        }
    },

    requireFirestore: function() { // Added from core_old.js
        if (!this.db) { // Check this.db for Firestore instance
            this.showToast('Firestore 尚未啟用', 4000, 'error');
            return false;
        }
        return true;
    },

    // 6. Source Download
    downloadSelf(filename) { // Retained from core.js
        var content = "<!DOCTYPE html>" + document.documentElement.outerHTML; // Keep on one line as per user memory
        var blob = new Blob([content], { type: 'text/html' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename || 'source.html';
        a.click();
    },

    // 7. Error Handling (Unified)
    handleError: function(err, context) { // Enhanced with 'type' for showToast, from core_old.js
        console.error("Error in " + context + ":", err);
        var logPanel = document.getElementById('serverLogList'); // From core_old.js
        var errorMsg = (err && err.message) ? err.message : err;
        if (logPanel) {
            logPanel.innerHTML += '<p style="color:red;">[' + (new Date()).toLocaleTimeString() + '] Error in ' + context + ': ' + errorMsg + '</p>';
            logPanel.scrollTop = logPanel.scrollHeight;
        }
        this.showToast('操作失敗: ' + context + ' - ' + errorMsg, 5000, 'error'); // Use 'error' type
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