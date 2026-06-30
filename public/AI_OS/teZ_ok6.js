const readline = require("readline");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const config = require("./config/config");
const VersionManager = require("./core/version");

// ======================================================
// 🎨 TERMINAL COLORS
// ======================================================
const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    blue: "\x1b[34m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
    gray: "\x1b[90m",
    bold: "\x1b[1m"
};

// ======================================================
// 📦 VERSION SYSTEM
// ======================================================
const version = new VersionManager(config);

// ======================================================
// 🖥️ TERMINAL TITLE MANAGER
// ======================================================
function setTerminalTitle(status) {
    const modelStr = ACTIVE_MODEL ? (ACTIVE_MODEL === config.MODEL_SMART ? "Smart" : "Fast") : "Dynamic";
    const title = `[${status}] AI Cognitive OS v5 (${version.current()}) - Model: ${modelStr}`;
    process.title = title;
    process.stdout.write(`\x1b]0;${title}\x07`);
}

// ======================================================
// 🧠 AI COGNITIVE OS v5 (GRAPH + REWARD + TOOL SYSTEM)
// ======================================================

console.log(`${colors.cyan}${colors.bold}🧠 AI COGNITIVE OS v5 STARTED (Version: ${version.current()})${colors.reset}`);

// ======================================================
// 🤖 MODEL CONFIG
// ======================================================
const URL = config.URL;
const MODEL_FAST = config.MODEL_FAST;
const MODEL_SMART = config.MODEL_SMART;

let ACTIVE_MODEL = null; // Dynamically uses model, default to null to fallback to logic

// Initialize Title
setTerminalTitle("Idle");

// ======================================================
// 🧠 MEMORY SYSTEM (GRAPH MEMORY + JSON PERSISTENCE)
// ======================================================
const memoryDir = path.join(process.cwd(), "memory");
const memoryFile = path.join(memoryDir, "chat_history.json");

const Memory = {
    nodes: new Map(),

    save() {
        try {
            if (!fs.existsSync(memoryDir)) {
                fs.mkdirSync(memoryDir, { recursive: true });
            }
            const data = Array.from(this.nodes.entries());
            fs.writeFileSync(memoryFile, JSON.stringify(data, null, 2), "utf8");
        } catch (e) {
            console.error("Failed to save memory graph:", e.message);
        }
    },

    load() {
        try {
            if (fs.existsSync(memoryFile)) {
                const content = fs.readFileSync(memoryFile, "utf8");
                const data = JSON.parse(content);
                this.nodes = new Map(data);
            }
        } catch (e) {
            console.error("Failed to load memory graph:", e.message);
        }
    },

    add(role, content) {
        const id = crypto.randomUUID();
        this.nodes.set(id, {
            id,
            role,
            content,
            links: [],
            time: Date.now()
        });
        this.save();
        return id;
    },

    link(a, b) {
        if (this.nodes.has(a) && this.nodes.has(b)) {
            this.nodes.get(a).links.push(b);
            this.save();
        }
    },

    retrieve(limit = 10) {
        return [...this.nodes.values()]
            .sort((a, b) => b.time - a.time)
            .slice(0, limit)
            .map(x => ({ role: x.role, content: x.content }));
    }
};

// Auto-load memory at startup
Memory.load();

// ======================================================
// 📊 RUNTIME (GRAPH + REWARD + TRACE)
// ======================================================
const runtime = {
    start: Date.now(),
    requests: 0,

    graphNodes: 0,
    graphEdges: 0,

    rewardTotal: 0,
    rewardHistory: [],

    toolCalls: 0,
    streamChunks: 0,

    cliQueue: 0,
    cliDrops: 0,

    lastScore: 0,
    lastInput: "",
    lastOutput: ""
};

// ======================================================
// 📋 FEATURES
// ======================================================
const FEATURES = {
    graph_runtime: true,
    reward_system: true,
    tool_system: true,
    streaming: true,
    cli_queue: true,
    memory_graph: true,
    regression_test: true,
    runtime_monitor: true,
    planner: true,
    executor: true,
    critic: true
};

// ======================================================
// 📋 FEATURE CHECKLIST
// ======================================================
function featureChecklist() {
    console.log("\n📋 FEATURE CHECKLIST");

    let ok = 0;
    for (const [k, v] of Object.entries(FEATURES)) {
        console.log(v ? "✅" : "❌", k);
        if (v) ok++;
    }

    console.log("────────────────────");
    console.log(`STATUS: ${ok}/${Object.keys(FEATURES).length}`);
}

// ======================================================
// ⚙️ RUNTIME SNAPSHOT
// ======================================================
function runtimeBehavior() {
    const uptime = ((Date.now() - runtime.start) / 1000).toFixed(2);

    console.log("\n🧠 RUNTIME SNAPSHOT");
    console.log({
        uptime: uptime + "s",
        requests: runtime.requests,
        graphNodes: runtime.graphNodes,
        graphEdges: runtime.graphEdges,
        rewardTotal: runtime.rewardTotal,
        toolCalls: runtime.toolCalls,
        streamChunks: runtime.streamChunks,
        queue: runtime.cliQueue,
        activeModel: ACTIVE_MODEL || "DYNAMIC (based on input length)"
    });
}

// ======================================================
// 🧠 GRAPH PLANNER
// ======================================================
function planner(input) {
    const root = crypto.randomUUID();

    const graph = {
        root,
        steps: []
    };

    const t = input.toLowerCase();

    if (t.includes("code")) {
        graph.steps.push("analyze_code");
        graph.steps.push("generate_code");
    } else if (t.includes("debug")) {
        graph.steps.push("find_error");
        graph.steps.push("fix_error");
    } else {
        graph.steps.push("reason");
        graph.steps.push("respond");
    }

    runtime.graphNodes += graph.steps.length;

    return graph;
}

// ======================================================
// 🧠 REWARD SYSTEM (NEW)
// ======================================================
function reward(output) {
    let score = 0;

    if (!output) return 0;

    if (output.length > 80) score += 1;
    if (!output.includes("undefined")) score += 1;
    if (!output.includes("error")) score += 1;
    if (output.includes(".")) score += 1;
    if (output.split("\n").length > 2) score += 1;

    runtime.rewardTotal += score;
    runtime.rewardHistory.push(score);

    return score;
}

// ======================================================
// 🧰 TOOL SYSTEM (INTEGRATED WITH SMART FILE WRITER)
// ======================================================
const Tools = {
    writeFile(content, filename = "") {
        return writeSmartFile(content, filename);
    }
};

// ======================================================
// 🌐 SAFE FETCH
// ======================================================
async function safeFetch(model, messages) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    try {
        const res = await fetch(URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
                model,
                messages,
                stream: true
            })
        });

        clearTimeout(timer);

        if (!res.ok) throw new Error("HTTP_FAIL");

        return res;
    } catch (e) {
        clearTimeout(timer);
        throw e;
    }
}

// ======================================================
// ⏳ LOADING SPINNER (THINKING INDICATOR)
// ======================================================
let spinnerInterval = null;
function startSpinner() {
    setTerminalTitle("⏳ Thinking...");
    const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    let i = 0;
    process.stdout.write(`\n${colors.yellow}ChatGPT is thinking... ${frames[0]}${colors.reset}`);
    spinnerInterval = setInterval(() => {
        i = (i + 1) % frames.length;
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(`${colors.yellow}ChatGPT is thinking... ${frames[i]}${colors.reset}`);
    }, 80);
}

// Stop spinner and clean line
function stopSpinner() {
    if (spinnerInterval) {
        clearInterval(spinnerInterval);
        spinnerInterval = null;
        readline.cursorTo(process.stdout, 0);
        readline.clearLine(process.stdout, 0);
    }
}

// ======================================================
// 🌊 STREAM ENGINE (ROBUST PARSING FOR SSE + LOW LATENCY)
// ======================================================
async function streamRead(res) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";
    let output = "";
    let isFirstToken = true;

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
            let cleanLine = line.trim();
            if (cleanLine.startsWith("data: ")) {
                cleanLine = cleanLine.substring(6).trim();
            }
            if (!cleanLine || cleanLine === "[DONE]") continue;

            try {
                const json = JSON.parse(cleanLine);
                const text = json?.message?.content || json?.choices?.[0]?.delta?.content || "";

                if (text) {
                    if (isFirstToken) {
                        stopSpinner();
                        setTerminalTitle("Streaming...");
                        process.stdout.write(`\n${colors.green}${colors.bold}ChatGPT ➔ ${colors.reset}${colors.gray}`);
                        isFirstToken = false;
                    }
                    output += text;
                    runtime.streamChunks++;
                    process.stdout.write(text);
                }
            } catch (e) {
                // Ignore parse errors from malformed chunks
            }
        }
    }

    if (isFirstToken) {
        stopSpinner();
    }
    process.stdout.write(colors.reset); // Reset text styling
    console.log("\n");

    return output;
}

// ======================================================
// 🎨 MARKDOWN RENDERER (CLI HIGHLIGHTING)
// ======================================================
function formatMarkdown(text) {
    if (!text) return text;
    
    // 1. Highlight code blocks: ```javascript ... ```
    const parts = text.split("```");
    let formatted = "";
    for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 1) {
            // Inside code block
            const lines = parts[i].split("\n");
            const header = lines[0] ? `[Code: ${lines[0].trim() || "text"}]` : "[Code]";
            const codeBody = lines.slice(1).join("\n");
            formatted += `\n${colors.gray}┌── ${header} ──────────────────────────────────────${colors.reset}\n`;
            // Color the code lines cyan or green
            const coloredBody = codeBody.split("\n").map(l => `${colors.cyan}${l}${colors.reset}`).join("\n");
            formatted += coloredBody;
            formatted += `\n${colors.gray}└────────────────────────────────────────────────────────${colors.reset}\n`;
        } else {
            // Outside code block, format inline code and bolding
            let inlineText = parts[i];
            
            // Highlight bold: **text** -> bold green
            inlineText = inlineText.replace(/\*\*(.*?)\*\*/g, `${colors.bold}${colors.green}$1${colors.reset}`);
            
            // Highlight inline code: `code` -> yellow
            inlineText = inlineText.replace(/`(.*?)`/g, `${colors.yellow}$1${colors.reset}`);
            
            formatted += inlineText;
        }
    }
    return formatted;
}

// ======================================================
// 🧠 EXECUTION GRAPH ENGINE
// ======================================================
async function executeGraph(input, graph) {
    runtime.requests++;

    const messages = Memory.retrieve();
    messages.push({ role: "user", content: input });
    messages.push({ role: "system", content: JSON.stringify(graph) });

    const model = ACTIVE_MODEL || (input.length > 100 ? MODEL_SMART : MODEL_FAST);

    startSpinner();
    try {
        const res = await safeFetch(model, messages);
        const output = await streamRead(res);
        return output;
    } catch (e) {
        stopSpinner();
        throw e;
    }
}

// ======================================================
// 🧠 MAIN PIPELINE
// ======================================================
async function cognition(input) {

    const graph = planner(input);

    const output = await executeGraph(input, graph);

    const score = reward(output);

    runtime.lastInput = input;
    runtime.lastOutput = output;
    runtime.lastScore = score;

    // MEMORY GRAPH
    const a = Memory.add("user", input);
    const b = Memory.add("assistant", output);
    Memory.link(a, b);

    return output + `\n\n[REWARD:${score}]`;
}

// ======================================================
// 🧪 REGRESSION TEST
// ======================================================
async function regressionTest() {
    console.log("\n🧪 REGRESSION TEST");

    const tests = [
        () => planner("code test"),
        () => reward("hello world"),
        () => typeof Tools.writeFile === "function",
        () => typeof cognition === "function"
    ];

    let pass = 0;

    for (const t of tests) {
        try {
            if (t()) pass++;
            console.log("OK");
        } catch {
            console.log("FAIL");
        }
    }

    console.log(`RESULT: ${pass}/${tests.length}`);

    await cognition("system test");
}

// ======================================================
// 🧠 CLI ENGINE (CHATGPT STYLING + ASYNC QUEUE)
// ======================================================
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const promptUser = () => {
    setTerminalTitle("Idle");
    rl.setPrompt(`\n${colors.cyan}${colors.bold}You ➔ ${colors.reset}`);
    rl.prompt();
};

let queue = [];
let running = false;

async function processQueue() {
    if (running) return;
    running = true;

    while (queue.length > 0) {
        const input = queue.shift();

        try {
            if (!input) continue;

            if (input === "/check") {
                featureChecklist();
            } else if (input === "/runtime") {
                runtimeBehavior();
            } else if (input === "/test") {
                await regressionTest();
            } else if (input === "/clear") {
                Memory.nodes.clear();
                Memory.save();
                console.log("🧠 MEMORY GRAPH CLEARED & PERSISTED");
            } else if (input === "/version" || input === "/bump") {
                const nextVer = version.next();
                console.log(`📦 VERSION BUMPED TO: ${colors.green}${colors.bold}${nextVer}${colors.reset}`);
                setTerminalTitle("Idle");
            } else if (input.startsWith("/file ")) {
                const parts = input.substring(6).trim().split(" ");
                const filePath = parts[0];
                const promptMsg = parts.slice(1).join(" ");

                const absPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
                if (fs.existsSync(absPath)) {
                    try {
                        const fileContent = fs.readFileSync(absPath, "utf8");
                        const finalInput = `[File: ${filePath}]\n\`\`\`\n${fileContent}\n\`\`\`\n\n${promptMsg || "Please analyze this file."}`;
                        
                        console.log(`${colors.yellow}📄 Loaded file: ${filePath} (${fileContent.length} chars)${colors.reset}`);
                        const rawOut = await cognition(finalInput);
                        console.log(`\n${colors.gray}┌── ChatGPT Formatted Response ──────────────────────${colors.reset}`);
                        console.log(formatMarkdown(runtime.lastOutput));
                        console.log(`${colors.gray}└────────────────────────────────────────────────────────${colors.reset}`);
                        console.log(`${colors.yellow}[Score: ${runtime.lastScore}]${colors.reset}`);
                    } catch (err) {
                        console.log(`${colors.red}❌ Error reading file: ${err.message}${colors.reset}`);
                    }
                } else {
                    console.log(`${colors.red}❌ File not found: ${filePath}${colors.reset}`);
                }
            } else if (input.startsWith("/model")) {
                const parts = input.split(" ");
                const target = parts[1] ? parts[1].trim().toLowerCase() : "";
                if (target === "smart") {
                    ACTIVE_MODEL = MODEL_SMART;
                    console.log("🤖 ACTIVE MODEL SET TO SMART:", ACTIVE_MODEL);
                } else if (target === "fast") {
                    ACTIVE_MODEL = MODEL_FAST;
                    console.log("🤖 ACTIVE MODEL SET TO FAST:", ACTIVE_MODEL);
                } else if (target === "dynamic") {
                    ACTIVE_MODEL = null;
                    console.log("🤖 ACTIVE MODEL SET TO DYNAMIC AUTO-SWITCHING");
                } else {
                    ACTIVE_MODEL = (ACTIVE_MODEL === MODEL_FAST) ? MODEL_SMART : MODEL_FAST;
                    console.log("🤖 TOGGLED ACTIVE MODEL TO:", ACTIVE_MODEL);
                }
                setTerminalTitle("Idle");
            } else if (input === "/help") {
                console.log("\n📋 AVAILABLE COMMANDS:");
                console.log("  /check                - Run feature checklist");
                console.log("  /runtime              - Show runtime snapshot");
                console.log("  /test                 - Run regression tests");
                console.log("  /model [fast|smart]   - Set model (fast, smart, dynamic, or toggle)");
                console.log("  /file <path> <prompt> - Load local file content into chat prompt");
                console.log("  /version (or /bump)   - Bump/increment the project version");
                console.log("  /clear                - Clear memory nodes (both memory and file)");
                console.log("  /help                 - Show this help message");
                console.log("  exit                  - Exit application");
            } else if (input === "exit") {
                process.exit(0);
            } else {
                await cognition(input);
                console.log(`\n${colors.gray}┌── ChatGPT Formatted Response ──────────────────────${colors.reset}`);
                console.log(formatMarkdown(runtime.lastOutput));
                console.log(`${colors.gray}└────────────────────────────────────────────────────────${colors.reset}`);
                console.log(`${colors.yellow}[Score: ${runtime.lastScore}]${colors.reset}`);
            }
        } catch (e) {
            console.log("\nERROR:", e.message);
        }
    }

    running = false;
    promptUser();
}

rl.on("line", (input) => {
    input = (input || "").trim();
    if (!input) return;

    runtime.cliQueue++;
    queue.push(input);

    processQueue();
});

rl.on("close", () => process.exit(0));

// Initial prompt
promptUser();

//======================================================
// SMART FILE WRITER
//======================================================

function detectFileType(content) {
    const text = (content || "").trim();

    if (/<!DOCTYPE html>/i.test(text) || /<html/i.test(text))
        return "html";

    if (/^\s*<svg/i.test(text))
        return "svg";

    if (/^\s*\{[\s\S]*\}\s*$/.test(text))
        return "json";

    if (/^\s*\[[\s\S]*\]\s*$/.test(text))
        return "json";

    if (
        text.includes("function ") ||
        text.includes("=>") ||
        text.includes("module.exports") ||
        text.includes("require(") ||
        text.includes("const ") ||
        text.includes("let ")
    )
        return "js";

    if (
        text.includes("body {") ||
        text.includes("@media") ||
        text.includes(":root") ||
        text.includes(".container")
    )
        return "css";

    if (
        text.startsWith("# ") ||
        text.startsWith("## ") ||
        text.startsWith("```")
    )
        return "md";

    return "txt";
}

function writeSmartFile(content, filename = "") {

    const dir = path.join(process.cwd(), "Proj");

    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });

    let ext = detectFileType(content);

    if (filename) {

        const e = path.extname(filename);

        if (e)
            ext = e.substring(1);

    }

    const name = filename
        ? filename
        : `Proj_${version.current()}_${Date.now()}.${ext}`;

    const full = path.join(dir, name);
    const parentDir = path.dirname(full);

    if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
    }

    fs.writeFileSync(full, content, "utf8");

    console.log("📁 CREATED:", full);

    runtime.toolCalls++;

    return full;
}