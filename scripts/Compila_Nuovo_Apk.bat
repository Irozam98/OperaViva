@echo off
title OperaViva - Compilazione APK Android Release
cd /d "%~dp0.."
echo ===================================================================
echo   Compilazione Release APK Android (.apk) Firmata Ufficiale...
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
echo [3/3] Compilazione APK Release con Gradle...
cd android
call gradlew assembleRelease
cd ..

if exist "android\app\build\outputs\apk\release\app-release.apk" (
    copy /y "android\app\build\outputs\apk\release\app-release.apk" "%~dp0OperaViva.apk"
    if not exist "release\Android_APK" mkdir "release\Android_APK"
    copy /y "android\app\build\outputs\apk\release\app-release.apk" "release\Android_APK\OperaViva.apk"
    echo.
    echo ===================================================================
    echo   SUCCESSO: Nuovo file OperaViva.apk (RELEASE FIRMATA) pronto!
    echo ===================================================================
) else (
    echo.
    echo ERRORE durante la compilazione dell'APK Release.
)
pause
