@echo off
title Mente en Balance - servidor local
cd /d "%~dp0"
echo.
echo  Mente en Balance - version local
echo  ---------------------------------
if not exist node_modules (
  echo  Instalando dependencias por primera vez...
  call npm install
)
echo  Abriendo http://localhost:5175 en el navegador...
echo  Para detener el servidor, cierra esta ventana.
echo.
start "" cmd /c "timeout /t 4 >nul & start http://localhost:5175"
call npm run dev -- --port 5175 --strictPort
pause
