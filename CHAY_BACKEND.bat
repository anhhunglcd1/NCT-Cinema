@echo off
setlocal EnableExtensions
title NCT Cinema - Backend
set "TOOLS=%~dp0tools"
cd /d "%~dp0backend"

rem Uu tien JDK portable trong tools\jdk; tu tai neu repo da co script setup.
if not exist "%TOOLS%\jdk\bin\java.exe" if exist "%~dp0scripts\setup-portable.ps1" (
  echo Chua co JDK, dang tai JDK portable vao thu muc tools\...
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\setup-portable.ps1"
)
if not exist "%TOOLS%\jdk\bin\java.exe" goto :check_java
set "JAVA_HOME=%TOOLS%\jdk"
set "PATH=%TOOLS%\jdk\bin;%PATH%"

:check_java
where java >nul 2>nul
if errorlevel 1 (
  echo [LOI] Chua co Java. Chay scripts\setup-portable.ps1 de tai JDK portable vao thu muc tools\.
  pause
  exit /b 1
)

rem Tu tao backend\.env (mat khau admin ngau nhien) neu chua co.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\init-env.ps1"
if errorlevel 1 (
  echo [LOI] Khong tao duoc backend\.env.
  pause
  exit /b 1
)

rem Maven va thu vien cung de trong tools\m2, khong ghi vao thu muc nguoi dung.
set "MAVEN_USER_HOME=%TOOLS%\m2"

echo Dang khoi dong backend ^(profile local, du lieu H2 trong backend\data^)...
echo Lan dau Maven se tai thu vien, can Internet va co the mat vai phut.
echo Khi thay dong "Started NctCinemaBackendApplication" la backend da san sang: http://127.0.0.1:8080/api/health
call "%~dp0backend\mvnw.cmd" "-Dmaven.repo.local=%TOOLS%\m2\repository" spring-boot:run "-Dspring-boot.run.profiles=local"
set CODE=%ERRORLEVEL%
if not "%CODE%"=="0" echo [LOI] Backend dung voi ma loi %CODE%. Kiem tra cong 8080 co dang bi chiem khong.
pause
exit /b %CODE%
