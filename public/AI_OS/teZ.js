const readline = require("readline");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const cp = require("child_process");

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

function calculateSimilarity(text1, text2) {
    const stopwords = new Set(["the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "to", "of", "in", "on", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "的", "了", "和", "是", "就", "都", "而", "及", "與", "著", "或", "且", "則", "亦", "本", "然", "其", "此", "彼"]);
    
    const getWords = (text) => {
        return new Set(
            (text || "").toLowerCase()
                .replace(/[^\w\s\u4e00-\u9fa5]/g, " ")
                .split(/[\s]+/)
                .filter(w => w && !stopwords.has(w))
        );
    };

    const words1 = getWords(text1);
    const words2 = getWords(text2);

    if (words1.size === 0 || words2.size === 0) return 0;

    let intersection = 0;
    for (const w of words1) {
        if (words2.has(w)) {
            intersection++;
        }
    }

    const union = words1.size + words2.size - intersection;
    return intersection / union;
}

async function getEmbedding(text) {
    const embedUrl = URL.replace("/chat", "/embeddings");
    try {
        const res = await fetch(embedUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: ACTIVE_MODEL || config.MODEL_FAST || "qwen2.5:3b",
                prompt: text
            })
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json.embedding || null;
    } catch (e) {
        return null;
    }
}

function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dotProduct = 0.0;
    let normA = 0.0;
    let normB = 0.0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

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

    async add(role, content) {
        const id = crypto.randomUUID();
        const embedding = await getEmbedding(content);
        this.nodes.set(id, {
            id,
            role,
            content,
            links: [],
            time: Date.now(),
            embedding
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
    },

    async retrieveSemantic(query, limit = 5) {
        const queryEmbedding = await getEmbedding(query);
        const results = [];
        for (const x of this.nodes.values()) {
            let similarity = 0;
            if (queryEmbedding && x.embedding) {
                similarity = cosineSimilarity(queryEmbedding, x.embedding);
            } else {
                similarity = calculateSimilarity(query, x.content);
            }
            results.push({
                role: x.role,
                content: x.content,
                similarity
            });
        }
        return results
            .filter(x => x.similarity > 0.05)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit)
            .map(x => ({ role: x.role, content: x.content }));
    },

    async retrieveSemanticCombined(query, limit = 10) {
        const semantic = await this.retrieveSemantic(query, Math.floor(limit / 2));
        const recent = this.retrieve(limit);
        const seen = new Set();
        const combined = [];
        
        for (const item of [...semantic, ...recent]) {
            if (!seen.has(item.content)) {
                seen.add(item.content);
                combined.push(item);
            }
        }
        return combined.slice(0, limit);
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

    const messages = await Memory.retrieveSemanticCombined(input);
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
// ======================================================
function parseQuotedArgs(str) {
    str = (str || "").trim();
    if (!str) return { path: "", rest: "" };
    let path = "";
    let rest = "";
    if (str.startsWith('"')) {
        const nextQuote = str.indexOf('"', 1);
        if (nextQuote !== -1) {
            path = str.substring(1, nextQuote);
            rest = str.substring(nextQuote + 1).trim();
        } else {
            path = str.substring(1);
        }
    } else if (str.startsWith("'")) {
        const nextQuote = str.indexOf("'", 1);
        if (nextQuote !== -1) {
            path = str.substring(1, nextQuote);
            rest = str.substring(nextQuote + 1).trim();
        } else {
            path = str.substring(1);
        }
    } else {
        const firstSpace = str.indexOf(" ");
        if (firstSpace !== -1) {
            path = str.substring(0, firstSpace);
            rest = str.substring(firstSpace + 1).trim();
        } else {
            path = str;
        }
    }
    return { path, rest };
}

function stripQuotes(str) {
    str = (str || "").trim();
    if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
        return str.substring(1, str.length - 1).trim();
    }
    return str;
}

function isCodeRequest(input) {
    const t = input.toLowerCase();
    return (
        t.includes("code") ||
        t.includes("program") ||
        t.includes("寫") ||
        t.includes("程式") ||
        t.includes("實作") ||
        t.includes("產生") ||
        t.includes("function") ||
        t.includes("class") ||
        t.includes("create") ||
        t.includes("debug") ||
        t.includes("fix")
    );
}

function validateCode(code) {
    const placeholders = [
        /\/\/ \.\.\./,
        /\/\* \.\.\. \*\//,
        /以此類推/,
        /\/\/ 略/,
        /\/\* 略 \*\//,
        /\/\/ TODO/i,
        /\/\/ write code here/i,
        /\/\/ insert your code/i,
        /\/\* insert your code \*\//i,
        /and so on/i
    ];

    for (const pattern of placeholders) {
        if (pattern.test(code)) {
            return {
                valid: false,
                reason: `Found placeholder matching pattern: ${pattern.toString()}`
            };
        }
    }
    return { valid: true };
}

async function getAIResponse(model, messages, label) {
    if (label) {
        process.stdout.write(`${colors.yellow}⏳ [planA] Running ${label}... ${colors.reset}`);
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60000);

    try {
        const res = await fetch(URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
                model,
                messages,
                stream: false
            })
        });

        clearTimeout(timer);

        if (!res.ok) throw new Error("HTTP_FAIL");

        const json = await res.json();
        const content = json?.message?.content || "";
        if (label) {
            console.log(`${colors.green}Done!${colors.reset}`);
        }
        return content;
    } catch (e) {
        clearTimeout(timer);
        if (label) {
            console.log(`${colors.red}Failed: ${e.message}${colors.reset}`);
        }
        throw e;
    }
}

function runSandbox(filePath) {
    return new Promise((resolve) => {
        const ext = path.extname(filePath);
        if (ext !== ".js") {
            return resolve({ success: true, stdout: "Not a JS file, skipped execution check." });
        }

        process.stdout.write(`${colors.yellow}⏳ [planA] Running execution test on ${path.basename(filePath)}... ${colors.reset}`);
        cp.exec(`node "${filePath}"`, { timeout: 4000 }, (error, stdout, stderr) => {
            if (error) {
                console.log(`${colors.red}Failed!${colors.reset}`);
                resolve({
                    success: false,
                    error: error.message,
                    stderr: stderr,
                    stdout: stdout
                });
            } else {
                console.log(`${colors.green}Success!${colors.reset}`);
                resolve({
                    success: true,
                    stdout: stdout
                });
            }
        });
    });
}

async function streamFormattedOutput(text, score) {
    stopSpinner();
    setTerminalTitle("Streaming...");
    console.log(`\n${colors.gray}┌── ChatGPT Formatted Response ──────────────────────${colors.reset}`);
    const formatted = formatMarkdown(text);
    const lines = formatted.split("\n");
    for (const line of lines) {
        console.log(line);
        await new Promise(resolve => setTimeout(resolve, 15)); // smooth delay per line
    }
    console.log(`${colors.gray}└────────────────────────────────────────────────────────${colors.reset}`);
    console.log(`${colors.yellow}[Score: ${score}]${colors.reset}`);
}

// ======================================================
// 🧠 MAIN PIPELINE (planA.txt IMPLEMENTATION)
// ======================================================
async function cognition(input) {
    const isCode = isCodeRequest(input);
    const model = ACTIVE_MODEL || (input.length > 100 ? MODEL_SMART : MODEL_FAST);

    if (!isCode) {
        const graph = planner(input);
        const output = await executeGraph(input, graph);
        const score = reward(output);
        runtime.lastInput = input;
        runtime.lastOutput = output;
        runtime.lastScore = score;

        const a = await Memory.add("user", input);
        const b = await Memory.add("assistant", output);
        Memory.link(a, b);
        return output + `\n\n[REWARD:${score}]`;
    }

    console.log(`\n${colors.cyan}${colors.bold}⚡ Starting planA Workflow for Code Generation...${colors.reset}`);

    // Step 1: Planner (mandatory)
    const planPrompt = `Based on the user request, create a step-by-step implementation plan. Outline all files, classes, methods, and modules.
User Request: ${input}`;
    const plannerMessages = [
        { role: "system", content: "You are an expert system architect. Create a clean, detailed, and structured step-by-step execution plan." },
        { role: "user", content: planPrompt }
    ];
    const plan = await getAIResponse(model, plannerMessages, "Planner");
    console.log(`${colors.gray}--- PLAN DESIGNED ---\n${plan}\n---------------------${colors.reset}`);

    // Step 2: Executor (mandatory)
    const execPrompt = `Based on the user request and the plan below, write the complete, production-ready code.
User Request: ${input}

Plan:
${plan}

IMPORTANT REQUIREMENTS:
1. You MUST write complete, clean, functional code.
2. Do NOT use placeholders like "// ...", "/* ... */", "以此類推", "// 略", "// TODO", "and so on", or any skipped code comments.
3. If you are modifying an existing file, you can output precise search-and-replace blocks to only modify the lines that need changes. Specify the filename clearly before each block and use this format:
   File: filename
   <<<<<<< SEARCH
   [exact lines of code in the existing file to search for]
   =======
   [replacement code]
   >>>>>>> REPLACE
4. If writing a new file, output the full file contents in a standard markdown code block.`;

    const executorMessages = [
        { role: "system", content: "You are an expert software developer. You write clean, production-ready, complete code without any ellipsis, placeholders, or skipped sections. You can write precise search-and-replace blocks for existing files." },
        { role: "user", content: execPrompt }
    ];
    let code = await getAIResponse(model, executorMessages, "Executor");

    // Step 3: Critic (mandatory)
    const criticPrompt = `Verify the following code/edits generated by the Executor.
Identify any missing parts, bugs, or placeholders (like '// ...', '/* ... */', '以此類推', '// 略', '// TODO', 'and so on').
If the code/edit is 100% complete, fully implemented, and correct, reply with ONLY the word "PASS".
Otherwise, list all parts that are incomplete or have placeholders.

Generated Code:
${code}`;

    const criticMessages = [
        { role: "system", content: "You are a senior code reviewer. You look for skipped code, placeholders, and bugs. Be extremely strict." },
        { role: "user", content: criticPrompt }
    ];
    let criticComments = await getAIResponse(model, criticMessages, "Critic");
    console.log(`${colors.gray}--- CRITIC REVIEW ---\n${criticComments}\n---------------------${colors.reset}`);

    // Step 4 & 5: Refiner (mandatory loop) & Validator (must pass threshold)
    let loopCount = 0;
    const maxLoops = 3;
    let validated = validateCode(code);
    let criticPassed = criticComments.trim().toUpperCase() === "PASS";
    let sandboxPassed = true;
    let sandboxError = "";

    // Run initial sandbox check if it looks valid
    if (validated.valid) {
        const jsBlockMatch = /```javascript\n([\s\S]*?)```/.exec(code) || /```js\n([\s\S]*?)```/.exec(code);
        if (jsBlockMatch) {
            const tempPath = path.join(process.cwd(), "Proj", `temp_test_${Date.now()}.js`);
            const tempDir = path.dirname(tempPath);
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            fs.writeFileSync(tempPath, jsBlockMatch[1], "utf8");
            const runResult = await runSandbox(tempPath);
            try { fs.unlinkSync(tempPath); } catch(e){}
            
            if (!runResult.success) {
                sandboxPassed = false;
                sandboxError = `Code compilation/execution error:\n${runResult.error || ""}\n${runResult.stderr || ""}`;
            }
        }
    }

    while ((!validated.valid || !criticPassed || !sandboxPassed) && loopCount < maxLoops) {
        loopCount++;
        let reason = "";
        if (!validated.valid) reason = validated.reason;
        else if (!sandboxPassed) reason = sandboxError;
        else reason = "Critic did not pass.";

        console.log(`${colors.yellow}🔄 Refining code (Iteration ${loopCount}/${maxLoops}). Reason: ${reason}${colors.reset}`);

        const refinePrompt = `Please refine and rewrite the code to address the critic comments and fix any execution errors. Ensure there are absolutely NO placeholders, ellipses, or incomplete sections.
Reason for refinement:
${reason}

Critic comments:
${criticComments}

Original Code:
${code}

IMPORTANT: Output the entire complete program or valid search-and-replace blocks. Do NOT omit any parts or use '// ...' or '以此類推'.`;

        const refinerMessages = [
            { role: "system", content: "You are an expert software refiner. You rewrite code to make it fully complete, functional, and placeholder-free." },
            { role: "user", content: refinePrompt }
        ];
        code = await getAIResponse(model, refinerMessages, `Refiner (Loop ${loopCount})`);

        // Re-validate and Critic again
        validated = validateCode(code);
        
        sandboxPassed = true;
        sandboxError = "";
        if (validated.valid) {
            const jsBlockMatch = /```javascript\n([\s\S]*?)```/.exec(code) || /```js\n([\s\S]*?)```/.exec(code);
            if (jsBlockMatch) {
                const tempPath = path.join(process.cwd(), "Proj", `temp_test_${Date.now()}.js`);
                const tempDir = path.dirname(tempPath);
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir, { recursive: true });
                }
                fs.writeFileSync(tempPath, jsBlockMatch[1], "utf8");
                const runResult = await runSandbox(tempPath);
                try { fs.unlinkSync(tempPath); } catch(e){}
                
                if (!runResult.success) {
                    sandboxPassed = false;
                    sandboxError = `Code compilation/execution error:\n${runResult.error || ""}\n${runResult.stderr || ""}`;
                }
            }
        }

        const reCriticMessages = [
            { role: "system", content: "You are a senior code reviewer. You look for skipped code, placeholders, and bugs. Be extremely strict." },
            { role: "user", content: `Verify the refined code. If 100% complete with NO placeholders, reply ONLY with "PASS". Otherwise list the issues.\nCode:\n${code}` }
        ];
        criticComments = await getAIResponse(model, reCriticMessages, `Validator/Critic (Loop ${loopCount})`);
        criticPassed = criticComments.trim().toUpperCase() === "PASS";
    }

    console.log(`${colors.green}✅ Workflow finished in ${loopCount + 1} stages.${colors.reset}`);

    // Automatically apply search-replace blocks or write full files
    const editBlocks = applySearchReplaceBlocks(code);
    if (editBlocks.length > 0) {
        const editsApplied = applyEdits(editBlocks);
        console.log(`${colors.green}💾 Successfully applied ${editsApplied} search-replace blocks.${colors.reset}`);
    } else {
        const codeBlockRegex = /```[a-zA-Z0-9]*\n([\s\S]*?)```/g;
        let match;
        let fileWrittenCount = 0;
        while ((match = codeBlockRegex.exec(code)) !== null) {
            const fileContent = match[1];
            let filename = "";
            const fileMatches = input.match(/(?:file|filename|檔案|檔名)[:\s]*([a-zA-Z0-9_\-\.\/\\:]+)/i);
            if (fileMatches && fileMatches[1]) {
                filename = fileMatches[1];
                if (fileWrittenCount > 0) {
                    filename = `${path.basename(filename, path.extname(filename))}_part${fileWrittenCount + 1}${path.extname(filename)}`;
                }
            }
            
            const savedPath = Tools.writeFile(fileContent, filename);
            console.log(`${colors.green}💾 Automatically saved code block to: ${savedPath}${colors.reset}`);
            fileWrittenCount++;
        }
    }

    const score = reward(code);
    runtime.lastInput = input;
    runtime.lastOutput = code;
    runtime.lastScore = score;

    const a = await Memory.add("user", input);
    const b = await Memory.add("assistant", code);
    Memory.link(a, b);

    return code + `\n\n[REWARD:${score}]`;
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
function readFolderRecursive(dirPath, relativeRoot = "") {
    let results = [];
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        if (["node_modules", ".git", ".gemini", "memory", "backup", "output", "Proj", "sessions", "temp", "cache"].includes(file)) {
            continue;
        }
        const fullPath = path.join(dirPath, file);
        const relPath = relativeRoot ? path.join(relativeRoot, file) : file;
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            results = results.concat(readFolderRecursive(fullPath, relPath));
        } else {
            const ext = path.extname(file).toLowerCase();
            if ([".js", ".json", ".txt", ".md", ".css", ".html", ".ts", ".jsx", ".tsx", ".mjs", ".cjs"].includes(ext)) {
                try {
                    results.push({
                        relPath,
                        fullPath,
                        content: fs.readFileSync(fullPath, "utf8")
                    });
                } catch(e) {}
            }
        }
    }
    return results;
}

function generateCodeMapForFile(filePath, relativePath) {
    try {
        const content = fs.readFileSync(filePath, "utf8");
        const lines = content.split("\n");
        const outline = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (
                line.startsWith("class ") ||
                line.startsWith("function ") ||
                line.startsWith("async function ") ||
                line.startsWith("module.exports") ||
                line.startsWith("export ") ||
                /^(const|let|var)\s+[a-zA-Z0-9_]+\s*=\s*(\(|async\s+\(|function)/.test(line) ||
                (line.startsWith("//") && (line.includes("===") || line.includes("---")))
            ) {
                outline.push(`Line ${i + 1}: ${lines[i]}`);
            }
        }
        if (outline.length === 0) {
            return `[File Outline: ${relativePath}] (No structure declarations detected)\n`;
        }
        return `[File Outline: ${relativePath}]\n` + outline.join("\n") + "\n";
    } catch (e) {
        return `[File Outline: ${relativePath}] (Failed to read: ${e.message})\n`;
    }
}

function applySearchReplaceBlocks(content) {
    const blocks = [];
    const blockRegex = /<<<<<<< SEARCH\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>> REPLACE/g;
    let match;
    
    while ((match = blockRegex.exec(content)) !== null) {
        const searchContent = match[1];
        const replaceContent = match[2];
        const blockStart = match.index;
        
        const beforeText = content.substring(Math.max(0, blockStart - 300), blockStart);
        const fileMatches = beforeText.match(/(?:file|filename|檔案|檔名)[:\s]*([a-zA-Z0-9_\-\.\/\\:]+)/i) || beforeText.match(/([a-zA-Z0-9_\-\.\/\\:]+\.[a-z0-9]+)/gi);
        
        let matchedFile = "";
        if (fileMatches) {
            matchedFile = fileMatches[fileMatches.length - 1];
        }
        
        blocks.push({
            searchContent,
            replaceContent,
            filePath: matchedFile
        });
    }
    return blocks;
}

function applyEdits(blocks) {
    let editCount = 0;
    for (const block of blocks) {
        if (!block.filePath) {
            console.log(`${colors.red}❌ Could not determine filename for search-replace block.${colors.reset}`);
            continue;
        }
        
        const baseName = path.basename(block.filePath);
        const absPath = path.isAbsolute(block.filePath) ? block.filePath : path.join(process.cwd(), "Proj", baseName);
        
        if (fs.existsSync(absPath)) {
            const fileContent = fs.readFileSync(absPath, "utf8");
            // Normalize CRLF to LF for matching
            const normalizedContent = fileContent.replace(/\r\n/g, "\n");
            const normalizedSearch = block.searchContent.replace(/\r\n/g, "\n");
            
            if (normalizedContent.includes(normalizedSearch)) {
                const updated = normalizedContent.replace(normalizedSearch, block.replaceContent.replace(/\r\n/g, "\n"));
                writeSmartFile(updated, absPath);
                console.log(`${colors.green}✅ Applied search-replace edit block to: ${baseName}${colors.reset}`);
                editCount++;
            } else {
                console.log(`${colors.red}❌ Search block content not found in file: ${baseName}${colors.reset}`);
            }
        } else {
            console.log(`${colors.red}❌ File not found for search-replace: ${block.filePath}${colors.reset}`);
        }
    }
    return editCount;
}

// ======================================================
// 🧠 CLI ENGINE (CHATGPT STYLING + ASYNC QUEUE)
// ======================================================
const historyFile = path.join(memoryDir, "cli_history.txt");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    completer: function(line) {
        const completions = [
            "/check",
            "/runtime",
            "/test",
            "/model",
            "/file",
            "/folder",
            "/rollback",
            "/version",
            "/bump",
            "/clear",
            "/help",
            "exit"
        ];
        const trimmed = line.trim();
        
        if (line.startsWith("/file ") || line.startsWith("/folder ") || line.startsWith("/rollback ")) {
            let prefix = "";
            let searchPart = "";
            if (line.startsWith("/file ")) {
                prefix = "/file ";
                searchPart = line.substring(6);
            } else if (line.startsWith("/folder ")) {
                prefix = "/folder ";
                searchPart = line.substring(8);
            } else if (line.startsWith("/rollback ")) {
                prefix = "/rollback ";
                searchPart = line.substring(10);
            }
            
            let isQuoted = false;
            let quoteChar = "";
            if (searchPart.startsWith('"') || searchPart.startsWith("'")) {
                quoteChar = searchPart[0];
                searchPart = searchPart.substring(1);
                isQuoted = true;
            }
            
            let dirToSearch = process.cwd();
            let filePrefix = searchPart;
            
            const lastSep = Math.max(searchPart.lastIndexOf("/"), searchPart.lastIndexOf("\\"));
            if (lastSep !== -1) {
                const dirPart = searchPart.substring(0, lastSep + 1);
                filePrefix = searchPart.substring(lastSep + 1);
                const absDir = path.isAbsolute(dirPart) ? dirPart : path.join(process.cwd(), dirPart);
                if (fs.existsSync(absDir) && fs.statSync(absDir).isDirectory()) {
                    dirToSearch = absDir;
                }
            }
            
            try {
                if (fs.existsSync(dirToSearch)) {
                    let files = fs.readdirSync(dirToSearch);
                    let matches = files.filter(f => f.toLowerCase().startsWith(filePrefix.toLowerCase()));
                    let recommendations = matches.map(f => {
                        let completedPart = searchPart.substring(0, lastSep + 1) + f;
                        const fullP = path.join(dirToSearch, f);
                        try {
                            if (fs.statSync(fullP).isDirectory()) {
                                completedPart += path.sep;
                            }
                        } catch(e){}
                        
                        if (isQuoted) {
                            return prefix + quoteChar + completedPart;
                        } else if (completedPart.includes(" ")) {
                            return prefix + '"' + completedPart + '"';
                        }
                        return prefix + completedPart;
                    });
                    return [recommendations, line];
                }
            } catch (e) {}
        }
        
        const hits = completions.filter((c) => c.startsWith(trimmed));
        return [hits.length ? hits : completions, line];
    }
});

// Load readline history
if (fs.existsSync(historyFile)) {
    try {
        const lines = fs.readFileSync(historyFile, "utf8")
            .split("\n")
            .map(line => line.trim())
            .filter(line => line.length > 0);
        rl.history = lines.reverse();
    } catch (err) {}
}

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
                const { path: filePath, rest: promptMsg } = parseQuotedArgs(input.substring(6));
                if (!filePath) {
                    console.log(`${colors.red}❌ Please specify a file path. Usage: /file <path> [prompt]${colors.reset}`);
                    continue;
                }

                const absPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
                if (fs.existsSync(absPath)) {
                    try {
                        const fileContent = fs.readFileSync(absPath, "utf8");
                        const finalInput = `[File: ${filePath}]\n\`\`\`\n${fileContent}\n\`\`\`\n\n${promptMsg || "Please analyze this file."}`;
                        
                        console.log(`${colors.yellow}📄 Loaded file: ${filePath} (${fileContent.length} chars)${colors.reset}`);
                        const rawOut = await cognition(finalInput);
                        await streamFormattedOutput(runtime.lastOutput, runtime.lastScore);
                    } catch (err) {
                        console.log(`${colors.red}❌ Error reading file: ${err.message}${colors.reset}`);
                    }
                } else {
                    console.log(`${colors.red}❌ File not found: ${filePath}${colors.reset}`);
                }
            } else if (input.startsWith("/folder ")) {
                const folderPath = stripQuotes(input.substring(8));
                if (!folderPath) {
                    console.log(`${colors.red}❌ Please specify a folder path. Usage: /folder <path>${colors.reset}`);
                    continue;
                }
                const absPath = path.isAbsolute(folderPath) ? folderPath : path.join(process.cwd(), folderPath);
                if (fs.existsSync(absPath)) {
                    try {
                        const filesData = readFolderRecursive(absPath);
                        let tree = "";
                        let codeMap = "";
                        for (const file of filesData) {
                            tree += `- ${file.relPath}\n`;
                            codeMap += generateCodeMapForFile(file.fullPath, file.relPath) + "\n";
                        }
                        const finalInput = `[Folder Tree: ${folderPath}]\n${tree}\n\n[Project Code Map & Outline]\n${codeMap}\n\nPlease analyze this project structure and outline. If you need to read the full content of any specific file, instruct me to load it using /file <path>.`;
                        console.log(`${colors.yellow}📁 Loaded folder map: ${folderPath} (${filesData.length} files)${colors.reset}`);
                        await cognition(finalInput);
                        await streamFormattedOutput(runtime.lastOutput, runtime.lastScore);
                    } catch (err) {
                        console.log(`${colors.red}❌ Error reading folder: ${err.message}${colors.reset}`);
                    }
                } else {
                    console.log(`${colors.red}❌ Folder not found: ${folderPath}${colors.reset}`);
                }
            } else if (input.startsWith("/rollback ")) {
                const filename = input.substring(10).trim();
                const backupDir = path.join(process.cwd(), "backup");
                if (fs.existsSync(backupDir)) {
                    const baseName = path.basename(filename);
                    const files = fs.readdirSync(backupDir).filter(f => f.startsWith(baseName) && f.endsWith(".bak"));
                    if (files.length > 0) {
                        files.sort((a, b) => b.localeCompare(a));
                        const latestBackup = files[0];
                        const backupPath = path.join(backupDir, latestBackup);
                        
                        let targetPath = path.isAbsolute(filename) ? filename : path.join(process.cwd(), "Proj", filename);
                        if (!fs.existsSync(targetPath)) {
                            const directPath = path.resolve(process.cwd(), filename);
                            if (fs.existsSync(directPath)) {
                                targetPath = directPath;
                            } else {
                                const findFile = (dir, name) => {
                                    const items = fs.readdirSync(dir);
                                    for (const item of items) {
                                        if (["node_modules", ".git", "backup", "memory"].includes(item)) continue;
                                        const full = path.join(dir, item);
                                        try {
                                            const stat = fs.statSync(full);
                                            if (stat.isDirectory()) {
                                                const res = findFile(full, name);
                                                if (res) return res;
                                            } else if (item === name) {
                                                return full;
                                            }
                                        } catch (e) {}
                                    }
                                    return null;
                                };
                                const found = findFile(process.cwd(), baseName);
                                if (found) {
                                    targetPath = found;
                                }
                            }
                        }
                        
                        try {
                            const content = fs.readFileSync(backupPath, "utf8");
                            if (fs.existsSync(targetPath) && config.AUTO_BACKUP) {
                                const currentContent = fs.readFileSync(targetPath, "utf8");
                                const rollBackupFile = path.join(backupDir, `${baseName}.pre_rollback.${Date.now()}.bak`);
                                fs.writeFileSync(rollBackupFile, currentContent, "utf8");
                            }
                            fs.writeFileSync(targetPath, content, "utf8");
                            console.log(`${colors.green}✅ ROLLBACK SUCCESSFUL:${colors.reset} Restored ${baseName} to ${targetPath} from backup ${latestBackup}`);
                        } catch (err) {
                            console.log(`${colors.red}❌ Rollback failed: ${err.message}${colors.reset}`);
                        }
                    } else {
                        console.log(`${colors.red}❌ No backups found for file: ${filename}${colors.reset}`);
                    }
                } else {
                    console.log(`${colors.red}❌ Backup directory not found.${colors.reset}`);
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
                console.log("  /check                  - Run feature checklist");
                console.log("  /runtime                - Show runtime snapshot");
                console.log("  /test                   - Run regression tests");
                console.log("  /model [fast|smart]     - Set model (fast, smart, dynamic, or toggle)");
                console.log("  /file <path> <prompt>   - Load local file content into chat prompt");
                console.log("  /folder <path>          - Load all files in a folder into context");
                console.log("  /rollback <filename>    - Roll back a file to its latest backup");
                console.log("  /version (or /bump)     - Bump/increment the project version");
                console.log("  /clear                  - Clear memory nodes (both memory and file)");
                console.log("  /help                   - Show this help message");
                console.log("  exit                    - Exit application");
            } else if (input === "exit") {
                process.exit(0);
            } else {
                await cognition(input);
                await streamFormattedOutput(runtime.lastOutput, runtime.lastScore);
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

    // Append to CLI history file
    try {
        fs.appendFileSync(historyFile, input + "\n", "utf8");
    } catch (e) {}

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

function generateSimpleDiff(oldContent, newContent) {
    const oldLines = (oldContent || "").split("\n");
    const newLines = (newContent || "").split("\n");
    let diff = "";
    
    let i = 0, j = 0;
    while (i < oldLines.length || j < newLines.length) {
        if (i < oldLines.length && j < newLines.length) {
            if (oldLines[i] === newLines[j]) {
                diff += `  ${oldLines[i]}\n`;
                i++;
                j++;
            } else {
                let foundMatch = false;
                for (let k = 1; k < 5; k++) {
                    if (j + k < newLines.length && oldLines[i] === newLines[j + k]) {
                        for (let a = 0; a < k; a++) {
                            diff += `${colors.green}+ ${newLines[j + a]}${colors.reset}\n`;
                        }
                        j += k;
                        foundMatch = true;
                        break;
                    }
                    if (i + k < oldLines.length && oldLines[i + k] === newLines[j]) {
                        for (let d = 0; d < k; d++) {
                            diff += `${colors.red}- ${oldLines[i + d]}${colors.reset}\n`;
                        }
                        i += k;
                        foundMatch = true;
                        break;
                    }
                }
                if (!foundMatch) {
                    diff += `${colors.red}- ${oldLines[i]}${colors.reset}\n`;
                    diff += `${colors.green}+ ${newLines[j]}${colors.reset}\n`;
                    i++;
                    j++;
                }
            }
        } else if (i < oldLines.length) {
            diff += `${colors.red}- ${oldLines[i]}${colors.reset}\n`;
            i++;
        } else if (j < newLines.length) {
            diff += `${colors.green}+ ${newLines[j]}${colors.reset}\n`;
            j++;
        }
    }
    return diff;
}

function writeSmartFile(content, filename = "") {
    const dir = path.join(process.cwd(), "Proj");

    let full;
    if (filename) {
        if (path.isAbsolute(filename)) {
            full = filename;
        } else {
            if (filename.includes("/") || filename.includes("\\")) {
                full = path.resolve(process.cwd(), filename);
            } else {
                full = path.join(dir, filename);
            }
        }
    } else {
        const ext = detectFileType(content);
        full = path.join(dir, `Proj_${version.current()}_${Date.now()}.${ext}`);
    }

    const name = path.basename(full);
    const parentDir = path.dirname(full);

    if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
    }

    // Git-like backup and diff check
    if (fs.existsSync(full) && config.AUTO_BACKUP) {
        const oldContent = fs.readFileSync(full, "utf8");
        if (oldContent !== content) {
            const backupDir = path.join(process.cwd(), "backup");
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }
            const timeStr = new Date().toISOString().replace(/[:.]/g, "-");
            const backupFile = path.join(backupDir, `${name}.${timeStr}.bak`);
            
            fs.writeFileSync(backupFile, oldContent, "utf8");
            console.log(`${colors.yellow}📦 BACKUP CREATED:${colors.reset} ${backupFile}`);

            console.log(`\n${colors.cyan}📊 Git-like Diff for ${name}:${colors.reset}`);
            const diff = generateSimpleDiff(oldContent, content);
            console.log(diff.split("\n").slice(0, 100).join("\n"));
            if (diff.split("\n").length > 100) {
                console.log(`${colors.gray}... (diff truncated)${colors.reset}`);
            }
        }
    }

    fs.writeFileSync(full, content, "utf8");

    console.log("📁 CREATED:", full);

    runtime.toolCalls++;

    return full;
}