Function main
	'310
	Integer counter
	Power High
	Speed 70
	SpeedS 70
For counter = 1 To 3
	Wait 3
	Move PrinterToOV07 '24 輸送帶等待位
	Move OV07HoldPoint '25
    Move pickupposition '29    
    Move outPickupposition '7
	Move PlatformHoldPoint '30
	Move AligenFinishLocation '31
	Move AligenLocation '32
	Move PlatformHoldPoint '30
	Go upprinterOutHoldPoint '36 '一定要go 否則會卡住

	Go PrinterOutHoldPoint '35
	Go PrinterOutputLocation '5
	Go UpToPrinterOutLocation '4
	Move outUPtoPrinterOutLocation '6
	Move UpToPrinterOutLocation '4
	Move PrinterOutHoldPoint '35
	
	Move ToStore 'go to ok store '37

	Move outOV7Right_OK '56
	Move InOV7Right_ok '57
	Move outOV7Right_OK '56
	
	Move ToStore 'go to ok store '37
	Move upprinterOutHoldPoint '36
	Go toHold '38
	Go PrinterToOV07 '24 輸送帶等待位
  Next counter
	
	
Fend

