# ============================================================
# Script para rodar o backend usando Node.js PORTABLE (sem admin)
# Edita a linha abaixo com o caminho completo da tua pasta node-v24.14.0-win-x64
# Exemplo: "C:\Users\v-melosc1\Downloads\node-v24.14.0-win-x64"
# ============================================================
$NodeFolder = "C:\Users\v-melosc1\Downloads\node-v24.14.0-win-x64\node-v24.14.0-win-x64"

if (-not (Test-Path $NodeFolder)) {
    Write-Host "ERRO: Pasta do Node nao encontrada." -ForegroundColor Red
    Write-Host "Edita este script e coloca o caminho certo na variavel NodeFolder (linha 7)." -ForegroundColor Yellow
    Write-Host "Caminho atual: $NodeFolder" -ForegroundColor Gray
    pause
    exit 1
}

$env:Path = "$NodeFolder;$env:Path"
$npm = Join-Path $NodeFolder "npm.cmd"
$npx = Join-Path $NodeFolder "npx.cmd"
Set-Location $PSScriptRoot

# Usar .cmd para evitar bloqueio dos scripts .ps1 pela politica de execucao
Write-Host "Node: $(& "$NodeFolder\node.exe" -v)  |  npm: $(& $npm -v)" -ForegroundColor Green
Write-Host ""

# Instalar dependencias
Write-Host "A instalar dependencias (npm install)..." -ForegroundColor Cyan
& $npm install
if ($LASTEXITCODE -ne 0) { pause; exit 1 }

# Gerar cliente Prisma
Write-Host "A gerar cliente Prisma..." -ForegroundColor Cyan
& $npx prisma generate
if ($LASTEXITCODE -ne 0) { pause; exit 1 }

# Migracao (so na primeira vez)
Write-Host "A aplicar migracoes na base de dados..." -ForegroundColor Cyan
& $npx prisma migrate dev --name init
if ($LASTEXITCODE -ne 0) { pause; exit 1 }

# Iniciar servidor
Write-Host ""
Write-Host "A iniciar o servidor (Ctrl+C para parar)..." -ForegroundColor Green
& $npm run dev
