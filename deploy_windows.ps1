param(
  [string]$NodeEnv = "production",
  [string]$AppDir = "$PSScriptRoot",
  [string]$MySqlExe = "mysql",
  [string]$DbHost = "127.0.0.1",
  [string]$DbPort = "6612",
  [string]$DbUser = "root",
  [string]$DbPassword = "71kzgY_260420!",
  [string]$JwtSecret = "260420_71kzgY!"
)

$ErrorActionPreference = "Stop"
Set-Location $AppDir

Write-Host "[1/3] Installing npm dependencies..."
npm install

Write-Host "[2/3] Initializing database schema..."
$env:MYSQL_PWD = $DbPassword
Get-Content "$AppDir\sql\init.sql" | & $MySqlExe -h $DbHost -P $DbPort -u $DbUser --default-character-set=utf8mb4
Remove-Item Env:MYSQL_PWD -ErrorAction SilentlyContinue

Write-Host "[3/3] Starting service..."
$env:NODE_ENV = $NodeEnv
if ([string]::IsNullOrWhiteSpace($JwtSecret)) {
  $JwtSecret = ([guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N"))
  Write-Host "JWT secret not provided, generated one for current session."
}
$env:JWT_SECRET = $JwtSecret
node "$AppDir\src\app.js"
