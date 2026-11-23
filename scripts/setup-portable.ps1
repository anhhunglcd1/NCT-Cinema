<#
  Cài công cụ PORTABLE vào thư mục tools\ của dự án — không cài vào hệ thống, không sửa PATH/registry.
    tools\jdk   : Eclipse Temurin JDK 21 (luôn tải nếu chưa có)
    tools\node  : Node.js 24 LTS (chỉ tải nếu máy chưa có Node đủ mới, hoặc dùng -Node)
  Mỗi file tải về được kiểm tra SHA-256 trước khi giải nén. Xóa thư mục tools\ là gỡ sạch.
#>
param(
  [switch]$Node,   # ép tải Node portable kể cả khi máy đã có Node
  [switch]$Force   # tải lại kể cả khi đã có
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$root  = Split-Path -Parent $PSScriptRoot

# Windows giới hạn đường dẫn 260 ký tự; file sâu nhất của frontend dài ~141 ký tự tính từ thư mục dự án.
if ($root.Length -gt 110) {
  throw "Duong dan thu muc du an qua dai ($($root.Length) ky tu): $root`nHay chuyen thu muc NCT-Cinema ra vi tri ngan hon, vi du C:\NCT-Cinema hoac Desktop, roi chay lai."
}

$tools = Join-Path $root 'tools'
$tmp   = Join-Path $tools '_dl'
New-Item -ItemType Directory -Force -Path $tools, $tmp | Out-Null

function Get-Verified([string]$url, [string]$file, [string]$sha256) {
  $path = Join-Path $tmp $file
  if (-not (Test-Path $path) -or ((Get-FileHash $path -Algorithm SHA256).Hash -ne $sha256.ToUpper())) {
    Write-Host "  Tai $file ..."
    Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $path
  }
  $actual = (Get-FileHash $path -Algorithm SHA256).Hash
  if ($actual -ne $sha256.ToUpper()) {
    Remove-Item $path -Force
    throw "Sai checksum SHA-256 cua $file (file tai ve bi loi hoac bi thay doi)."
  }
  return $path
}

function Install-Zip([string]$zip, [string]$target) {
  # Thư mục giải nén tạm đặt tên ngắn để tránh vượt giới hạn 260 ký tự.
  $staging = Join-Path $tools '_x'
  if (Test-Path $staging) { Remove-Item $staging -Recurse -Force }
  New-Item -ItemType Directory -Path $staging | Out-Null
  $tar = Join-Path $env:SystemRoot 'System32\tar.exe'
  if (Test-Path $tar) {
    # tar.exe có sẵn từ Windows 10 (1803), giải nén zip nhanh hơn Expand-Archive nhiều.
    & $tar -xf $zip -C $staging
    if ($LASTEXITCODE -ne 0) { throw "Giai nen $zip that bai." }
  } else {
    Expand-Archive -Path $zip -DestinationPath $staging
  }
  $inner = Get-ChildItem $staging -Directory | Select-Object -First 1
  if (Test-Path $target) { Remove-Item $target -Recurse -Force }
  Move-Item $inner.FullName $target
  Remove-Item $staging -Recurse -Force
}

# ---- JDK ----
$jdk = Join-Path $tools 'jdk'
if ($Force -or -not (Test-Path (Join-Path $jdk 'bin\java.exe'))) {
  Write-Host 'JDK 21 (Eclipse Temurin):'
  $meta = Invoke-RestMethod -UseBasicParsing -Uri 'https://api.adoptium.net/v3/assets/latest/21/hotspot?os=windows&architecture=x64&image_type=jdk&vendor=eclipse'
  $pkg = $meta[0].binary.package
  $zip = Get-Verified $pkg.link $pkg.name $pkg.checksum
  Install-Zip $zip $jdk
  Write-Host "  OK: $jdk"
} else {
  Write-Host "JDK da co: $jdk"
}


Remove-Item $tmp -Recurse -Force
Write-Host ''
Write-Host 'XONG. JDK nam trong thu muc tools\jdk.'
