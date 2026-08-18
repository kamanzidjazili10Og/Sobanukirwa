$dirs = Get-ChildItem 'D:\Sobanukirwa' -Directory
foreach ($d in $dirs) {
    $files = Get-ChildItem $d.FullName -Recurse -File -ErrorAction SilentlyContinue
    $totalMB = ($files | Measure-Object Length -Sum).Sum / 1MB
    Write-Output "$($d.Name): $([math]::Round($totalMB, 1)) MB"
}
