@echo off
title OperaViva - Compilazione Setup Windows
cd /d "%~dp0.."
echo ========================================================
echo   Compilazione del nuovo installer Windows (.exe)...
echo ========================================================
call npm run electron:build
if exist "release\OperaViva Setup 1.0.0.exe" (
    copy /y "release\OperaViva Setup 1.0.0.exe" "exe\OperaViva_Setup.exe"
    copy /y "release\OperaViva Setup 1.0.0.exe" "release\Windows_Setup\OperaViva_Setup.exe"
    del /f /q "release\OperaViva Setup 1.0.0.exe" >nul 2>&1
    del /f /q "release\OperaViva 1.0.0.exe" >nul 2>&1
    del /f /q "release\*.blockmap" >nul 2>&1
    del /f /q "release\*.yml" >nul 2>&1
    if exist "release\win-unpacked" rd /s /q "release\win-unpacked" >nul 2>&1
    echo.
    echo ========================================================
    echo   SUCCESSO: Nuovo OperaViva_Setup.exe pronto in:
    echo   - exe\OperaViva_Setup.exe
    echo   - release\Windows_Setup\OperaViva_Setup.exe
    echo ========================================================
) else (
    echo ERRORE durante la compilazione.
)
pause
