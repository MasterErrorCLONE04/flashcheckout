$client = New-Object System.Net.Sockets.TcpClient
try {
    $client.Connect("db.yumvbbhssylfwlypblxl.supabase.co", 5432)
    Write-Host "Connected successfully!"
    $client.Close()
} catch {
    Write-Error $_
}
