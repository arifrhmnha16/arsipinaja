Add-Type -AssemblyName System.Drawing

function Generate-PwaPng {
    param (
        [int]$Dimension,
        [string]$OutPath
    )
    $bmp = New-Object System.Drawing.Bitmap($Dimension, $Dimension)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.Clear([System.Drawing.Color]::FromArgb(37, 99, 235))
    
    $penWidth = [math]::Max(2, [int]($Dimension * 0.025))
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(23, 23, 23), $penWidth)
    $g.DrawRectangle($borderPen, [int]($penWidth/2), [int]($penWidth/2), [int]($Dimension - $penWidth), [int]($Dimension - $penWidth))
    
    $folderBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(56, 189, 248))
    $g.FillRectangle($folderBrush, [int]($Dimension * 0.22), [int]($Dimension * 0.28), [int]($Dimension * 0.56), [int]($Dimension * 0.18))
    
    $boxBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillRectangle($boxBrush, [int]($Dimension * 0.16), [int]($Dimension * 0.38), [int]($Dimension * 0.68), [int]($Dimension * 0.42))
    $g.DrawRectangle($borderPen, [int]($Dimension * 0.16), [int]($Dimension * 0.38), [int]($Dimension * 0.68), [int]($Dimension * 0.42))
    
    $handleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(37, 99, 235))
    $g.FillRectangle($handleBrush, [int]($Dimension * 0.38), [int]($Dimension * 0.54), [int]($Dimension * 0.24), [int]($Dimension * 0.1))
    $g.DrawRectangle($borderPen, [int]($Dimension * 0.38), [int]($Dimension * 0.54), [int]($Dimension * 0.24), [int]($Dimension * 0.1))
    
    $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

$iconsDir = Join-Path $PSScriptRoot "..\public\icons"
if (-not (Test-Path $iconsDir)) { New-Item -ItemType Directory -Path $iconsDir -Force }

Generate-PwaPng -Dimension 192 -OutPath (Join-Path $iconsDir "icon-192.png")
Generate-PwaPng -Dimension 512 -OutPath (Join-Path $iconsDir "icon-512.png")
Generate-PwaPng -Dimension 180 -OutPath (Join-Path $iconsDir "apple-touch-icon.png")
Write-Output "PWA PNG icons generated successfully"
