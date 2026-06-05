    // --- Fixed Data 固定基礎配置區塊 ---
    var __firebase_config = '{}';
    var __app_id = 'app-shell-c';

    var user = null;
    var logs = [];
    var db = null;
    var auth = null;

    // --- Core JS Library 內嵌核心封裝物件 ---
    var APP_CORE = {
        version: "2.2.0",
        viewPaths: {
            'mainTab': 'views/mainTabContent.html',
            'brainTab': 'views/brainTabContent.html',
            'marketTab': 'views/marketTabContent.html',
            'habitsTab': 'views/habitsTabContent.html',
            'historyTab': 'views/historyTabContent.html',
            'settingTab': 'views/settingTabContent.html'
        },
        firebaseConfig: {},
        _initialized: false,

        init: function() {
            if (this._initialized) return;
            console.log("Core: Initializing v" + this.version);
            
            try {
                this.firebaseConfig = JSON.parse(__firebase_config);
            } catch (e) {
                this.handleError(e, "解析 Firebase 配置");
            }

            if (typeof firebase !== 'undefined' && this.firebaseConfig && Object.keys(this.firebaseConfig).length > 0) {
                try {
                    firebase.initializeApp(this.firebaseConfig);
                    auth = firebase.auth();
                    db = firebase.firestore();
                    console.log("Core: Firebase Initialized with Firestore");

                    auth.onAuthStateChanged(function(currentUser) {
                        user = currentUser;
                        if (user && typeof listenToCloud === 'function') {
                            listenToCloud();
                        } else if (!user && typeof initAuth === 'function') {
                            initAuth();
                        }
                    });
                } catch (e) { 
                    this.handleError(e, "Firebase 初始化失敗");
                }   
            }
            
            this.bindEvents();
            this.switchTab('mainTab');
            this._initialized = true;
        },

        bindEvents: function() {
            var self = this;
            var tabs = ['mainTab', 'brainTab', 'marketTab', 'habitsTab', 'historyTab', 'serverLogTab', 'settingTab'];
            tabs.forEach(function(tabId) {
                var btn = document.getElementById('btn-' + tabId);
                if (btn) {
                    btn.addEventListener('click', function() {
                        self.switchTab(tabId);
                    });
                }
            });

            var downloadBtn = document.getElementById('btn-download-self');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', function() {
                    self.downloadSelf(__app_id + '.html');
                });
            }
        },

        showToast: function(msg, duration) {
            duration = duration || 3000;
            var t = document.getElementById('toast');
            if (!t) return;
            t.textContent = msg;
            t.style.display = 'block';
            setTimeout(function() {
                t.style.display = 'none';
            }, duration);
        },

        toggleSpinner: function(show) {
            var s = document.getElementById('spinner');
            if (!s) {
                s = document.createElement('div');
                s.id = 'spinner';
                s.className = 'spinner-overlay';
                s.innerHTML = '<div class="loader"></div><p style="margin-top:10px; font-weight:bold; color:var(--accent-dark);">處理中...</p>';
                document.body.appendChild(s);
            }
            s.style.display = show ? 'flex' : 'none';
        },

        loadTabContent: async function(tabId, filePath) {
            var targetContent = document.getElementById(tabId);
            if (!targetContent) return;

            this.toggleSpinner(true);
            try {
                var response = await fetch(filePath);
                if (!response.ok) {
                    throw new Error("HTTP error! status: " + response.status);
                }
                var content = await response.text();
                targetContent.innerHTML = content;
                
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

        switchTab: function(tabId) {
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
                    this.loadTabContent(tabId, filePath);
                }
            }        
            if (targetBtn) {
                targetBtn.classList.add('active');
            }
        },

        getLocal: function(key) { 
            try {
                var data = localStorage.getItem(key);
                return data ? JSON.parse(data) : null; 
            } catch (e) {
                this.handleError(e, "讀取 localStorage ('" + key + "')");
                return null;
            }
        }, 
        saveLocal: function(key, data) { 
            try {
                localStorage.setItem(key, JSON.stringify(data)); 
            } catch (e) {
                this.handleError(e, "儲存 localStorage ('" + key + "')");
            }
        },

        downloadSelf: function(filename) {
            var content = "<!DOCTYPE html>" + document.documentElement.outerHTML;
            var blob = new Blob([content], { type: 'text/html' });
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = filename || 'source.html';
            a.click();
        },

        handleError: function(err, context) {
            console.error("Error in " + context + ":", err);
            var logPanel = document.getElementById('serverLogList');
            var errorMsg = (err && err.message) ? err.message : err;
            if (logPanel) {
                logPanel.innerHTML += '<p style="color:red;">[' + (new Date()).toLocaleTimeString() + '] Error in ' + context + ': ' + errorMsg + '</p>';
                logPanel.scrollTop = logPanel.scrollHeight;
            }
            this.showToast('發生錯誤: ' + context + ' - ' + errorMsg, 5000);
        }
    };

    window.APP_CORE = APP_CORE;

    window.addEventListener('load', function() {
        APP_CORE.init();
    });