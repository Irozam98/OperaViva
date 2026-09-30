@echo off
title OperaViva - Compilazione Portable Windows
cd /d "%~dp0.."
echo ========================================================
echo   Compilazione della nuova versione Portable (.exe)...
echo ========================================================
call npm run electron:build
if exist "release\OperaViva 1.0.0.exe" (
    copy /y "release\OperaViva 1.0.0.exe" "portable\OperaViva_Portable.exe"
    copy /y "release\OperaViva 1.0.0.exe" "release\Windows_Portable\OperaViva_Portable.exe"
    del /f /q "release\OperaViva 1.0.0.exe" >nul 2>&1
    del /f /q "release\OperaViva Setup 1.0.0.exe" >nul 2>&1
    del /f /q "release\*.blockmap" >nul 2>&1
    del /f /q "release\*.yml" >nul 2>&1
    if exist "release\win-unpacked" rd /s /q "release\win-unpacked" >nul 2>&1
    echo.
    echo ========================================================
    echo   SUCCESSO: Nuovo OperaViva_Portable.exe pronto in:
    echo   - portable\OperaViva_Portable.exe
    echo   - release\Windows_Portable\OperaViva_Portable.exe
    echo ========================================================
) else (
    echo ERRORE durante la compilazione.
)
pause
