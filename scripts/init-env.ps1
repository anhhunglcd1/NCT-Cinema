<#
  Tạo backend\.env cho chạy demo local nếu chưa có:
  copy từ backend\local-demo.env.example và sinh mật khẩu admin ngẫu nhiên (chỉ lưu trên máy này).
#>
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root 'backend\.env'
if (Test-Path $envFile) { exit 0 }

$template = [IO.File]::ReadAllText((Join-Path $root 'backend\local-demo.env.example'), [Text.Encoding]::UTF8)
$bytes = New-Object byte[] 12
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$password = 'Nct-' + (([Convert]::ToBase64String($bytes)) -replace '[+/=]', 'x')
$content = $template -replace '(?m)^NCT_ADMIN_PASSWORD=.*$', "NCT_ADMIN_PASSWORD=$password"
[IO.File]::WriteAllText($envFile, $content, (New-Object Text.UTF8Encoding $false))

Write-Host 'Da tao backend\.env (cau hinh demo, thanh toan mo phong).'
Write-Host "Tai khoan quan tri: admin@nct.local / $password"
