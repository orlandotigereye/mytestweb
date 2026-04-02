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
        var content = "<!DOCTYPE html>
" + document.documentElement.outerHTML;
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
    },

    // DOM Selectors
    $: function(selector) {
        return document.querySelector(selector);
    },
    $$: function(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector));
    },

    // CSS Class Manipulation
    hasClass: function(element, className) {
        if (!element || !className) return false;
        return new RegExp('(^|\s)' + className + '(\s|$)').test(element.className);
    },
    addClass: function(element, className) {
        if (!element || !className) return;
        if (!this.hasClass(element, className)) {
            element.className += (element.className ? ' ' : '') + className;
        }
    },
    removeClass: function(element, className) {
        if (!element || !className) return;
        if (this.hasClass(element, className)) {
            element.className = element.className.replace(new RegExp('(^|\s)' + className + '(\s|$)', 'g'), ' ').replace(/\s+/g, ' ').trim();
        }
    },

    // Unique Identifier Generation
    generateUUID: function() {
        var d = new Date().getTime();
        if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
            d += performance.now();
        }
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    },

    // Debounce Function
    debounce: function(func, wait, immediate) {
        var timeout;
        var result;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) {
                    result = func.apply(context, args);
                }
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) {
                result = func.apply(context, args);
            }
            return result;
        };
    },

    // IsEmpty Utility
    isEmpty: function(value) {
        if (value === null || typeof value === 'undefined') {
            return true;
        }
        if (typeof value === 'string' || Array.isArray(value)) {
            return value.length === 0;
        }
        if (typeof value === 'object') {
            return Object.keys(value).length === 0;
        }
        return false;
    },

    // RemoveLocal Utility
    removeLocal: function(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error("Core: Error removing localStorage key '" + key + "':", e);
            this.handleError(e, "LocalStorage:Remove:'" + key + "'");
        }
    },

    // ClearLocal Utility
    clearLocal: function() {
        try {
            localStorage.clear();
        } catch (e) {
            console.error("Core: Error clearing localStorage:", e);
            this.handleError(e, "LocalStorage:Clear");
        }
    },

    // Throttle Function
    throttle: function(func, wait) {
        var timeout = null;
        var lastArgs = null;
        var lastThis = null;
        var lastResult = null;
        var lastCallTime = 0;

        var invokeFunc = function() {
            lastResult = func.apply(lastThis, lastArgs);
            lastCallTime = new Date().getTime();
            timeout = null;
        };

        return function() {
            lastThis = this;
            lastArgs = arguments;
            var now = new Date().getTime();

            if (!lastCallTime) {
                lastCallTime = now;
                invokeFunc();
            } else if (now - lastCallTime > wait) {
                invokeFunc();
            } else if (!timeout) {
                timeout = setTimeout(invokeFunc, wait - (now - lastCallTime));
            }
            return lastResult;
        };
    },

    // FormatDate Utility
    formatDate: function(date, format) {
        var pad = function(num) {
            return num < 10 ? '0' + num : num;
        };

        var year = date.getFullYear();
        var month = pad(date.getMonth() + 1);
        var day = pad(date.getDate());
        var hours = pad(date.getHours());
        var minutes = pad(date.getMinutes());
        var seconds = pad(date.getSeconds());

        format = format.replace(/YYYY/g, year);
        format = format.replace(/MM/g, month);
        format = format.replace(/DD/g, day);
        format = format.replace(/hh/g, hours);
        format = format.replace(/mm/g, minutes);
        format = format.replace(/ss/g, seconds);

        return format;
    },

    // GetQueryParams Utility
    getQueryParams: function() {
        var params = {};
        var queryString = window.location.search.substring(1);
        var regex = /([^&=]+)=([^&]*)/g;
        var m;
        while ((m = regex.exec(queryString))) {
            params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
        }
        return params;
    },

    // CreateElement Utility
    createElement: function(tag, attributes, textContent) {
        var el = document.createElement(tag);
        if (attributes) {
            for (var key in attributes) {
                if (attributes.hasOwnProperty(key)) {
                    el.setAttribute(key, attributes[key]);
                }
            }
        }
        if (textContent) {
            el.textContent = textContent;
        }
        return el;
    },

    // StorageAvailable Utility
    storageAvailable: function(type) {
        var storage;
        try {
            storage = window[type];
            var x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        } catch (e) {
            return e instanceof DOMException && (
                e.code === 22 ||
                e.code === 1014 ||
                e.name === 'QuotaExceededError' ||
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
                storage && storage.length !== 0;
        }
    },

    // AjaxRequest Utility
    ajaxRequest: function(method, url, data, successCallback, errorCallback) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    if (successCallback) {
                        successCallback(xhr.responseText, xhr);
                    }
                } else {
                    if (errorCallback) {
                        errorCallback(xhr.statusText, xhr);
                    } else {
                        APP_CORE.handleError(xhr.statusText, 'ajaxRequest:' + method + ':' + url);
                    }
                }
            }
        };

        xhr.onerror = function() {
            if (errorCallback) {
                errorCallback('Network Error', xhr);
            } else {
                APP_CORE.handleError('Network Error', 'ajaxRequest:' + method + ':' + url);
            }
        };

        if (data) {
            xhr.send(JSON.stringify(data));
        } else {
            xhr.send();
        }
    },

    // ScrollToTop Utility
    scrollToTop: function(duration) {
        duration = duration || 500;
        var start = window.pageYOffset;
        var startTime = null;

        var easeInOutCubic = function(t) {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        };

        var animateScroll = function(currentTime) {
            if (!startTime) startTime = currentTime;
            var progress = Math.min((currentTime - startTime) / duration, 1);
            var easeProgress = easeInOutCubic(progress);
            window.scrollTo(0, start - (start * easeProgress));
            if (progress < 1) {
                window.requestAnimationFrame(animateScroll);
            }
        };

        window.requestAnimationFrame(animateScroll);
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
