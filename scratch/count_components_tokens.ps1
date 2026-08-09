# PowerShell script to count characters, lines, and estimate tokens in the components directory.

$targetDir = "c:\Users\david\flashcheckout\components"
if (-not (Test-Path $targetDir)) {
    Write-Error "Directory $targetDir does not exist."
    exit 1
}

Write-Host "Analyzing directory: $targetDir"
Write-Host ("-" * 90)

$files = Get-ChildItem -Path $targetDir -Recurse -File | Where-Object { $_.Name -notlike ".*" }

$fileDetails = @()
$totalChars = 0
$totalTokens = 0
$totalLines = 0

foreach ($file in $files) {
    try {
        # Read file content safely
        $content = [System.IO.File]::ReadAllText($file.FullName)
        $chars = $content.Length
        
        # Token estimation: standard for code is ~3.3 chars per token
        $tokens = [Math]::Ceiling($chars / 3.3)
        
        # Count lines
        $lines = ($content -split "`n").Count
        
        # Relative path
        $relPath = $file.FullName.Substring($targetDir.Length + 1).Replace("\", "/")
        
        $fileDetails += [PSCustomObject]@{
            Path   = $relPath
            Lines  = $lines
            Chars  = $chars
            Tokens = $tokens
        }
        
        $totalChars += $chars
        $totalTokens += $tokens
        $totalLines += $lines
    }
    catch {
        Write-Warning "Could not read file $($file.FullName): $_"
    }
}

# Sort files by token count descending
$fileDetails = $fileDetails | Sort-Object Tokens -Descending

# Format output table header
$headerFormat = "{0,-50} | {1,6} | {2,10} | {3,12}"
Write-Host ($headerFormat -f "File Path", "Lines", "Chars", "Est. Tokens")
Write-Host ("-" * 90)

foreach ($f in $fileDetails) {
    # Format numbers with commas
    $charsFormatted = "{0:N0}" -f $f.Chars
    $tokensFormatted = "{0:N0}" -f $f.Tokens
    $linesFormatted = "{0:N0}" -f $f.Lines
    
    Write-Host ($headerFormat -f $f.Path, $linesFormatted, $charsFormatted, $tokensFormatted)
}

Write-Host ("-" * 90)
Write-Host "Summary Info:"
Write-Host ("Total Files:         " + $fileDetails.Count)
Write-Host ("Total Lines:         " + ("{0:N0}" -f $totalLines))
Write-Host ("Total Characters:    " + ("{0:N0}" -f $totalChars))
Write-Host ("Estimated Tokens:    " + ("{0:N0}" -f $totalTokens) + " (approx 3.3 chars/token)")
Write-Host ("Estimated (4 chars):  " + ("{0:N0}" -f [Math]::Ceiling($totalChars / 4)) + " tokens")
Write-Host ("-" * 90)
