({
  id: "promptBuilder",
  name: "Prompt Builder",
  icon: "🎨",
  version: "1.0.0",

  /* =====================================================
   🧠 DATA SCHEMA
  ===================================================== */
  data: {
    createPrompt() {
      return {
        id: "",
        name: "",
        category: "Character",
        tags: [],
        characterId: "",
        worldId: "",
        storyId: "",

        positive: {
          quality: [],
          character: [],
          expression: [],
          pose: [],
          clothing: [],
          background: [],
          effects: []
        },

        negative: [],

        model: "PonyXL",

        lora: [],

        seed: 0,
        cfg: 7,
        steps: 30,
        width: 1024,
        height: 1536,

        referenceImages: [],
        generatedImages: [],

        notes: "",
        createdAt: "",
        updatedAt: ""
      };
    }
  },

  /* =====================================================
   🧰 UTILS
  ===================================================== */
  utils: {
    arr(str) {
      return Array.isArray(str) ? str : [];
    },

    csv(arr) {
      return Array.isArray(arr) ? arr.join(", ") : "";
    },

    csvToArr(str = "") {
      return str.split(",").map(s => s.trim()).filter(Boolean);
    },

    id() {
      return "prompt_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
    }
  },

  /* =====================================================
   💾 STORE
  ===================================================== */
  store: {
    get(core) {
      return core.storage.get("prompts", []);
    },

    save(core, data) {
      core.storage.set("prompts", data);
    },

    getCurrent(core) {
      return core.storage.get("currentPromptId", null);
    },

    setCurrent(core, id) {
      core.storage.set("currentPromptId", id);
    }
  },

  /* =====================================================
   🧠 SERVICE
  ===================================================== */
  service: {

    create(plugin, core) {
      const list = plugin.store.get(core);
      const p = plugin.data.createPrompt();

      p.id = plugin.utils.id();
      p.createdAt = new Date().toISOString();
      p.updatedAt = new Date().toISOString();

      list.push(p);

      plugin.store.save(core, list);
      plugin.store.setCurrent(core, p.id);

      core.toast("🎨 Prompt 已建立");
      core.open(plugin.id);
    },

    delete(plugin, core, id) {
      let list = plugin.store.get(core);
      list = list.filter(x => x.id !== id);

      plugin.store.save(core, list);

      const current = plugin.store.getCurrent(core);
      if (current === id) {
        plugin.store.setCurrent(core, list[0]?.id || null);
      }

      core.toast("🗑️ Prompt 已刪除");
      core.open(plugin.id);
    },

    update(plugin, core, id, field, value) {
      const list = plugin.store.get(core);
      const p = list.find(x => x.id === id);
      if (!p) return;

      p[field] = value;
      p.updatedAt = new Date().toISOString();

      plugin.store.save(core, list);
    }
  },

  /* =====================================================
   🖼 UI
  ===================================================== */
  render(core) {
    const list = this.store.get(core);
    const current = this.store.getCurrent(core);
    const active = list.find(x => x.id === current);

    return `
      <style>
        .card{padding:12px;border:1px solid #ddd;margin:10px 0;border-radius:6px}
        input,textarea,select{width:100%;padding:6px;margin:4px 0}
        button{margin:4px;padding:6px 10px}
      </style>

      <h2>🎨 Prompt Builder</h2>

      <div class="card">
        <select id="list">
          <option value="">-- 選擇 Prompt --</option>
          ${list.map(x =>
            `<option value="${x.id}" ${x.id===current?'selected':''}>
              ${x.name || x.id}
            </option>`
          ).join("")}
        </select>

        <button id="new">➕ 新 Prompt</button>
      </div>

      ${
        active ? `
        <div class="card">

          <input id="name" value="${active.name}" placeholder="名稱">
          <input id="category" value="${active.category}" placeholder="類別">

          <textarea id="tags">${(active.tags||[]).join(",")}</textarea>

          <h4>Positive</h4>
          <textarea id="pos_quality">${(active.positive?.quality||[]).join(",")}</textarea>
          <textarea id="pos_character">${(active.positive?.character||[]).join(",")}</textarea>
          <textarea id="pos_expression">${(active.positive?.expression||[]).join(",")}</textarea>
          <textarea id="pos_pose">${(active.positive?.pose||[]).join(",")}</textarea>
          <textarea id="pos_clothing">${(active.positive?.clothing||[]).join(",")}</textarea>
          <textarea id="pos_background">${(active.positive?.background||[]).join(",")}</textarea>
          <textarea id="pos_effects">${(active.positive?.effects||[]).join(",")}</textarea>

          <h4>Negative</h4>
          <textarea id="negative">${(active.negative||[]).join(",")}</textarea>

          <h4>Model</h4>
          <input id="model" value="${active.model}">

          <h4>Params</h4>
          <input id="seed" value="${active.seed}">
          <input id="cfg" value="${active.cfg}">
          <input id="steps" value="${active.steps}">
          <input id="width" value="${active.width}">
          <input id="height" value="${active.height}">

          <button id="del">🗑️ 刪除</button>
        </div>
        ` : `<p>請選擇 Prompt</p>`
      }
    `;
  },

  /* =====================================================
   ⚙️ EVENTS
  ===================================================== */
  onOpen(core) {
    const p = this;
    const current = p.store.getCurrent(core);

    document.getElementById("list")?.addEventListener("change", e => {
      p.store.setCurrent(core, e.target.value);
      core.open(p.id);
    });

    document.getElementById("new")?.addEventListener("click", () => {
      p.service.create(p, core);
    });

    if (!current) return;

    const bind = (id, field, parser) => {
      document.getElementById(id)?.addEventListener("input", e => {
        p.service.update(
          p,
          core,
          current,
          field,
          parser ? parser(e.target.value) : e.target.value
        );
      });
    };

    bind("name", "name");
    bind("category", "category");
    bind("tags", "tags", v => v.split(",").map(s=>s.trim()));

    bind("pos_quality", "positive", v=>({ ...p.store.get(core).find(x=>x.id===current).positive, quality:v.split(",") }));
    bind("pos_character", "positive", v=>({ ...p.store.get(core).find(x=>x.id===current).positive, character:v.split(",") }));
    bind("pos_expression", "positive", v=>({ ...p.store.get(core).find(x=>x.id===current).positive, expression:v.split(",") }));
    bind("pos_pose", "positive", v=>({ ...p.store.get(core).find(x=>x.id===current).positive, pose:v.split(",") }));
    bind("pos_clothing", "positive", v=>({ ...p.store.get(core).find(x=>x.id===current).positive, clothing:v.split(",") }));
    bind("pos_background", "positive", v=>({ ...p.store.get(core).find(x=>x.id===current).positive, background:v.split(",") }));
    bind("pos_effects", "positive", v=>({ ...p.store.get(core).find(x=>x.id===current).positive, effects:v.split(",") }));

    bind("negative", "negative", v=>v.split(","));

    bind("model", "model");
    bind("seed", "seed", Number);
    bind("cfg", "cfg", Number);
    bind("steps", "steps", Number);
    bind("width", "width", Number);
    bind("height", "height", Number);

    document.getElementById("del")?.addEventListener("click", () => {
      p.service.delete(p, core, current);
    });
  },

  /* =====================================================
   🚀 INIT
  ===================================================== */
  init(core) {
    if (!core.storage.get("prompts")) {
      core.storage.set("prompts", []);
    }
    if (!core.storage.get("currentPromptId")) {
      core.storage.set("currentPromptId", null);
    }
  }
})