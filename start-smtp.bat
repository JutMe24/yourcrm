@echo off
echo Demarrage du serveur SMTP...
cd /d "%~dp0"
node smtp-server.js
pause
