@echo off
setlocal enabledelayedexpansion

REM Vérification que Docker est lancé
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker n'est pas lance! Veuillez demarrer Docker Desktop.
    pause
    exit /B 1
)

REM Build Production
echo Building Production version...
docker-compose build app
docker save -o images_Production.tar patient-management-system-app:latest

REM Afficher les messages APRÈS l'appel de la fonction
echo.
echo Livraison terminee
echo Image generee: images_Production.tar
pause
exit /B 0
