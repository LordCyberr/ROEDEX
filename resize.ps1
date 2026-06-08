Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('C:\Users\Administrator\Desktop\ROEDEX\dist\icon128.png')
$bmp = new-object System.Drawing.Bitmap 128,128
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($img, 0, 0, 128, 128)
$g.Dispose()
$img.Dispose()
$bmp.Save('C:\Users\Administrator\Desktop\ROEDEX\dist\icon128_small.png')
$bmp.Dispose()
Copy-Item -Force 'C:\Users\Administrator\Desktop\ROEDEX\dist\icon128_small.png' 'C:\Users\Administrator\Desktop\ROEDEX\dist\icon128.png'
Copy-Item -Force 'C:\Users\Administrator\Desktop\ROEDEX\dist\icon128_small.png' 'C:\Users\Administrator\Desktop\ROEDEX\public\icon128.png'
