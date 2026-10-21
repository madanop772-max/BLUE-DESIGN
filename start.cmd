@echo off
title Blue Design
cd /d "%~dp0"
node --env-file-if-exists=.env src/server.js
pause
