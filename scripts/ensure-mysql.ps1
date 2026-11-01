# Ensures WAMP MySQL is listening on 127.0.0.1:3306 with database dailykart.
# Safe to run repeatedly (logon task, npm run mysql:up).

$ErrorActionPreference = "Continue"
$hostName = "127.0.0.1"
$port = 3306
$mysql = "C:\wamp\bin\mysql\mysql5.1.36\bin\mysql.exe"
$mysqld = "C:\wamp\bin\mysql\mysql5.1.36\bin\mysqld.exe"
$myIni = "C:\wamp\bin\mysql\mysql5.1.36\my.ini"

function Test-Dailykart {
    if (-not (Test-Path $mysql)) {
        return $false
    }
    & $mysql -h $hostName -P $port -u root --connect-timeout=2 -e "USE dailykart; SELECT 1 AS ok;" 2>$null | Out-Null
    return ($LASTEXITCODE -eq 0)
}

function Test-PortOpen {
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $iar = $client.BeginConnect($hostName, $port, $null, $null)
        $ok = $iar.AsyncWaitHandle.WaitOne(1000, $false)
        if ($ok -and $client.Connected) {
            $client.Close()
            return $true
        }
        $client.Close()
        return $false
    } catch {
        return $false
    }
}

if (-not (Test-Path $mysqld)) {
    Write-Host "WAMP mysqld not found at $mysqld"
    exit 1
}

if (Test-Dailykart) {
    Write-Host "MySQL listening on ${hostName}:${port}; dailykart reachable"
    exit 0
}

Write-Host "Starting WAMP MySQL ($mysqld) on port $port..."
Start-Process -FilePath $mysqld -ArgumentList @("--defaults-file=$myIni") -WindowStyle Hidden

for ($i = 0; $i -lt 25; $i++) {
    Start-Sleep -Seconds 1
    if (Test-Dailykart) {
        Write-Host "Started WAMP MySQL on ${hostName}:${port}; dailykart reachable"
        exit 0
    }
}

$portOpen = Test-PortOpen
Write-Host "Failed to reach dailykart on ${hostName}:${port} (port open: $portOpen). Start WAMP as Administrator."
exit 1
