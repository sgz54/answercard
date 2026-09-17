@echo off
cd /d "%~dp0"
set PATH=%PATH%;C:\Program Files\Git\cmd

echo === Step 1: Merging remote README ===
git pull origin main --allow-unrelated-histories --no-edit
if errorlevel 1 (
  echo.
  echo Pull failed. If you see a merge conflict, just run:  git add -A  then re-run this file.
  pause
  exit /b 1
)

echo.
echo === Step 2: Pushing code ===
echo A GitHub login window will open - click "Authorize" / sign in.
git push -u origin main

echo.
echo === Done ===
pause
