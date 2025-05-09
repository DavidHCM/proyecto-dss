@echo off
setlocal enabledelayedexpansion

set TIMEOUT_SECONDS=5

:menu
color 0A
cls
echo ============================
echo        PROYECTO DSS        
echo ============================
echo 1. Limpiar TODO Docker (containers, volumes, networks, images)
echo 2. Levantar Proyecto (docker compose up --build)
echo 3. Solo bajar proyecto (docker compose down)
echo 4. Build individual: Backend o UI
echo 5. Escanear vulnerabilidades con Trivy (Backend y UI)
echo 6. Salir
echo ============================
set /p option=Selecciona una opcion (1-6): 

if "%option%"=="1" goto limpiar
if "%option%"=="2" goto levantar
if "%option%"=="3" goto bajar
if "%option%"=="4" goto buildindividual
if "%option%"=="5" goto trivyscan
if "%option%"=="6" exit
goto menu

:check_docker
docker info >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo ===================================================
    echo   ERROR: Docker no esta corriendo o no disponible
    echo ===================================================
    echo Por favor, asegurate de que Docker Desktop este iniciado.
    pause
    exit /b
)
goto :eof

:limpiar
call :check_docker
color 0C
cls
echo Limpiando TODO Docker...
docker compose down --volumes --remove-orphans
docker system prune -af
if exist scans (
    echo Eliminando carpeta de reportes Trivy...
    rmdir /s /q scans
)
if %errorlevel% neq 0 (
    echo Error al limpiar Docker.
) else (
    echo Docker limpiado exitosamente.
)
pause
goto menu

:levantar
call :check_docker
color 0B
cls
echo Estado actual de contenedores:
docker ps
echo ============================
echo Si no seleccionas nada en %TIMEOUT_SECONDS% segundos, se levantara el proyecto automaticamente...

set /a counter=%TIMEOUT_SECONDS%

:esperando
set /a counter-=1
choice /n /c 12 /t 1 /d 2 >nul
if errorlevel 2 (
    if %counter% leq 0 goto continuarlevantar
    echo Esperando... !counter! segundos restantes...
    goto esperando
)
if errorlevel 1 (
    echo Operacion cancelada, regresando al menu...
    timeout /t 2 >nul
    goto menu
)

:continuarlevantar
cls
echo Levantando Proyecto (Build completo)...
docker compose up --build
if %errorlevel% neq 0 (
    color 0C
    echo Error al levantar el proyecto.
    pause
    goto menu
)
color 0A
echo Proyecto levantado correctamente!
echo Mostrando logs live...
timeout /t 2 >nul
docker compose logs -f
goto menu

:bajar
call :check_docker
color 0E
cls
echo Bajando proyecto sin limpiar imagenes...
docker compose down
if %errorlevel% neq 0 (
    color 0C
    echo Error al bajar el proyecto.
)
pause
goto menu

:buildindividual
call :check_docker
color 0D
cls
echo ============================
echo    BUILD INDIVIDUAL
echo ============================
echo 1. Build solo Backend
echo 2. Build solo UI
echo 3. Volver al menu principal
echo ============================
set /p buildoption=Selecciona una opcion (1-3): 

if "%buildoption%"=="1" goto buildbackend
if "%buildoption%"=="2" goto buildui
if "%buildoption%"=="3" goto menu
goto buildindividual

:buildbackend
color 0A
cls
echo Building Backend...
docker compose build backend
if %errorlevel% neq 0 (
    color 0C
    echo Error al hacer build de Backend.
)
pause
goto buildindividual

:buildui
color 0A
cls
echo Building UI...
docker compose build ui
if %errorlevel% neq 0 (
    color 0C
    echo Error al hacer build de UI.
)
pause
goto buildindividual

:trivyscan
call :check_docker
color 0E
cls
echo ============================
echo Escaneando imágenes con Trivy...
echo ============================

:: Crea carpeta scans si no existe
if not exist scans (
    mkdir scans
)

echo Escaneando backend...
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v "%cd%\scans:/output" aquasec/trivy image --format table --output /output/backend.txt proyecto-dss-backend

echo Escaneando UI...
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v "%cd%\scans:/output" aquasec/trivy image --format table --output /output/ui.txt proyecto-dss-ui

echo ============================
echo Escaneo completado.
echo Revisa los reportes en la carpeta "scans"
pause
goto menu
