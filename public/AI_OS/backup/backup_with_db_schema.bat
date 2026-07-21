@echo off
setlocal enabledelayedexpansion

:: ============================================================
:: te-cliA One-Click Backup Script v1.2
:: Timestamp-based naming, excludes node_modules and junk files
:: ============================================================

:: --- Settings ---
set "SOURCE_DIR=%~dp0"
set "BACKUP_ROOT=C:\tmp2\web\25060301\AI\te-cliA-backups"

:: Generate timestamp using WMIC (locale-independent)
for /f "tokens=2 delims==." %%a in ('wmic os get localdatetime /value') do set "RAWDT=%%a"
set "TIMESTAMP=!RAWDT:~0,8!_!RAWDT:~8,6!"
set "BACKUP_DIR=%BACKUP_ROOT%\te-cliA_backup_!TIMESTAMP!"

:: --- Create backup directory ---
if not exist "%BACKUP_ROOT%" mkdir "%BACKUP_ROOT%"
mkdir "%BACKUP_DIR%"

echo.
echo ============================================
echo    te-cliA One-Click Backup Script v1.2
echo ============================================
echo.
echo Source: %SOURCE_DIR%
echo Target: %BACKUP_DIR%
echo Time:   %date% %time%
echo.

:: --- Required directories ---
echo [1/3] Backing up core directories...
xcopy /E /I /H /Y "%SOURCE_DIR%commands"     "%BACKUP_DIR%\commands"     >nul 2>&1
xcopy /E /I /H /Y "%SOURCE_DIR%db_schema"   "%BACKUP_DIR%\db_schema"   >nul 2>&1
xcopy /E /I /H /Y "%SOURCE_DIR%config"       "%BACKUP_DIR%\config"       >nul 2>&1
xcopy /E /I /H /Y "%SOURCE_DIR%core"          "%BACKUP_DIR%\core"          >nul 2>&1
xcopy /E /I /H /Y "%SOURCE_DIR%lib"            "%BACKUP_DIR%\lib"            >nul 2>&1
xcopy /E /I /H /Y "%SOURCE_DIR%logs"          "%BACKUP_DIR%\logs"          >nul 2>&1
xcopy /E /I /H /Y "%SOURCE_DIR%memory"        "%BACKUP_DIR%\memory"        >nul 2>&1
xcopy /E /I /H /Y "%SOURCE_DIR%Proj"          "%BACKUP_DIR%\Proj"          >nul 2>&1

:: --- Root files ---
echo [2/3] Backing up root files...
copy /Y "%SOURCE_DIR%teZ.js"          "%BACKUP_DIR%\teZ.js"          >nul 2>&1
copy /Y "%SOURCE_DIR%logger.js"         "%BACKUP_DIR%\logger.js"         >nul 2>&1
copy /Y "%SOURCE_DIR%package.json"      "%BACKUP_DIR%\package.json"      >nul 2>&1
copy /Y "%SOURCE_DIR%package-lock.json" "%BACKUP_DIR%\package-lock.json" >nul 2>&1
copy /Y "%SOURCE_DIR%version.json"      "%BACKUP_DIR%\version.json"      >nul 2>&1
copy /Y "%SOURCE_DIR%start.bat"         "%BACKUP_DIR%\start.bat"         >nul 2>&1

:: --- Optional directories (if exist) ---
echo [3/3] Backing up optional data...
if exist "%SOURCE_DIR%backup"     xcopy /E /I /H /Y "%SOURCE_DIR%backup"     "%BACKUP_DIR%\backup"     >nul 2>&1
if exist "%SOURCE_DIR%Exports"   xcopy /E /I /H /Y "%SOURCE_DIR%Exports"   "%BACKUP_DIR%\Exports"   >nul 2>&1
if exist "%SOURCE_DIR%Novels"    xcopy /E /I /H /Y "%SOURCE_DIR%Novels"    "%BACKUP_DIR%\Novels"    >nul 2>&1
if exist "%SOURCE_DIR%project"   xcopy /E /I /H /Y "%SOURCE_DIR%project"   "%BACKUP_DIR%\project"   >nul 2>&1
if exist "%SOURCE_DIR%tests"     xcopy /E /I /H /Y "%SOURCE_DIR%tests"     "%BACKUP_DIR%\tests"     >nul 2>&1
if exist "%SOURCE_DIR%workspace" xcopy /E /I /H /Y "%SOURCE_DIR%workspace" "%BACKUP_DIR%\workspace" >nul 2>&1

:: --- Excluded items report ---
echo.
echo ============================================
echo EXCLUDED (not backed up):
echo ============================================
echo   - node_modules/    (npm deps, can rebuild)
echo   - .netlify/        (deploy config, not needed)
echo   - comands/         (typo dir)
echo   - old/             (old version backups)
echo   - other/           (misc dir)
echo   - sop/             (SOP documents)
echo   - HelloWorld.java  (unrelated file)
echo   - teZ_bk*.js       (old backup files)
echo.

:: --- Statistics ---
echo ============================================
echo BACKUP COMPLETE!
echo ============================================
echo.

:: Count files
set "fileCount=0"
for /f %%a in ('dir /s /b "%BACKUP_DIR%" 2^>nul ^| find /c /v ""') do set "fileCount=%%a"

echo Stats:
echo   Backup Time: %date% %time%
echo   Backup Path: %BACKUP_DIR%
echo   File Count:  !fileCount!
echo.

:: --- List recent backups ---
echo Recent backups:
dir /b /o-d "%BACKUP_ROOT%" 2>nul

echo.
echo NOTE:
echo   To restore, copy backup contents back to source dir,
echo   then run: npm install
echo.
pause
