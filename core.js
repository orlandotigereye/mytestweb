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

    // Helper to ensure toast element exists
    _ensureToastElementExists: function() {
        var t = document.getElementById('toast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'toast';
            t.className = 'toast'; // Assuming 'toast' class is defined in CSS
            document.body.appendChild(t);
        }
    },

    // Helper to ensure spinner element exists
    _ensureSpinnerElementExists: function() {
        var s = document.getElementById('spinner');
        if (!s) {
            s = document.createElement('div');
            s.id = 'spinner';
            s.className = 'spinner-overlay'; // Assuming 'spinner-overlay' class is defined in CSS
            s.innerHTML = '<div class="loader"></div><p id="spinner-text" style="margin-top:10px; font-weight:bold; color:var(--accent-dark);">Processing...</p>';
            document.body.appendChild(s);
        }
    },

    /**
     * @function init
     * @description Initializes the core application functionalities, including Firebase and UI components.
     *              Ensures Firebase is only initialized once and creates essential UI elements.
     * @returns {void}
     */
    init: function() {
        if (this._initialized) return;
        console.log("Core: Initializing v" + this.version);
        
        // Ensure Toast and Spinner elements are created once
        this._ensureToastElementExists();
        this._ensureSpinnerElementExists();

        if (typeof firebase !== 'undefined') {
            // Prevent duplicate Firebase initialization
            if (!firebase.apps.length) { 
                try {
                    firebase.initializeApp(this.firebaseConfig);
                    this.db = firebase.database();
                    console.log("Core: Firebase Initialized");
                } catch (e) {
                    // Use handleError for consistent error reporting
                    this.handleError(e, 'Firebase:Init');
                }
            } else {
                // If already initialized, just get the database instance
                this.db = firebase.database();
                console.log("Core: Firebase already initialized, re-using existing instance.");
            }
        }
        
        this.setupTabs();
        this._initialized = true;
        
        // Notify any listeners that core is ready
        window.dispatchEvent(new CustomEvent('coreReady', { detail: { core: this } }));
    },

    // 3. UI Components (No Alerts)
    /**
     * @function showToast
     * @description Displays a transient toast message to the user.
     * @param {string} msg - The message content to display.
     * @param {number} [duration=3000] - The duration in milliseconds for which the message is displayed.
     * @returns {void}
     */
    showToast: function(msg, duration) {
        duration = duration || 3000;
        var t = document.getElementById('toast'); // Guaranteed to exist after init
        if (t) {
            t.textContent = msg;
            t.style.display = 'block';
            clearTimeout(t.timeoutId); // Clear any previous timeout
            t.timeoutId = setTimeout(function() { t.style.display = 'none'; }, duration); // ES5 compatible function
        }
    },

    /**
     * @function toggleSpinner
     * @description Shows or hides the global loading spinner. Can update the spinner text.
     * @param {boolean|string} show - If true, shows the spinner. If false, hides it.
     *                                If a string, shows the spinner and sets this string as the prompt text.
     * @returns {void}
     */
    toggleSpinner: function(show) {
        var s = document.getElementById('spinner'); // Guaranteed to exist after init
        if (s) {
            if (typeof show === 'string') {
                var spinnerText = document.getElementById('spinner-text');
                if (spinnerText) spinnerText.textContent = show;
            }
            s.style.display = show ? 'flex' : 'none';
        }
    },

    // 4. Tab System
    /**
     * @function switchTab
     * @description Switches between different tabs, showing the selected content section and highlighting the corresponding button.
     * @param {string} tabId - The ID of the tab to switch to (corresponds to content section ID).
     * @returns {void}
     */
    switchTab: function(tabId) {
        var sections = document.querySelectorAll('.content-section');
        var i;
        for (i = 0; i < sections.length; i++) {
            if (sections[i].id === tabId) {
                sections[i].classList.add('active');
            } else {
                sections[i].classList.remove('active');
            }
        }

        var buttons = document.querySelectorAll('.tab-btn');
        var j;
        for (j = 0; j < buttons.length; j++) {
            // Check data-tab-id attribute for the tab identifier
            if (buttons[j].getAttribute('data-tab-id') === tabId) {
                buttons[j].classList.add('active');
            } else {
                buttons[j].classList.remove('active');
            }
        }
        // Dispatch custom event for page-specific tab logic
        var event;
        if (typeof CustomEvent === 'function') { // Modern browsers
            event = new CustomEvent('tabChanged', { detail: { tabId: tabId } });
        } else { // IE 9-11 compatibility
            event = document.createEvent('CustomEvent');
            event.initCustomEvent('tabChanged', true, true, { tabId: tabId });
        }
        window.dispatchEvent(event);
    },

    /**
     * @function setupTabs
     * @description Sets up event listeners for tab buttons to handle tab switching.
     *              Requires tab buttons to have a 'data-tab-id' attribute matching the content section ID.
     * @returns {void}
     */
    setupTabs: function() {
        var self = this; // Capture 'this' for use in event listener context
        var tabButtons = document.querySelectorAll('.tab-btn'); // Select all tab buttons

        for (var i = 0; i < tabButtons.length; i++) {
            (function(button) { // Use IIFE to capture 'button' for each iteration
                // Remove existing onclick to avoid duplicate event handling if re-init
                button.removeAttribute('onclick'); 
                
                button.addEventListener('click', function() {
                    var tabId = button.getAttribute('data-tab-id'); // Get tabId from data-tab-id attribute
                    if (tabId) {
                        self.switchTab(tabId); // Call APP_CORE's switchTab method
                    }
                });
            })(tabButtons[i]);
        }
    },

    // 5. Data Helpers
    /**
     * @function getLocal
     * @description Retrieves data from local storage, parsing it as JSON.
     * @param {string} key - The key of the item to retrieve.
     * @param {*} [defaultValue] - The value to return if the key is not found or parsing fails.
     * @returns {*} The parsed data or the defaultValue if not found or parsing fails.
     */
    getLocal: function(key, defaultValue) {
        try {
            var value = localStorage.getItem(key);
            if (value === null) {
                return defaultValue;
            }
            var parsed = JSON.parse(value);
            return parsed;
        } catch (e) {
            console.error("Core: Error reading localStorage key '" + key + "':", e);
            this.handleError(e, "LocalStorage:Get:'" + key + "'"); // Use handleError
            return defaultValue;
        }
    },
    /**
     * @function saveLocal
     * @description Saves data to local storage after stringifying it as JSON.
     * @param {string} key - The key of the item to save.
     * @param {*} data - The data to save.
     * @returns {void}
     */
    saveLocal: function(key, data) { // Converted to ES5 function syntax
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error("Core: Error writing localStorage key '" + key + "':", e);
            this.handleError(e, "LocalStorage:Save:'" + key + "'"); // Use handleError
        }
    },

    /**
     * @function syncToFirebase
     * @description Synchronizes data to a specified Firebase Realtime Database path.
     * @param {string} path - The Firebase database path.
     * @param {*} data - The data to set at the specified path.
     * @returns {Promise<boolean>} A Promise that resolves to true if successful, false otherwise.
     */
    syncToFirebase: function(path, data) { // Converted to ES5 function syntax
        var self = this; // Capture 'this' for use in Promise chain
        return new Promise(function(resolve, reject) {
            if (!self.db || !navigator.onLine) {
                self.handleError('Firebase: Not connected or offline', 'Firebase:Sync');
                return resolve(false);
            }
            self.db.ref(path).set(data)
                .then(function() {
                    return resolve(true);
                })
                .catch(function(e) {
                    self.handleError(e, 'Firebase:Sync');
                    return resolve(false);
                });
        });
    },

    // 6. Source Download
    /**
     * @function downloadSelf
     * @description Triggers a download of the current page's source code.
     * @param {string} [filename='source.html'] - The name of the file to be downloaded.
     * @returns {void}
     */
    downloadSelf: function(filename) { // Converted to ES5 function syntax
        var content = "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
        var blob = new Blob([content], { type: 'text/html;charset=utf-8' }); // Specify charset
        var url = URL.createObjectURL(blob); // Capture the URL
        var a = document.createElement('a');
        a.href = url;
        a.download = filename || 'source.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // Revoke the object URL to free up memory
        this.showToast('檔案已成功下載！', 3000); // Consistent toast notification
    },

    // 7. Error Handling (Unified)
    /**
     * @function handleError
     * @description Provides a unified error handling mechanism, logging errors to console,
     *              displaying them in a log panel (if available), and showing a toast notification.
     * @param {Error|string} err - The error object or message.
     * @param {string} context - A string indicating where the error occurred (e.g., "Firebase:Init", "LocalStorage:Save").
     * @returns {void}
     */
    handleError: function(err, context) {
        console.error("Error in " + context + ":", err);
        var logPanel = document.getElementById('logList'); // Assuming logList for logs
        if (logPanel) {
            logPanel.innerHTML += '<p style="color:red;">Error in ' + context + ': ' + (err.message || err) + '</p>';
        }
        this.showToast('發生錯誤: ' + (err.message || err), 5000);
    }
};

// 關鍵修正：立即掛載到 window，確保異步載入時全域物件立即存在
window.APP_CORE = APP_CORE;

// Auto-init based on document state
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { APP_CORE.init(); }); // ES5 compatible
} else {
    // Already loaded (e.g., when injected via path_helper after initial load)
    APP_CORE.init();
}