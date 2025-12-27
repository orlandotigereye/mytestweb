<script>
window.Core = {
  loaded: false,
  modules: {},
  data: {},
  mark(name, status, err) {
    this.modules[name] = { status, err: err || null };
  },
  reset() {
    this.modules = {};
    this.data = {};
    this.loaded = false;
  }
};
</script>
