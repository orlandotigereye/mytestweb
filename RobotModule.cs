using System;
using System.Threading;
using log4net;

namespace GlassDetection
{
    /// <summary>
    /// 機器人高階模組：封裝連線、安全移動、IO、吸取、放置
    /// 內建到位確認、急停監控、log4net 記錄
    /// </summary>
    public class RobotModule : IDisposable
    {
        private static readonly ILog s_logger = LogManager.GetLogger(typeof(RobotModule));
        private readonly EsponRobotControl _robot;
        private readonly DAQIOCtrl _io;
        private readonly PositionManager _positions;
        private SafetyMonitor _safety;
        private bool _isDisposed = false;

        // 可調參數
        public int VacuumWaitMs { get; set; } = 800;
        public int BlowTimeMs { get; set; } = 200;
        public int CloseVacuumDelayMs { get; set; } = 50;
        public double PositionTolerance { get; set; } = 0.5;
        public int MoveTimeoutMs { get; set; } = 30000;
        public int VacuumTimeoutMs { get; set; } = 3000;

        public bool IsEStopOn => _safety?.IsEStopOn ?? false;
        public bool IsConnected => _robot?.IsConnected ?? false;

        public RobotModule()
        {
            _robot = new EsponRobotControl();
            _io = new DAQIOCtrl();
            _positions = new PositionManager();
        }

        // ==================== 初始化 ====================
        public bool Initialize(string robotIp, int robotPort)
        {
            s_logger.Info($"[初始化] 連線機器人 {robotIp}:{robotPort}");
            if (_robot.Connect(robotIp, robotPort) != State.STATE_OK)
            {
                s_logger.Error("[初始化] 機器人連線失敗");
                return false;
            }
            if (_io.Connect() != State.STATE_OK)
            {
                s_logger.Error("[初始化] IO 連線失敗");
                return false;
            }

            _safety = new SafetyMonitor(_robot, _io);
            _safety.EStopTriggered += OnEStopTriggered;
            _safety.VacuumLost += OnVacuumLost;
            _safety.ZoneViolation += OnZoneViolation;
            _safety.Start();

            s_logger.Info("[初始化] 連線成功，安全監控已啟動");
            return true;
        }

        public bool LoginAndServoOn()
        {
            s_logger.Info("[初始化] Login...");
            if (_robot.Login() != State.STATE_OK) return Fail("Login");
            Thread.Sleep(500);
            if (_robot.Reset() != State.STATE_OK) return Fail("Reset");
            Thread.Sleep(2000);
            if (_robot.ServoOn() != State.STATE_OK) return Fail("ServoOn");
            Thread.Sleep(1000);
            if (_robot.PowerHigh() != State.STATE_OK) return Fail("PowerHigh");
            Thread.Sleep(500);
            s_logger.Info("[初始化] 機器人就緒");
            return true;
        }

        public void SetSpeed(int ptpSpeed, int linearSpeed, int acc = 20, int dec = 20, int lineAcc = 1400, int lineDec = 1400)
        {
            s_logger.Info($"[速度] PTP={ptpSpeed}, Line={linearSpeed}, Acc=({acc},{dec}), LineAcc=({lineAcc},{lineDec})");
            _robot.Speed(ptpSpeed); Thread.Sleep(200);
            _robot.LineSpeed(linearSpeed); Thread.Sleep(200);
            _robot.Accel(acc, dec); Thread.Sleep(200);
            _robot.AccelS(lineAcc, lineDec); Thread.Sleep(200);
        }

        // ==================== 點位管理 ====================
        public void LoadPositions(string iniPath)
        {
            s_logger.Info($"[點位] 載入 {iniPath}");
            _positions.LoadFromIni(iniPath);
            s_logger.Info("[點位] 載入完成");
        }
        public void AddPosition(string name, RobotPosition pos, double workZ = -9999) => _positions.Add(name, pos, workZ);

        // ==================== 安全移動 ====================
        public bool GoSafe(string posName, int? timeoutMs = null)
        {
            if (IsEStopOn) return Fail("急停中，禁止移動！");
            var pos = _positions.Get(posName);
            s_logger.Info($"[移動] 開始 → {posName} ({pos})");
            if (_robot.MoveByCoordinate(pos) != State.STATE_OK)
                return Fail($"發送移動命令失敗: {posName}");
            int timeout = timeoutMs ?? MoveTimeoutMs;
            if (!WaitArrival(pos, timeout))
                return Fail($"移動逾時 ({timeout}ms): {posName}");
            s_logger.Info($"[移動] 到位 ✓ {posName}");
            return true;
        }

        public bool MoveZSafe(double z, int? timeoutMs = null)
        {
            if (IsEStopOn) return Fail("急停中，禁止移動！");
            var cur = new RobotPosition();
            if (_robot.GetCurrentPosition(ref cur) != State.STATE_OK)
                return Fail("無法取得目前位置");
            cur.Z = z;
            s_logger.Info($"[移動Z] 目標 Z={z:F1}");
            if (_robot.MoveByCoordinate(cur) != State.STATE_OK)
                return Fail("發送 Z 移動命令失敗");
            int timeout = timeoutMs ?? MoveTimeoutMs;
            if (!WaitArrival(cur, timeout))
                return Fail($"Z 移動逾時 ({timeout}ms)");
            s_logger.Info($"[移動Z] 到位 ✓ Z={z:F1}");
            return true;
        }

        public bool GoTeachPointSafe(string label, int? timeoutMs = null)
        {
            if (IsEStopOn) return Fail("急停中，禁止移動！");
            s_logger.Info($"[移動] 教導點 → {label}");
            if (_robot.P2PMove(label) != State.STATE_OK)
                return Fail($"發送 P2P 命令失敗: {label}");
            int timeout = timeoutMs ?? MoveTimeoutMs;
            if (!WaitMotionComplete(timeout))
                return Fail($"P2P 移動逾時 ({timeout}ms): {label}");
            s_logger.Info($"[移動] 教導點到位 ✓ {label}");
            return true;
        }

        // ==================== 高階組合動作 ====================
        public bool PickSafe(string posName, double? workZ = null)
        {
            if (IsEStopOn) return Fail("急停中，禁止吸取！");
            double targetZ = workZ ?? (_positions.HasWorkZ(posName) ? _positions.GetWorkZ(posName) : _positions.Get(posName).Z);
            var safe = _positions.Get(posName);
            s_logger.Info($"[吸取] 開始 → {posName}, 工作高度 Z={targetZ:F1}");
            if (!GoSafe(posName)) return Fail($"移動到 {posName} 失敗");
            if (!MoveZSafe(targetZ)) return Fail("下降到工作高度失敗");
            bool vacNow = false;
            _io.GetVacuumEstablished(ref vacNow);
            if (vacNow)
            {
                s_logger.Warn("[吸取] 警告：吸取前真空已為 ON，強制關閉後重開");
                _io.CloseVacuumPad();
                Thread.Sleep(100);
            }
            if (_io.OpenVacuumPad() != State.STATE_OK) return Fail("開真空失敗");
            s_logger.Info("[吸取] 真空已開啟，等待穩定...");
            Thread.Sleep(VacuumWaitMs);
            if (!WaitVacuum(VacuumTimeoutMs)) return Fail("真空建立逾時");
            if (!MoveZSafe(safe.Z)) return Fail("上升回安全高度失敗");
            s_logger.Info($"[吸取] 完成 ✓ {posName}");
            return true;
        }

        public bool PlaceSafe(string posName, double? workZ = null)
        {
            if (IsEStopOn) return Fail("急停中，禁止放置！");
            double targetZ = workZ ?? (_positions.HasWorkZ(posName) ? _positions.GetWorkZ(posName) : _positions.Get(posName).Z);
            var safe = _positions.Get(posName);
            s_logger.Info($"[放置] 開始 → {posName}, 工作高度 Z={targetZ:F1}");
            if (!GoSafe(posName)) return Fail($"移動到 {posName} 失敗");
            if (!MoveZSafe(targetZ)) return Fail("下降到工作高度失敗");
            bool vacNow = false;
            _io.GetVacuumEstablished(ref vacNow);
            if (!vacNow)
                s_logger.Warn("[放置] 警告：放置前真空未建立，可能掉片！");
            if (_io.CloseVacuumPad() != State.STATE_OK) return Fail("關真空失敗");
            Thread.Sleep(CloseVacuumDelayMs);
            if (_io.OpenBlow() != State.STATE_OK) return Fail("開吹氣失敗");
            Thread.Sleep(BlowTimeMs);
            if (_io.CloseBlow() != State.STATE_OK) return Fail("關吹氣失敗");
            if (!MoveZSafe(safe.Z)) return Fail("上升回安全高度失敗");
            s_logger.Info($"[放置] 完成 ✓ {posName}");
            return true;
        }

        // ==================== IO 控制 ====================
        public bool VacuumOn() => _io.OpenVacuumPad() == State.STATE_OK;
        public bool VacuumOff() => _io.CloseVacuumPad() == State.STATE_OK;
        public bool BlowOn() => _io.OpenBlow() == State.STATE_OK;
        public bool BlowOff() => _io.CloseBlow() == State.STATE_OK;

        // ==================== 感測器等待 ====================
        public bool WaitVacuum(int timeoutMs)
        {
            bool ok = false;
            for (int t = 0; t < timeoutMs; t += 100)
            {
                if (IsEStopOn) return Fail("急停中，取消等待真空");
                _io.GetVacuumEstablished(ref ok);
                if (ok) { s_logger.Debug("[真空] 建立成功"); return true; }
                Thread.Sleep(100);
            }
            s_logger.Error($"[真空] 建立逾時 ({timeoutMs}ms)");
            return false;
        }

        public bool WaitGlassArrived(int sideIndex, int timeoutMs = 5000)
        {
            bool[] sig = new bool[3];
            for (int t = 0; t < timeoutMs; t += 100)
            {
                _io.GetGlassArrivalSensorSignal(ref sig);
                if (sig[sideIndex]) { s_logger.Info($"[感測器] 玻璃到達 sideIndex={sideIndex}"); return true; }
                Thread.Sleep(100);
            }
            s_logger.Warn($"[感測器] 等待玻璃到達逾時 sideIndex={sideIndex}");
            return false;
        }

        // ==================== 內部工具 ====================
        private bool WaitArrival(RobotPosition target, int timeoutMs)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            while (sw.ElapsedMilliseconds < timeoutMs)
            {
                if (IsEStopOn) return false;
                var cur = new RobotPosition();
                if (_robot.GetCurrentPosition(ref cur) == State.STATE_OK)
                    if (IsPositionMatch(cur, target, PositionTolerance)) return true;
                Thread.Sleep(50);
            }
            return false;
        }

        private bool WaitMotionComplete(int timeoutMs)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            RobotPosition lastPos = null;
            int stableCount = 0;
            while (sw.ElapsedMilliseconds < timeoutMs)
            {
                if (IsEStopOn) return false;
                var cur = new RobotPosition();
                if (_robot.GetCurrentPosition(ref cur) == State.STATE_OK)
                {
                    if (lastPos != null && IsPositionMatch(cur, lastPos, 0.01))
                    { stableCount++; if (stableCount > 10) return true; }
                    else stableCount = 0;
                    lastPos = cur;
                }
                Thread.Sleep(50);
            }
            return false;
        }

        private bool IsPositionMatch(RobotPosition a, RobotPosition b, double tolerance)
        {
            return Math.Abs(a.X - b.X) < tolerance && Math.Abs(a.Y - b.Y) < tolerance &&
                   Math.Abs(a.Z - b.Z) < tolerance && Math.Abs(a.U - b.U) < tolerance &&
                   Math.Abs(a.V - b.V) < tolerance && Math.Abs(a.W - b.W) < tolerance;
        }

        // ==================== 安全事件處理 ====================
        private void OnEStopTriggered(object sender, EStopEventArgs e)
        {
            if (e.IsPressed) s_logger.Fatal("[安全] 急停觸發！所有動作立即停止！");
        }
        private void OnVacuumLost(object sender, VacuumLostEventArgs e)
        {
            s_logger.Fatal("[安全] 真空流失警報！可能掉片！");
        }
        private void OnZoneViolation(object sender, ZoneViolationEventArgs e)
        {
            s_logger.Fatal($"[安全] 區域違規：{e.Message}");
        }

        // ==================== 公用 ====================
        public void Wait(int ms) { if (ms > 0) Thread.Sleep(ms); }
        private bool Fail(string msg) { s_logger.Error("[失敗] " + msg); return false; }

        public void Dispose()
        {
            if (_isDisposed) return;
            _isDisposed = true;
            s_logger.Info("[結束] 關閉機器人連線...");
            _safety?.Dispose();
            try { _robot.ServoOff(); Thread.Sleep(1000); } catch { }
            try { _robot.Reset(); Thread.Sleep(1000); } catch { }
            try { _robot.Logout(); } catch { }
            try { _robot.DisConnect(); } catch { }
            try { _io.Disconnect(); } catch { }
            s_logger.Info("[結束] 連線已關閉");
        }
    }
}