# Get all HTML files in the current directory
$htmlFiles = Get-ChildItem -Filter "*.html"

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName
    
    # Check if the file already includes remove-elements.js
    if ($content -notmatch "remove-elements\.js") {
        Write-Host "Processing $($file.Name)..."
        
        # Find the line with service worker registration
        $swLine = $content | Select-String -Pattern '<script defer src="js/sw-register.js"></script>'
        
        if ($swLine) {
            $lineNumber = $swLine.LineNumber
            
            # Create the new script block to insert
            $newScript = @"
    <!-- Service worker registration -->
    <script defer src="js/sw-register.js"></script>
    
    <!-- Remove back-to-top and audio elements -->
    <script defer src="js/remove-elements.js"></script>
"@
            
            # Replace the line with the new block
            $content = $content -replace '    <!-- Service worker registration -->\r?\n    <script defer src="js/sw-register.js"></script>', $newScript
            
            # Save the updated content
            $content | Set-Content -Path $file.FullName
            Write-Host "Updated $($file.Name)"
        } else {
            Write-Host "Could not find sw-register.js in $($file.Name)"
        }
    } else {
        Write-Host "$($file.Name) already has remove-elements.js"
    }
}

Write-Host "Process completed." 