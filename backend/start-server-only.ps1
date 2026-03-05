# Inicia apenas o servidor (sem npm install / migrate). Usa Node portable.
$NodeFolder = "C:\Users\v-melosc1\Downloads\node-v24.14.0-win-x64\node-v24.14.0-win-x64"
$env:Path = "$NodeFolder;$env:Path"
Set-Location $PSScriptRoot
& "$NodeFolder\npm.cmd" run dev
