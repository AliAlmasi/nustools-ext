@echo off
setlocal ENABLEDELAYEDEXPANSION

echo ===============================
echo NUSTools Extension Builder Setup (From git clone)
echo ===============================
echo

:: -------- CONFIG --------
set REPO_URL=https://github.com/alialmasi/nustools-ext.git
set PROJECT_DIR=%USERPROFILE%\nustools-ext
:: ------------------------

:: Check for admin
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Run this file as Administrator. Yes, actually.
    pause
    exit /b 1
)

:: ---------- GIT ----------
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Git...
    powershell -Command ^
      "Invoke-WebRequest -Uri https://github.com/git-for-windows/git/releases/latest/download/Git-64-bit.exe -OutFile git.exe"
    start /wait git.exe /VERYSILENT /NORESTART
    del git.exe
) else (
    echo Git already installed. Skipping.
)

:: ---------- NODE / NPM ----------
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Node.js (includes npm)...
    powershell -Command ^
      "Invoke-WebRequest -Uri https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi -OutFile node.msi"
    start /wait msiexec /i node.msi /qn /norestart
    del node.msi
) else (
    echo Node.js already installed. Skipping.
)

:: Refresh PATH (Windows is bad at this)
set PATH=%PATH%;C:\Program Files\nodejs\
set PATH=%PATH%;C:\Program Files\Git\bin\

:: ---------- CLONE ----------
if not exist "%PROJECT_DIR%" (
    echo Cloning repository...
    git clone %REPO_URL% "%PROJECT_DIR%"
) else (
    echo Repo already exists. Skipping clone.
)

cd /d "%PROJECT_DIR%"

:: ---------- BUILD ----------
echo Installing dependencies...
call npm install

echo Building project...
call npm run build

echo ===============================
echo Done. If this failed, Windows did Windows things.
echo ===============================
pause
