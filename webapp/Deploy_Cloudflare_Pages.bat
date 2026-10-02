@echo off
title OperaViva WebApp - Deploy su Cloudflare Pages
cd /d "%~dp0"
echo ========================================================
echo   OPERA VIVA CLOUD - COMPILAZIONE E DEPLOY CLOUDFLARE
echo ========================================================
echo.
echo 1. Compilazione del frontend React per produzione...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRORE] Compilazione fallita. Operazione interrotta.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo 2. Pubblicazione su Cloudflare Pages (Progetto: operaviva-webapp)...
call npx wrangler pages deploy dist --project-name=operaviva-webapp
echo.
echo Operazione completata!
pause
