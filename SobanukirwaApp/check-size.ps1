$appDir = "D:\Sobanukirwa\SobanukirwaApp"
$nmDir = Join-Path $appDir "node_modules"
$distDir = Join-Path $appDir "dist"
$androidDir = Join-Path $appDir "android"

$nmSize = 0
if (Test-Path $nmDir) {
    $nmSize = (Get-ChildItem $nmDir -Recurse -File -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum / 1MB
}

$appSize = (Get-ChildItem $appDir -Recurse -File -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum / 1MB
$appNoNm = $appSize - $nmSize

Write-Output "Total app dir: $([math]::Round($appSize, 1)) MB"
Write-Output "node_modules: $([math]::Round($nmSize, 1)) MB"
Write-Output "App without node_modules: $([math]::Round($appNoNm, 1)) MB"

$rootDir = "D:\Sobanukirwa"
$rootSize = (Get-ChildItem $rootDir -Directory | ForEach-Object {
    if ($_.Name -eq "SobanukirwaApp") { 0 } else {
        (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum / 1MB
    }
} | Measure-Object -Sum).Sum
Write-Output "Other root dirs: $([math]::Round($rootSize, 1)) MB"
