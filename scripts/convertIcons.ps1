Add-Type -AssemblyName System.Drawing
$files = Get-ChildItem -Path "public\*.png"
foreach ($file in $files) {
    try {
        $bmp = [System.Drawing.Bitmap]::FromFile($file.FullName)
        $temp = $file.FullName + ".tmp"
        $bmp.Save($temp, [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Dispose()
        Move-Item -Path $temp -Destination $file.FullName -Force
        Write-Host "Converted $($file.Name) to true PNG."
    } catch {
        Write-Host "Error converting $($file.Name): $_"
    }
}
