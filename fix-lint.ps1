Write-Host "🔧 Corrigiendo errores automáticos..." -ForegroundColor Cyan
npm run lint -- --fix

Write-Host ""
Write-Host "🔧 Aplicando parches manuales..." -ForegroundColor Cyan

Get-ChildItem -Path src -Recurse -Include *.ts,*.tsx | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $newContent = $content -replace 'catch\s*\(\s*error\s*\)\s*\{', 'catch (error: unknown) {'
    if ($newContent -ne $content) {
        Set-Content -Path $_.FullName -Value $newContent -NoNewline
        Write-Host "  ✅ Parcheado: $($_.FullName)"
    }
}

Write-Host ""
Write-Host "✅ Correcciones automáticas aplicadas." -ForegroundColor Green
Write-Host ""
Write-Host "📝 Ahora ejecuta: npm run lint" -ForegroundColor Yellow