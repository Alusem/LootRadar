# Inicia backend e frontend com Node portable. Executar na raiz do projeto LootRadar.
$NodeFolder = "C:\Users\v-melosc1\Downloads\node-v24.14.0-win-x64\node-v24.14.0-win-x64"
if (-not (Test-Path $NodeFolder)) {
    Write-Host "ERRO: Pasta do Node nao encontrada: $NodeFolder" -ForegroundColor Red
    exit 1
}
$env:Path = "$NodeFolder;$env:Path"
$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"

Write-Host "A iniciar backend em $backendPath ..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    param($path, $nodePath)
    $env:Path = "$nodePath;$env:Path"
    Set-Location $path
    & "$nodePath\npm.cmd" run dev
} -ArgumentList $backendPath, $NodeFolder

Start-Sleep -Seconds 3
Write-Host "A iniciar frontend em $frontendPath ..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    param($path, $nodePath)
    $env:Path = "$nodePath;$env:Path"
    Set-Location $path
    if (-not (Test-Path "node_modules")) { & "$nodePath\npm.cmd" install }
    & "$nodePath\npm.cmd" run dev
} -ArgumentList $frontendPath, $NodeFolder

Write-Host ""
Write-Host "Backend: http://localhost:3000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "Para parar: Receive-Job $($backendJob.Id); Receive-Job $($frontendJob.Id); Stop-Job $backendJob, $frontendJob" -ForegroundColor Gray
Receive-Job $backendJob -Wait
Receive-Job $frontendJob -Wait
