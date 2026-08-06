using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Reflection;
using System.Runtime.InteropServices;
using Automation.BDaq;
using static System.Windows.Forms.AxHost;

namespace GlassDetection
{
    /// <summary>
    /// DAQ IO 控制類別（已修正為 public，供 RobotModule 使用）
    /// </summary>
    public class DAQIOCtrl
    {
        private readonly string  _deviceDescription = "PCIE-1756,BID#0";
        private readonly string _profilePath = "./PCIE-1756.xml"; 
        private ErrorCode _errorCode = ErrorCode.Success;
        private byte[] _writeBuffer = new byte[64];
        private byte[] _readBuffer = new byte[64];
        private bool _isConnect = false;

        InstantDoCtrl _instantDoCtrl = new InstantDoCtrl();
        InstantDiCtrl _instantDiCtrl = new InstantDiCtrl();

        public int Connect()
        {
            try
            {
#if Virtual_IO
#else
                _instantDoCtrl.SelectedDevice = new DeviceInformation(_deviceDescription);
                _errorCode = _instantDoCtrl.LoadProfile(_profilePath);
                if (BioFailed(_errorCode))
                {
                    return State.STATE_E_FAIL;
                }

                _instantDiCtrl.SelectedDevice = new DeviceInformation(_deviceDescription);
                _errorCode = _instantDiCtrl.LoadProfile(_profilePath);
                if (BioFailed(_errorCode))
                {
                    return State.STATE_E_FAIL;
                }
#endif
                _isConnect = true;
                InitializePortState();
            }
            catch (Exception e)
            {
                return State.STATE_E_FAIL;
            }

            return State.STATE_OK;
        }

        private int InitializePortState() 
        {
#if Virtual_IO
#else
            if (_isConnect)
            {
                _errorCode = _instantDoCtrl.Read(0, 2, _writeBuffer);
                if (BioFailed(_errorCode))
                {
                    return State.STATE_E_FAIL;
                }

                _errorCode = _instantDiCtrl.Read(0, 2, _readBuffer);
                if (BioFailed(_errorCode))
                {
                    return State.STATE_E_FAIL;
                }
            }
#endif
            return State.STATE_OK;
        }

        #region "Output"
        public int OpenVacuumPad()  
        {
            int port = 0;
            int state = _writeBuffer[port];
#if Virtual_IO
#else
            if (_isConnect)
            {                
                state |= SystemSetting.Address_Open_Vaccum;
                _errorCode = _instantDoCtrl.Write(port, (byte)state);

                if (BioFailed(_errorCode))
                {
                    return State.STATE_E_FAIL;
                }

                _writeBuffer[port] = (byte)state;
            }
#endif
            return State.STATE_OK;
        }

        public int CloseVacuumPad() 
        {
            int port = 0;
            int state = _writeBuffer[port];
#if Virtual_IO
#else
            if (_isConnect)
            {               
                state &= SystemSetting.Address_Cancel_Open_Vaccum;
                _errorCode = _instantDoCtrl.Write(port, (byte)state);

                if (BioFailed(_errorCode))
                {
                    return State.STATE_E_FAIL;
                }
                _writeBuffer[port] = (byte)state;
            }
#endif
            return State.STATE_OK;
        }

        public int OpenBlow()
        {
            int port = 0;
            int state = _writeBuffer[port];
#if Virtual_IO
#else
            if (_isConnect)
            {
                state |= SystemSetting.Address_Open_Blow;
                _errorCode = _instantDoCtrl.Write(port, (byte)state);

                if (BioFailed(_errorCode))
                {
                    return State.STATE_E_FAIL;
                }
                _writeBuffer[port] = (byte)state;
            }
#endif
            return State.STATE_OK;
        }

        public int CloseBlow()
        {
            int port = 0;
            int state = _writeBuffer[port];
#if Virtual_IO
#else
            if (_isConnect)
            {
                state &= SystemSetting.Address_Cancel_Open_Blow;
                _errorCode = _instantDoCtrl.Write(port, (byte)state);

                if (BioFailed(_errorCode))
                {
                    return State.STATE_E_FAIL;
                }
                _writeBuffer[port] = (byte)state;
            }
#endif
            return State.STATE_OK;
        }

        public int SetRunningLight(bool isTurnOn)
        {
            int port = 0;
            int state = _writeBuffer[port];
#if Virtual_IO
#else
            if (_isConnect)
            {
                if (isTurnOn == true)
                {
                    state |= SystemSetting.Address_Turn_On_Green_Light;
                }
                else
                {
                    state &= SystemSetting.Address_Turn_Off_Green_Light;
                }

                _errorCode = _instantDoCtrl.Write(port, (byte)state);

                if (BioFailed(_errorCode))
                {
                    return State.STATE_E_FAIL;
                }
                _writeBuffer[port] = (byte)state;
            }
#endif
            return State.STATE_OK;
        }    

        public int SetIdleLight(bool isTurnOn)
        {
            int port = 0;
            int state = _writeBuffer[port];
#if Virtual_IO
#else
            if (_isConnect)
            {
                if (isTurnOn == true)
                {
                    state |= SystemSetting.Address_Turn_On_Yellow_Light;
                }
                else
                {
                    state &= SystemSetting.Address_Turn_Off_Yellow_Light;
                }

                _errorCode = _instantDoCtrl.Write(port, (byte)state);

                if (BioFailed(_errorCode))
                {
                    return State.STATE_E_FAIL;
                }
                _writeBuffer[port] = (byte)state;
            }
#endif
            return State.STATE_OK;
        }

        public int SetWarnningLight(bool isTurnOn)
        {
            int port = 0;
            int state = _writeBuffer[port];
#if Virtual_IO
#else
            if (_isConnect)
            {
                if (isTurnOn == true)
                {
                    state |= SystemSetting.Address_Turn_On_Red_Light;
                }
                else
                {
                    state &= SystemSetting.Address_Turn_Off_Red_Light;
                }

                _errorCode = _instantDoCtrl.Write(port, (byte)state);

                if (BioFailed(_errorCode))
                {
                    return State.STATE_E_FAIL;
                }
                _writeBuffer[port] = (byte)state;
            }
#endif
            return State.STATE_OK;
        }
        #endregion

        #region "Input"
        public int GetAllowDischargeSignal(ref bool[] iResult) 
        {
#if Virtual_IO
            iResult[0] = true;
            iResult[1] = false;
            return State.STATE_OK;
#else
            if (_isConnect)
            {
                _errorCode = _instantDiCtrl.Read(0, 2, _readBuffer);

                if (BioFailed(_errorCode))
                {
                    return State.STATE_E_FAIL;
                }
                if ((_readBuffer[0] & SystemSetting.Address_Allow_P1_Conveyor_Discharge) > 0)
                {
                    iResult[0] = true;
                }
                if ((_readBuffer[0] & SystemSetting.Address_Allow_P2_Conveyor_Discharge) > 0)
                {
                    iResult[1] = true;
                }
                if ((_readBuffer[0] & SystemSetting.Address_Allow_P3_Conveyor_Discharge) > 0)
                {
                    iResult[2] = true;
                }

                return State.STATE_OK;
            }
#endif
            return State.STATE_E_NOT_CONNECTED;
        }

        public int GetGlassArrivalSensorSignal(ref bool[] iResult)
        {
#if Virtual_IO
            iResult[0] = true;
            iResult[1] = false;
            return State.STATE_OK;
#else     
            if (_isConnect)
            {            
                _errorCode = _instantDiCtrl.Read(0, 2, _readBuffer);

                if (BioFailed(_errorCode))
                {
                    return State.STATE_E_FAIL;
                }
                if ((_readBuffer[0] & SystemSetting.Address_Left_Glass_Arrival) > 0)
                {
                    iResult[0] = true;
                }
                if ((_readBuffer[0] & SystemSetting.Address_Middle_Glass_Arrival) > 0)
                {
                    iResult[1] = true;
                }
                if ((_readBuffer[0] & SystemSetting.Address_Right_Glass_Arrival) > 0) 
                {
                    iResult[2] = true;
                }

                return State.STATE_OK;
            }
#endif
            return State.STATE_E_NOT_CONNECTED;
        }

        public int GetVacuumEstablished(ref bool iResult)
        {
#if Virtual_IO    
            iResult = true;
            return State.STATE_OK;
#else
            if (_isConnect)
            {
                _errorCode = _instantDiCtrl.Read(0, 2, _readBuffer);

                if (BioFailed(_errorCode))
                {
                    return State.STATE_E_FAIL;
                }               
                if ((_readBuffer[0] & SystemSetting.Address_Vacuum_Established) > 0)
                {
                    iResult = true;
                }

                return State.STATE_OK;
            }
#endif
            return State.STATE_E_NOT_CONNECTED;
        }
        #endregion

        public void Disconnect() 
        {
#if Virtual_IO
#else
            _instantDiCtrl.Dispose();
            _instantDoCtrl.Dispose();
#endif
        }

        private bool BioFailed(ErrorCode err)
        {
            if (err != ErrorCode.Success) { return true; }
            return false;
        }
    }
}
