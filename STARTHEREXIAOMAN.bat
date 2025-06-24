@echo off
setlocal ENABLEDELAYEDEXPANSION

REM --- Path to main script ---
set "SCRIPT=download-from-cdn.js"

REM --- Path to the portable Node.js binary ---
set "NODE_PORTABLE=node-win\node.exe"

REM --- Check if Node.js is available in the system PATH ---
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Node.js detected on the system.
    node %SCRIPT%
    goto end
)

REM --- If not, check if the portable Node is available ---
if exist "%NODE_PORTABLE%" (
    echo ⚠️ Node.js is not installed. Using portable Node.js...
    "%NODE_PORTABLE%" %SCRIPT%
    goto end
)

REM --- If neither is available ---
echo ❌ Node.js not found on system or portable version missing.
echo 💡 Please install Node.js or ensure node-win\node.exe is available.
pause
:end
endlocal
