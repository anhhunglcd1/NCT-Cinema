<#
  Một nút chạy toàn bộ NCT Cinema trên máy:
    1. Tải công cụ portable vào tools\ nếu thiếu (JDK, Node nếu máy chưa có)
    2. Tạo backend\.env nếu chưa có (mật khẩu admin ngẫu nhiên)
    3. Mở 2 cửa sổ: backend và frontend (bỏ qua phần nào đang chạy sẵn)
    4. Chờ sẵn sàng rồi mở trình duyệt
  Biến môi trường NCT_NO_BROWSER=1 để không tự mở trình duyệt.
#>
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$backendUrl = 'http://127.0.0.1:8080/api/health'
$frontendUrl = 'http://localhost:3000'

function Test-Url([string]$url) {
  try { return (Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 5).StatusCode -eq 200 } catch { return $false }
}
# Backend chỉ tính là sẵn sàng khi /api/health trả đúng {"status":"UP"}.
function Test-Backend {
  try { return (Invoke-RestMethod -UseBasicParsing -Uri $backendUrl -TimeoutSec 5).status -eq 'UP' } catch { return $false }
}

Write-Host '== 1/4 Kiem tra cong cu trong thu muc tools\ =='
& (Join-Path $PSScriptRoot 'setup-portable.ps1')

Write-Host ''
Write-Host '== 2/4 Cau hinh backend\.env =='
& (Join-Path $PSScriptRoot 'init-env.ps1')
Write-Host 'OK.'

Write-Host ''
Write-Host '== 3/4 Khoi dong =='
if (Test-Backend) {
  Write-Host 'Backend da chay san.'
} else {
  Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', ('"' + (Join-Path $root 'CHAY_BACKEND.bat') + '"')
  Write-Host 'Da mo cua so Backend.'
}
if (Test-Url $frontendUrl) {
  Write-Host 'Frontend da chay san.'
} else {
  Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', ('"' + (Join-Path $root 'CHAY_FRONTEND.bat') + '"')
  Write-Host 'Da mo cua so Frontend.'
}

Write-Host ''
Write-Host '== 4/4 Cho he thong san sang (lan dau tai thu vien, co the mat 5-10 phut) =='
$deadline = (Get-Date).AddMinutes(20)
$backendOk = $false; $frontendOk = $false
while ((Get-Date) -lt $deadline -and -not ($backendOk -and $frontendOk)) {
  Start-Sleep -Seconds 5
  if (-not $backendOk) { $backendOk = Test-Backend; if ($backendOk) { Write-Host '  Backend: san sang' } }
  if (-not $frontendOk) { $frontendOk = Test-Url $frontendUrl; if ($frontendOk) { Write-Host '  Frontend: san sang' } }
  if (-not ($backendOk -and $frontendOk)) { Write-Host -NoNewline '.' }
}
Write-Host ''

if (-not ($backendOk -and $frontendOk)) {
  Write-Host '[LOI] Qua 20 phut chua san sang. Xem thong bao loi trong cua so Backend/Frontend.'
  exit 1
}

$admin = Select-String -Path (Join-Path $root 'backend\.env') -Pattern '^NCT_ADMIN_(EMAIL|PASSWORD)=' | ForEach-Object { $_.Line.Split('=', 2)[1] }
Write-Host ''
Write-Host '================ NCT CINEMA DA CHAY ================'
Write-Host "  Trang web : $frontendUrl"
Write-Host "  Quan tri  : $frontendUrl/admin"
Write-Host "  Admin     : $($admin[0]) / $($admin[1])   (luu trong backend\.env)"
Write-Host '  Tat he thong: dong 2 cua so "NCT Cinema - Backend" va "NCT Cinema - Frontend".'
Write-Host '===================================================='

if ($env:NCT_NO_BROWSER -ne '1') { Start-Process $frontendUrl }
