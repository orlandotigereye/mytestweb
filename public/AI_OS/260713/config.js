const path = require("path");

// ==============================================================================
// 系統核心配置 - config.js
// ==============================================================================
// 說明：此設定檔管理系統所有路徑與 AI 模型參數。
// 修正：ROOT 已鎖定於執行目錄下的 Proj 資料夾，確保檔案讀寫安全性。
// ==============================================================================

const ROOT = path.resolve(__dirname, "..", "Proj");

module.exports = {

    // =====================================
    // AI
    // =====================================
    // MODEL_SMART: "qwen2.5:14b" 會死掉
    // MODEL_SMART: "qwen3:8b" 會死掉

    URL: "http://127.0.0.1:11434/api/chat",
    
    MODEL_FAST: "qwen2.5:3b",

    MODEL_SMART: "qwen2.5-coder:7b-instruct-q4_K_M",

    DEFAULT_MODEL: "qwen2.5:7b",

    TEMPERATURE: 0.2,

    NUM_PREDICT: 500,

    STREAM: true,

    // =====================================
    // PATH (全數跟隨目前執行目錄動態解析，不亂寫檔)
    // =====================================

    ROOT,

    VERSION_FILE: path.join(ROOT, "version.json"),

    LOG_DIR: path.join(ROOT, "logs"),

    OUTPUT_DIR: path.join(ROOT, "output"),

    PROJECT_DIR: path.join(ROOT, "projects"),

    MEMORY_DIR: path.join(ROOT, "memory"),

    BACKUP_DIR: path.join(ROOT, "backup"),

    // ========= TE OS v7 新增 =========

    PROJ_DIR: ROOT,

    PROJECT_JSON: path.join(ROOT, "project.json"),

    PROJECT_INDEX: path.join(ROOT, "project.index.json"),

    MANIFEST_FILE: path.join(ROOT, "manifest.json"),

    SESSION_DIR: path.join(ROOT, "sessions"),

    CACHE_DIR: path.join(ROOT, "cache"),

    TEMP_DIR: path.join(ROOT, "temp"),
    
    WIKI_FILE: path.join(ROOT, "memory", "company_facts.json"),
    
    SCHEDULE_FILE: path.join(ROOT, "memory", "schedules.json"),

    DB_SCHEMA_DIR: path.normalize("C:/tmp2/web/25060301/public/cfoc"),

    DB_CONFIG: {
        server: "localhost",
        database: "CFOCT",
        user: "sa",
        password: "your_password",
        options: { encrypt: false, trustServerCertificate: true }
    },

    // =====================================
    // ADVANCED OPTIMIZATION SETTINGS (進階優化核心參數)
    // =====================================

    ATOMIC_WRITE_ENABLED: true,

    LARGE_FILE_OFFSET_LINE: 3000,

    ENFORCE_B_SCHEME_PROMPT: true,

    ENCODING: "utf8",

    // =====================================
    // FILE
    // =====================================

    BACKUP_EXTENSION: ".bak",

    AUTO_BACKUP: false,

    AUTO_CREATE_FOLDER: true,

    // ========= 自動分類 =========

    OUTPUT_FOLDER: {
        html: "html",
        htm: "html",
        css: "css",
        js: "js",
        mjs: "js",
        cjs: "js",
        ts: "js",
        jsx: "js",
        tsx: "js",
        json: "json",
        txt: "txt",
        md: "txt",
        csv: "txt",
        log: "txt",
        pdf: "pdf",
        png: "image",
        jpg: "image",
        jpeg: "image",
        gif: "image",
        webp: "image",
        svg: "image",
        bmp: "image",
        ico: "image"
    },

    DEFAULT_OUTPUT_FOLDER: "other",

    // =====================================
    // 自動命名
    // =====================================

    FILE_PREFIX_LENGTH: 4,

    FILE_COUNTER_DIGITS: 4,

    AUTO_RENAME_FILE: true,

    AUTO_FIX_FILENAME: true,

    AUTO_FIX_EXTENSION: true,

    AUTO_FIX_PATH: true,

    // =====================================
    // PROJECT
    // =====================================

    CREATE_PROJECT_JSON: true,

    CREATE_MANIFEST: true,

    CREATE_INDEX: true,

    SAVE_HISTORY: true,

    SAVE_SESSION: true,

    SAVE_MEMORY: true,

    PROJECT_HISTORY_LIMIT: 1000,

    // =====================================
    // RUNTIME
    // =====================================

    MAX_HISTORY: 20,

    MAX_OUTPUT_FILE: 20,

    MAX_MEMORY_SEARCH: 10,

    MAX_PROJECT_FILE: 5000,

    // =====================================
    // VERSION
    // =====================================

    VERSION_PREFIX: "V",

    VERSION_DIGITS: 4,

    // =====================================
    // MODEL ROUTER
    // =====================================

    LONG_PROMPT_LENGTH: 80,

    SMART_KEYWORDS: [
        "code",
        "project",
        "architecture",
        "design",
        "debug",
        "bug",
        "fix",
        "review",
        "refactor",
        "performance",
        "security",
        "database",
        "server",
        "node",
        "javascript",
        "python",
        "html",
        "css",
        "api",
        "sql",
        "json"
    ],

    // =====================================
    // FEATURE FLAGS
    // =====================================

    FEATURES: {
        ai_chat: true,
        streaming: true,
        model_router: true,
        runtime_monitor: true,
        version_system: true,
        regression_test: true,
        feature_checklist: true,
        file_writer: true,
        file_parser: true,
        auto_backup: true,
        auto_project: true,
        auto_manifest: true,
        auto_index: true,
        auto_folder: true,
        auto_filename: true,
        conflict_resolver: true,
        semantic_memory: true,
        continue_project: true,
        debug_project: true,
        modify_project: true,
        installer_mode: false
    }
};