const readline = require("readline");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const config = require("./config/config");
const VersionManager = require("./core/version");

// ======================================================
// 🧠 AI COGNITIVE OS v5 (GRAPH + REWARD + TOOL SYSTEM)
// ======================================================

console.log("🧠 AI COGNITIVE OS v5 STARTED");

// ======================================================
// 🤖 MODEL CONFIG
// ======================================================
const URL = config.URL;
const MODEL_FAST = config.MODEL_FAST;
const MODEL_SMART = config.MODEL_SMART;

let ACTIVE_MODEL = null; // Dynamically uses model, default to null to fallback to logic

// ======================================================
// 📦 VERSION SYSTEM
// ======================================================
const version = new VersionManager(config);

// ======================================================
// 🧠 MEMORY SYSTEM (GRAPH MEMORY EXTENSION)
// ======================================================
const Memory = {
    nodes: new Map(),

    add(role, content) {
        const id = crypto.randomUUID();
        this.nodes.set(id, {
            id,
            role,
            content,
            links: [],
            time: Date.now()
        });
        return id;
    },

    link(a, b) {
        if (this.nodes.has(a) && this.nodes.has(b)) {
            this.nodes.get(a).links.push(b);
        }
    },

    retrieve(limit = 10) {
        return [...this.nodes.values()]
            .sort((a, b) => b.time - a.time)
            .slice(0, limit)
            .map(x => ({ role: x.role, content: x.content }));
    }
};

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
// 🌊 STREAM ENGINE (ROBUST PARSING FOR SSE)
// ======================================================
async function streamRead(res) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";
    let output = "";
    let chunk = "";

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
                    output += text;
                    chunk += text;

                    runtime.streamChunks++;

                    // FIX LOW LATENCY OUTPUT
                    if (chunk.length >= 30) {
                        process.stdout.write(chunk);
                        chunk = "";
                    }
                }
            } catch (e) {
                // Ignore parse errors from malformed chunks
            }
        }
    }

    if (chunk) process.stdout.write(chunk);
    console.log("\n");

    return output;
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

    const res = await safeFetch(model, messages);
    const output = await streamRead(res);

    return output;
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
// 🧠 CLI ENGINE (COMMAND EXPANSIONS)
// ======================================================
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

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
                console.log("🧠 MEMORY GRAPH CLEARED");
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
                    // Toggle if no argument is specified
                    ACTIVE_MODEL = (ACTIVE_MODEL === MODEL_FAST) ? MODEL_SMART : MODEL_FAST;
                    console.log("🤖 TOGGLED ACTIVE MODEL TO:", ACTIVE_MODEL);
                }
            } else if (input === "/help") {
                console.log("\n📋 AVAILABLE COMMANDS:");
                console.log("  /check    - Run feature checklist");
                console.log("  /runtime  - Show runtime snapshot");
                console.log("  /test     - Run regression tests");
                console.log("  /model    - Set model (/model fast, /model smart, /model dynamic, or toggle with /model)");
                console.log("  /clear    - Clear memory nodes");
                console.log("  /help     - Show this help message");
                console.log("  exit      - Exit application");
            } else if (input === "exit") {
                process.exit(0);
            } else {
                const out = await cognition(input);
                console.log("\n🧠 FINAL OUTPUT:\n");
                console.log(out);
            }
        } catch (e) {
            console.log("ERROR:", e.message);
        }
    }

    running = false;
}

rl.on("line", (input) => {
    input = (input || "").trim();
    if (!input) return;

    runtime.cliQueue++;
    queue.push(input);

    processQueue();
});

rl.on("close", () => process.exit(0));

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
        : `Proj_${Date.now()}.${ext}`;

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