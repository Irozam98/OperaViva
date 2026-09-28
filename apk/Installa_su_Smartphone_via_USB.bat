@echo off
title OperaViva - Installazione Android via USB
echo ========================================================
echo   Installazione di OperaViva su dispositivo Android...
echo ========================================================
echo.
echo Assicurati che lo smartphone sia collegato via USB con "Debug USB" attivo.
echo.
adb devices
echo.
echo Installazione in corso...
adb install -r "%~dp0OperaViva.apk"
if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo   INSTALLAZIONE COMPLETATA CON SUCCESSO!
    echo   Troverai OperaViva tra le app del tuo telefono.
    echo ========================================================
) else (
    echo.
    echo Se adb non e configurato, puoi semplicemente copiare
    echo il file "OperaViva.apk" nella memoria del telefono
    echo e toccarlo per installarlo direttamente!
)
pause
