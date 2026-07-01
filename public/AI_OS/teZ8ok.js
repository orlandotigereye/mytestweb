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
    },

    retrieveSemantic(query, limit = 5) {
        return [...this.nodes.values()]
            .map(x => ({
                role: x.role,
                content: x.content,
                similarity: calculateSimilarity(query, x.content)
            }))
            .filter(x => x.similarity > 0.05)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit)
            .map(x => ({ role: x.role, content: x.content }));
    },

    retrieveSemanticCombined(query, limit = 10) {
        const semantic = this.retrieveSemantic(query, Math.floor(limit / 2));
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

    const messages = Memory.retrieveSemanticCombined(input);
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
// 🧠 HELPER FUNCTIONS FOR planA PIPELINE
// ======================================================
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

        const a = Memory.add("user", input);
        const b = Memory.add("assistant", output);
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
1. You MUST write the complete, full program code.
2. Do NOT use placeholders like "// ...", "/* ... */", "以此類推", "// 略", "// TODO", "and so on", or any skipped code comments.
3. Every single line of code, function, and configuration must be fully written out.`;

    const executorMessages = [
        { role: "system", content: "You are an expert software developer. You write clean, production-ready, complete code without any ellipsis, placeholders, or skipped sections." },
        { role: "user", content: execPrompt }
    ];
    let code = await getAIResponse(model, executorMessages, "Executor");

    // Step 3: Critic (mandatory)
    const criticPrompt = `Verify the following code generated by the Executor.
Identify any missing parts, bugs, or placeholders (like '// ...', '/* ... */', '以此類推', '// 略', '// TODO', 'and so on').
If the code is 100% complete, fully implemented, and correct, reply with ONLY the word "PASS".
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

IMPORTANT: Output the entire complete program. Do NOT omit any parts or use '// ...' or '以此類推'.`;

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

    // Automatically detect code blocks and write them to files in the Proj folder
    const codeBlockRegex = /```[a-zA-Z0-9]*\n([\s\S]*?)```/g;
    let match;
    let fileWrittenCount = 0;
    while ((match = codeBlockRegex.exec(code)) !== null) {
        const fileContent = match[1];
        let filename = "";
        const fileMatches = input.match(/(?:file|filename|檔案|檔名)[:\s]*([a-zA-Z0-9_\-\.]+)/i);
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

    const score = reward(code);
    runtime.lastInput = input;
    runtime.lastOutput = code;
    runtime.lastScore = score;

    const a = Memory.add("user", input);
    const b = Memory.add("assistant", code);
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
                        await streamFormattedOutput(runtime.lastOutput, runtime.lastScore);
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