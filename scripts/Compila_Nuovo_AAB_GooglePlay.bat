@echo off
title OperaViva - Ricompila Bundle (.aab) per Google Play
cd /d "%~dp0.."
echo ===================================================================
echo   Compilazione Release Android App Bundle (.aab) per Google Play...
echo ===================================================================
echo.
echo [1/3] Compilazione Web App...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ERRORE: Compilazione web fallita.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Sincronizzazione Capacitor Android...
call npx cap sync android
if %ERRORLEVEL% neq 0 (
    echo ERRORE: Sincronizzazione Capacitor fallita.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Compilazione Bundle Release firmato con Gradle...
cd android
call gradlew bundleRelease
cd ..

if exist "android\app\build\outputs\bundle\release\app-release.aab" (
    copy /y "android\app\build\outputs\bundle\release\app-release.aab" "google console\1_DA_CARICARE_IN_RELEASE_AAB\OperaViva.aab"
    if exist "..\google console\operaviva" copy /y "android\app\build\outputs\bundle\release\app-release.aab" "..\google console\operaviva\1_DA_CARICARE_IN_RELEASE_AAB\OperaViva.aab"
    echo.
    echo ===================================================================
    echo   SUCCESSO!
    echo   Il file firmato OperaViva.aab e pronto in:
    echo   "google console\1_DA_CARICARE_IN_RELEASE_AAB\OperaViva.aab"
    echo.
    echo   Pronto per essere caricato su Google Play Console!
    echo ===================================================================
) else (
    echo.
    echo ERRORE durante la generazione dell'AAB.
)
pause
