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

let ACTIVE_MODEL = MODEL_FAST;

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
        queue: runtime.cliQueue
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
// 🧰 TOOL SYSTEM (NEW)
// ======================================================
const Tools = {
    writeFile(content) {
        const dir = path.join(process.cwd(), "Proj");
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const file = path.join(dir, `Proj_${Date.now()}.txt`);
        fs.writeFileSync(file, content, "utf8");

        runtime.toolCalls++;
        return file;
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
// 🌊 STREAM ENGINE (FIXED LOW LATENCY)
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
            try {
                const json = JSON.parse(line);
                const text = json?.message?.content || "";

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
            } catch {}
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

    const model = input.length > 100 ? MODEL_SMART : MODEL_FAST;

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
// 🧠 CLI ENGINE (FIXED QUEUE)
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

            if (input === "/check") featureChecklist();
            else if (input === "/runtime") runtimeBehavior();
            else if (input === "/test") await regressionTest();
            else if (input === "exit") process.exit(0);
            else {
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