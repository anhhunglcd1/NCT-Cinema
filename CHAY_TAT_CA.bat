@echo off
setlocal
title NCT Cinema - Khoi dong
echo NCT Cinema: tu cai cong cu (neu thieu), tao cau hinh, chay backend + frontend va mo trinh duyet.
echo Khong cai gi vao he thong; moi thu nam trong thu muc nay.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-all.ps1"
if errorlevel 1 (
  echo.
  echo [LOI] Khoi dong that bai. Xem thong bao phia tren va trong cua so Backend/Frontend.
  pause
  exit /b 1
)
echo.
echo Co the dong cua so nay.
pause
