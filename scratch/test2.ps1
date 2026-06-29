$hostName = "db.yumvbbhssylfwlypblxl.supabase.co"
$port = 5432

Write-Host "Resolving host $hostName..."
try {
    $addresses = [System.Net.Dns]::GetHostAddresses($hostName)
    foreach ($addr in $addresses) {
        Write-Host "Found address: $($addr.AddressToString) (Family: $($addr.AddressFamily))"
        
        Write-Host "Creating TcpClient with Family: $($addr.AddressFamily)..."
        $client = New-Object System.Net.Sockets.TcpClient($addr.AddressFamily)
        try {
            $client.Connect($addr, $port)
            Write-Host "Successfully connected to $($addr.AddressToString) on port $port!"
            $client.Close()
        } catch {
            Write-Error "Failed to connect to $($addr.AddressToString): $_"
        }
    }
} catch {
    Write-Error "Failed to resolve DNS: $_"
}
