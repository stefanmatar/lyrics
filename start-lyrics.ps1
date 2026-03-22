$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnvFile = Join-Path $RepoRoot '.env'
$DisplayUrl = $null

function Import-DotEnv {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        return
    }

    Get-Content -Path $Path | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith('#')) {
            return
        }

        $separator = $line.IndexOf('=')
        if ($separator -lt 1) {
            return
        }

        $name = $line.Substring(0, $separator).Trim()
        $value = $line.Substring($separator + 1).Trim().Trim('"')
        [Environment]::SetEnvironmentVariable($name, $value, 'Process')
    }
}

function Get-BrowserPath {
    $candidates = @(
        'C:\Program Files\Google\Chrome\Application\chrome.exe',
        'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
        (Join-Path $env:LOCALAPPDATA 'Google\Chrome\Application\chrome.exe'),
        'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
        'C:\Program Files\Microsoft\Edge\Application\msedge.exe'
    )

    foreach ($candidate in $candidates) {
        if ($candidate -and (Test-Path $candidate)) {
            return $candidate
        }
    }

    throw 'Chrome or Edge was not found in the default install locations.'
}

function Wait-ForDocker {
    param([int]$TimeoutSeconds = 180)

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            docker info *> $null
            if ($LASTEXITCODE -eq 0) {
                return
            }
        } catch {
        }

        Start-Sleep -Seconds 3
    }

    throw 'Docker did not become ready in time.'
}

function Wait-ForUrl {
    param(
        [string]$Url,
        [int]$TimeoutSeconds = 120
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
                return
            }
        } catch {
        }

        Start-Sleep -Seconds 2
    }

    throw "The display did not respond at $Url in time."
}

Import-DotEnv -Path $EnvFile

$lyricsPort = if ($env:LYRICS_PORT) { $env:LYRICS_PORT } else { '8000' }
$windowPosition = if ($env:BROWSER_WINDOW_POSITION) { $env:BROWSER_WINDOW_POSITION } else { '-1920,0' }
$browserPath = Get-BrowserPath
$DisplayUrl = "http://localhost:$lyricsPort"

Write-Host '[Lyrics Display] Waiting for Docker Desktop...'
Wait-ForDocker

Write-Host '[Lyrics Display] Starting container...'
docker compose up -d | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw 'docker compose up -d failed.'
}

Write-Host "[Lyrics Display] Waiting for $DisplayUrl ..."
Wait-ForUrl -Url $DisplayUrl

Write-Host '[Lyrics Display] Launching browser in kiosk mode...'
Start-Process -FilePath $browserPath -ArgumentList @(
    '--new-window',
    '--kiosk',
    "--window-position=$windowPosition",
    '--app-auto-launched',
    $DisplayUrl
)
