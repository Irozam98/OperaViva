@echo off
title OperaViva WebApp - Server di Sviluppo Locale
cd /d "%~dp0"
echo ========================================================
echo   OPERA VIVA CLOUD - SVILUPPO LOCALE WEBAPP
echo ========================================================
echo.
echo Avvio del server di sviluppo Vite su http://localhost:5174...
echo.
call npm run dev
pause
