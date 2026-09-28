@echo off
title OperaViva - Compilazione Portable Windows
cd /d "%~dp0.."
echo ========================================================
echo   Compilazione della nuova versione Portable (.exe)...
echo ========================================================
call npm run electron:build
if exist "release\OperaViva 1.0.0.exe" (
    copy /y "release\OperaViva 1.0.0.exe" "%~dp0OperaViva_Portable.exe"
    echo.
    echo ========================================================
    echo   SUCCESSO: Nuovo OperaViva_Portable.exe pronto in questa cartella!
    echo ========================================================
) else (
    echo ERRORE durante la compilazione.
)
pause
