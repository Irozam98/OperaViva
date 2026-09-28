@echo off
title OperaViva - Compilazione APK Android
cd /d "%~dp0.."
echo ========================================================
echo   Compilazione della nuova applicazione Android (.apk)...
echo ========================================================
call npm run build
call npx cap sync android
cd android
call gradlew assembleDebug
cd ..
if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    copy /y "android\app\build\outputs\apk\debug\app-debug.apk" "%~dp0OperaViva.apk"
    echo.
    echo ========================================================
    echo   SUCCESSO: Nuovo file OperaViva.apk pronto in questa cartella!
    echo ========================================================
) else (
    echo ERRORE durante la compilazione dell'APK.
)
pause
