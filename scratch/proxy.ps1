$source = @"
using System;
using System.Net;
using System.Net.Sockets;
using System.Threading.Tasks;

public class TcpProxy {
    private TcpListener _listener;
    private bool _running;
    private string _remoteHost;
    private int _remotePort;

    public TcpProxy(int localPort, string remoteHost, int remotePort) {
        _listener = new TcpListener(IPAddress.Any, localPort);
        _remoteHost = remoteHost;
        _remotePort = remotePort;
    }

    public async Task StartAsync() {
        _running = true;
        _listener.Start();
        Console.WriteLine("C# Proxy listening on port " + ((IPEndPoint)_listener.LocalEndpoint).Port + "...");
        
        while (_running) {
            try {
                TcpClient localClient = await _listener.AcceptTcpClientAsync();
                Console.WriteLine("Connection accepted from " + localClient.Client.RemoteEndPoint);
                HandleClientAsync(localClient);
            }
            catch (Exception ex) {
                if (_running) {
                    Console.WriteLine("Error accepting client: " + ex.Message);
                }
            }
        }
    }

    public void Stop() {
        _running = false;
        _listener.Stop();
        Console.WriteLine("Proxy stopped.");
    }

    private async void HandleClientAsync(TcpClient localClient) {
        try {
            IPAddress[] addresses = await Dns.GetHostAddressesAsync(_remoteHost);
            IPAddress ipv6Addr = null;
            foreach (var addr in addresses) {
                if (addr.AddressFamily == AddressFamily.InterNetworkV6) {
                    ipv6Addr = addr;
                    break;
                }
            }
            IPAddress remoteAddr = ipv6Addr ?? addresses[0];

            using (TcpClient remoteClient = new TcpClient(remoteAddr.AddressFamily)) {
                await remoteClient.ConnectAsync(remoteAddr, _remotePort);
                Console.WriteLine("Connected to remote " + _remoteHost + " (" + remoteAddr + ")");

                using (NetworkStream localStream = localClient.GetStream())
                using (NetworkStream remoteStream = remoteClient.GetStream()) {
                    Task localToRemote = localStream.CopyToAsync(remoteStream);
                    Task remoteToLocal = remoteStream.CopyToAsync(localStream);

                    await Task.WhenAny(localToRemote, remoteToLocal);
                }
            }
            Console.WriteLine("Connection closed.");
        }
        catch (Exception ex) {
            Console.WriteLine("Error forwarding: " + ex.Message);
        }
        finally {
            localClient.Close();
        }
    }
}
"@

Add-Type -TypeDefinition $source
$proxy = New-Object TcpProxy(5433, "db.yumvbbhssylfwlypblxl.supabase.co", 5432)
$task = $proxy.StartAsync()
Write-Host "Proxy is running. Press Ctrl+C to exit."
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    $proxy.Stop()
}
