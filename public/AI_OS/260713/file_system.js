/**
 * External Dependencies:
 * - pdf-parse: ^1.1.1
 * - xlsx: ^0.18.5
 */

const fs = require("fs");
const path = require("path");

/* 
<div style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 15px; border-radius: 8px; font-size: 0.5rem; color: #333; text-align: center;">
    <button style="background: white; border: 1px solid #ccc; padding: 5px; cursor: pointer; font-size: 0.5rem;" onclick="downloadCode('FileSystemManager.js', document.querySelector('pre').innerText)">下載程式碼</button>
</div>
<script>
function downloadCode(filename, content) {
    const blob = new Blob([content], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
</script>
*/

class FileSystemManager {
    constructor(config, version, colors, ui) {
        this.config = config;
        this.version = version;
        this.colors = colors;
        this.ui = ui;
    }

    /**
     * 強制取得 Proj 目錄路徑，所有檔案操作均在此目錄內進行
     */
    _getProjDir() {
        const dir = path.join(this.config.ROOT, "Proj");
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        return dir;
    }

    /**
     * 安全性檢測：確保路徑一定在 Proj 目錄下
     */
    isPathSafe(filePath) {
        try {
            const projDir = path.resolve(this._getProjDir());
            const resolvedPath = path.resolve(filePath);
            const relative = path.relative(projDir, resolvedPath);
            return relative && !relative.startsWith("..") && !path.isAbsolute(relative);
        } catch (e) {
            return false;
        }
    }

    readDocument(filePath) {
        const fullPath = path.resolve(this._getProjDir(), filePath);
        if (!this.isPathSafe(fullPath)) return "Access Denied: Sandbox Security Violation.";
        
        const ext = path.extname(fullPath).toLowerCase();
        if ([".pdf", ".xlsx", ".docx"].includes(ext)) {
            return `[DOCUMENT_FILE: ${fullPath}] (Binary format detected.)`;
        }
        
        return fs.readFileSync(fullPath, "utf8");
    }

    async analyzeDocument(filePath, ai) {
        const fullPath = path.resolve(this._getProjDir(), filePath);
        const ext = path.extname(fullPath).toLowerCase();
        
        console.log(`${this.colors.yellow}🔍 Extracting content from ${ext.toUpperCase()}: ${path.basename(fullPath)}...${this.colors.reset}`);
        
        try {
            let extractedText = "";
            const dataBuffer = fs.readFileSync(fullPath);

            if (ext === ".pdf") {
                const pdf = require("pdf-parse");
                const data = await pdf(dataBuffer);
                extractedText = data.text;
            } else if ([".xlsx", ".xls"].includes(ext)) {
                const xlsx = require("xlsx");
                const workbook = xlsx.read(dataBuffer, { type: "buffer" });
                workbook.SheetNames.forEach(name => {
                    const sheet = workbook.Sheets[name];
                    extractedText += `\n--- Sheet: ${name} ---\n` + xlsx.utils.sheet_to_txt(sheet);
                });
            } else {
                extractedText = fs.readFileSync(fullPath, "utf8");
            }

            this.ui.updateStatus("AI Analyzing Document Context...", 50);
            const summary = await ai.summarizeContent(extractedText.substring(0, 30000), this.config.MODEL_FAST);
            
            return `[EXTRACTED CONTENT FROM ${path.basename(fullPath)}]\n\nSummary:\n${summary}\n\nRaw Snippet (First 2000 chars):\n${extractedText.substring(0, 2000)}`;
        } catch (e) {
            console.error(`${this.colors.red}Document Parsing Error: ${e.message}${this.colors.reset}`);
            return `Failed to parse ${ext} file: ${e.message}`;
        }
    }

    read_file(filePath) {
        const fullPath = path.isAbsolute(filePath) ? filePath : path.join(this._getProjDir(), filePath);
        if (!this.isPathSafe(fullPath)) {
            throw new Error(`Permission Denied: File path is outside the Proj workspace: ${filePath}`);
        }
        try {
            const content = fs.readFileSync(fullPath, "utf8");
            const lines = content.split(/\r?\n/);
            if (lines.length > 3000) return lines.slice(0, 3000).join("\n") + "\n... (File truncated at 3000 lines) ...";
            return content;
        } catch (e) { throw new Error(`Failed to read file ${filePath}: ${e.message}`); }
    }

    readFolderRecursive(dirPath, relativeRoot = "") {
        const targetDir = dirPath || this._getProjDir();
        if (!this.isPathSafe(targetDir)) return [];
        
        let results = [];
        let files;
        try { files = fs.readdirSync(targetDir); } catch (e) { return []; }

        for (const file of files) {
            if (["node_modules", ".git", ".gemini", "memory", "backup", "output", "sessions", "temp", "cache"].includes(file)) continue;
            const fullPath = path.join(targetDir, file);
            const relPath = relativeRoot ? path.join(relativeRoot, file) : file;
            try {
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    results = results.concat(this.readFolderRecursive(fullPath, relPath));
                } else {
                    const ext = path.extname(file).toLowerCase();
                    if ([".js", ".json", ".txt", ".md", ".css", ".html", ".ts", ".jsx", ".tsx", ".mjs", ".cjs", ".py"].includes(ext)) {
                        results.push({ relPath, fullPath, content: this.read_file(fullPath) });
                    }
                }
            } catch(e) {}
        }
        return results;
    }

    detectFileType(content) {
        const text = (content || "").trim();
        if (/<!DOCTYPE html>/i.test(text) || /<html/i.test(text)) return "html";
        if (/^\s*<svg/i.test(text)) return "svg";
        if (/^\s*\{[\s\S]*\}\s*$/.test(text) || /^\s*\[[\s\S]*\]\s*$/.test(text)) return "json";
        if (text.includes("function ") || text.includes("=>") || text.includes("module.exports") || text.includes("const ") || text.includes("let ")) return "js";
        if (text.includes("body {") || text.includes("@media") || text.includes(":root")) return "css";
        if (text.startsWith("# ") || text.startsWith("## ") || text.startsWith("```")) return "md";
        return "txt";
    }

    writeSmartFile(content, filename = "") {
        const dir = this._getProjDir();
        let full;

        if (filename) {
            full = path.isAbsolute(filename) ? filename : path.join(dir, filename);
        } else {
            const ext = this.detectFileType(content);
            full = path.join(dir, `Proj_${this.version.current()}_${Date.now()}.${ext}`);
        }
        
        if (!this.isPathSafe(full)) {
            throw new Error(`Permission Denied: Cannot write file outside the Proj workspace: ${full}`);
        }

        const name = path.basename(full);
        const parentDir = path.dirname(full);
        if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });

        if (fs.existsSync(full) && this.config.AUTO_BACKUP) {
            const oldContent = fs.readFileSync(full, "utf8");
            if (oldContent !== content) {
                const backupDir = this.config.BACKUP_DIR || path.join(this.config.ROOT, "backup");
                if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
                const backupFile = path.join(backupDir, `${name}.${new Date().toISOString().replace(/[:.]/g, "-")}.bak`);
                fs.writeFileSync(backupFile, oldContent, "utf8");
                console.log(`${this.colors.yellow}📦 BACKUP CREATED:${this.colors.reset} ${backupFile}`);
                console.log(`\n${this.colors.cyan}📊 Git-like Diff for ${name}:${this.colors.reset}`);
                const diff = this.ui.generateSimpleDiff(oldContent, content);
                console.log(diff.split("\n").slice(0, 100).join("\n"));
            }
        }
        fs.writeFileSync(full, content, "utf8");
        console.log("📁 CREATED:", full);
        return full;
    }

    async detectAndLoadFiles(input, aiEngine) {
        if (typeof input !== "string") return input;
        const fileRegex = /(?:[a-zA-Z]:[\\/][^:\s]+|(?:\.?\.?[\\/])+[^:\s]+|[\w\-.]+\.(?:js|json|txt|md|css|html|ts|jsx|tsx|py|csv|log))/g;
        const matches = input.match(fileRegex);
        if (!matches) return input;
        
        let enrichedInput = input;
        const loadedFiles = new Set();
        
        for (const match of matches) {
            let cleanPath = match.replace(/["',;!?]/g, "").trim();
            if (!cleanPath || loadedFiles.has(cleanPath)) continue;
            
            // 強制定位在 Proj 目錄下尋找
            let absPath = path.isAbsolute(cleanPath) ? cleanPath : path.join(this._getProjDir(), cleanPath);
            
            if (!fs.existsSync(absPath)) {
                const tempProjPath = path.join(this._getProjDir(), path.basename(cleanPath));
                if (fs.existsSync(tempProjPath)) absPath = tempProjPath;
            }
            
            if (this.isPathSafe(absPath) && fs.existsSync(absPath) && fs.statSync(absPath).isFile()) {
                try {
                    const content = fs.readFileSync(absPath, "utf8");
                    loadedFiles.add(cleanPath);
                    
                    let fileContent = content;
                    if (content.length > 20000 && aiEngine) {
                        console.log(`${this.colors.yellow}⚠️ File ${path.basename(absPath)} is large (${content.length} chars). Summarizing...${this.colors.reset}`);
                        const summary = await aiEngine.summarizeContent(content.substring(0, 30000), this.config.MODEL_FAST);
                        fileContent = `[SUMMARY of ${path.basename(absPath)}: ${summary}]`;
                    } else if (content.length > 20000) {
                        fileContent = content.substring(0, 20000) + "\n\n... (File truncated) ...";
                    }

                    enrichedInput = `[File Content of ${path.basename(absPath)}:\n\`\`\`\n${fileContent}\n\`\`\`]\n\n` + enrichedInput;
                    console.log(`\n${this.colors.green}ℹ️ Automatically loaded: ${path.basename(absPath)}${this.colors.reset}`);
                } catch (err) {}
            }
        }
        return enrichedInput;
    }

    applySearchReplaceBlocks(content) {
        const blocks = [];
        const blockRegex = /<<<<<<< SEARCH\r?\n([\s\S]*?)\r?\n=======\r?\n([\s\S]*?)\r?\n>>>>>>> REPLACE/g;
        let match;
        while ((match = blockRegex.exec(content)) !== null) {
            const searchContent = match[1], replaceContent = match[2];
            const beforeText = content.substring(Math.max(0, match.index - 300), match.index);
            const fileMatches = beforeText.match(/(?:file|filename|檔案|檔名)[:\s]*([a-zA-Z0-9_\-\.\/\\:]+)/i) || beforeText.match(/([a-zA-Z0-9_\-\.\/\\:]+\.[a-z0-9]+)/gi);
            blocks.push({ searchContent, replaceContent, filePath: fileMatches ? fileMatches[fileMatches.length - 1] : "" });
        }
        return blocks;
    }

    applyEdits(blocks) {
        let editCount = 0;
        for (const block of blocks) {
            if (!block.filePath) continue;
            const absPath = path.isAbsolute(block.filePath) ? block.filePath : path.join(this._getProjDir(), path.basename(block.filePath));

            if (this.isPathSafe(absPath) && fs.existsSync(absPath)) {
                const content = fs.readFileSync(absPath, "utf8").replace(/\r\n/g, "\n");
                const search = block.searchContent.replace(/\r\n/g, "\n");
                if (content.includes(search)) {
                    this.writeSmartFile(content.replace(search, block.replaceContent.replace(/\r\n/g, "\n")), absPath);
                    editCount++;
                }
            }
        }
        return editCount;
    }

    listAllFiles() {
        return this.readFolderRecursive(this._getProjDir());
    }
}

module.exports = FileSystemManager;