@echo off
cd /d "%~dp0"
start /B npx electron . > nul 2>&1
exit
