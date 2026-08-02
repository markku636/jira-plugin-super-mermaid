<#
.SYNOPSIS
  把 Super Mermaid for Jira 部署到你的 Jira Cloud 站台。

.DESCRIPTION
  前置作業(整台機器只需做一次,而且必須由你本人完成):

    1. 建立 API token
       https://id.atlassian.com/manage-profile/security/api-tokens
       點「Create API token with scopes」→ 選 Forge → 複製 token(只顯示一次)

    2. 準備 Jira Cloud 站台
       沒有的話到 http://go.atlassian.com/cloud-dev 開免費開發站台,
       要用同一個 Atlassian 帳號 email。

    3. 登入(互動式,無法在非 TTY 環境執行)
       forge login

  之後每次要更新就直接跑這個腳本。

.PARAMETER Site
  Jira 站台網址,例如 your-site.atlassian.net。
  省略則由 forge install 互動詢問。

.PARAMETER Environment
  development(預設) / staging / production。
  只有 development 支援 forge tunnel 與 forge logs。

.PARAMETER Install
  第一次部署要帶這個旗標,把 app 安裝進站台。
  之後只要 deploy,不需要重裝(除非 scopes 有變)。

.EXAMPLE
  ./deploy.ps1 -Install -Site your-site.atlassian.net

.EXAMPLE
  ./deploy.ps1
#>
param(
    [string]$Site,
    [ValidateSet('development', 'staging', 'production')]
    [string]$Environment = 'development',
    [switch]$Install
)

Set-Location $PSScriptRoot

function Fail($msg) {
    Write-Host ""
    Write-Host "✗ $msg" -ForegroundColor Red
    exit 1
}

function Step($msg) {
    Write-Host ""
    Write-Host "── $msg" -ForegroundColor Cyan
}

# ── 1. 登入檢查 ───────────────────────────────────────────────
Step "檢查登入狀態"
forge whoami | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "尚未登入 Forge。請在你自己的終端機執行(需要互動輸入):" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "    forge login" -ForegroundColor White
    Write-Host ""
    Write-Host "需要 Atlassian API token:" -ForegroundColor Yellow
    Write-Host "    https://id.atlassian.com/manage-profile/security/api-tokens"
    Write-Host "    → Create API token with scopes → 選 Forge"
    Fail "登入後再重跑這個腳本。"
}
forge whoami

# ── 2. 註冊 app(只有第一次需要) ──────────────────────────────
$manifest = Get-Content manifest.yml -Raw
if ($manifest -notmatch 'id:\s*ari:cloud:ecosystem::app/') {
    Step "註冊 app(會把 app.id 寫回 manifest.yml)"
    forge register
    if ($LASTEXITCODE -ne 0) { Fail "forge register 失敗。" }
}
else {
    Step "app 已註冊,跳過 register"
}

# ── 3. 建置 Custom UI ────────────────────────────────────────
Step "建置 Custom UI(Vite)"
if (-not (Test-Path 'static/panel/node_modules')) {
    Write-Host "  static/panel 尚未安裝依賴,先跑 npm install…"
    npm --prefix static/panel install --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) { Fail "panel npm install 失敗。" }
}
npm --prefix static/panel run build
if ($LASTEXITCODE -ne 0) { Fail "Custom UI 建置失敗。" }

if (-not (Test-Path 'static/panel/build/index.html')) {
    Fail "找不到 static/panel/build/index.html —— manifest 的 resources 會指向空目錄。"
}

# ── 4. 驗證 manifest ─────────────────────────────────────────
Step "驗證 manifest"
forge lint
if ($LASTEXITCODE -ne 0) { Fail "forge lint 未通過。" }

# ── 5. 部署 ──────────────────────────────────────────────────
Step "部署到 $Environment"
forge deploy -e $Environment
if ($LASTEXITCODE -ne 0) { Fail "forge deploy 失敗。" }

# ── 6. 安裝(第一次才需要) ────────────────────────────────────
if ($Install) {
    Step "安裝到站台"
    if ($Site) {
        forge install --site $Site --product jira -e $Environment --non-interactive
    }
    else {
        Write-Host "  未指定 -Site,forge install 會互動詢問。" -ForegroundColor Yellow
        forge install
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  install 未成功 —— 若 app 已安裝過,這是正常的(改用 forge install --upgrade)。" -ForegroundColor Yellow
    }
}

# ── 7. Runs on Atlassian 資格檢查 ────────────────────────────
# 這個徽章 = 對外唯一講得清楚的信任訊號(資料零外流)。任何時候只要有人加了
# permissions.external / remotes / Connect 模組,就會在這裡被抓到。
Step "檢查 Runs on Atlassian 資格"
forge eligibility
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ⚠ 資格檢查未通過 —— 上架前務必解決,否則會失去 Runs on Atlassian 徽章。" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✓ 完成。到任何一張 Jira issue,右側應該會出現「Super Mermaid」面板按鈕。" -ForegroundColor Green
Write-Host "  之後改前端不必重新部署,跑 forge tunnel 就能熱更新。" -ForegroundColor Gray
