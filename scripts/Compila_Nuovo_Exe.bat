@echo off
title OperaViva - Compilazione Setup Windows
cd /d "%~dp0.."
echo ========================================================
echo   Compilazione del nuovo installer Windows (.exe)...
echo ========================================================
call npm run electron:build
if exist "release\OperaViva Setup 1.0.0.exe" (
    copy /y "release\OperaViva Setup 1.0.0.exe" "exe\OperaViva_Setup.exe"
    copy /y "release\OperaViva Setup 1.0.0.exe" "release\OperaViva_Windows_Setup.exe"
    echo.
    echo ========================================================
    echo   SUCCESSO: Nuovo OperaViva_Setup.exe pronto nella cartella exe!
    echo ========================================================
) else (
    echo ERRORE durante la compilazione.
)
pause
