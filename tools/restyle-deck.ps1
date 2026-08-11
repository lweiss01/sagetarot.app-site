# Sage — https://sagetarot.app
# Copyright © 2026 Future Proof Works. All rights reserved.
#
# Restyle the Rider–Waite images into a new deck.
#
# The composition is never altered, only the surface — so every symbol stays
# exactly where the "look closer" notes say it is. Output filenames match the
# input, so the app picks the new deck up with no mapping and no renaming.
#
# Needs ImageMagick 7: https://imagemagick.org/script/download.php#windows
# (v6 users: replace `magick` with `convert` below.)
#
# Usage:
#   .\restyle-deck.ps1                 -> default style, into images\painted\
#   .\restyle-deck.ps1 -Style ink      -> pick a style
#   .\restyle-deck.ps1 -Only 6         -> just six sample cards, to preview
#
# Styles:
#   wash   muted grey ink wash on warm paper. Closest to the sumi-e look.
#   ink    high-contrast monochrome, almost an engraving.
#   faded  soft, low-contrast, sun-bleached. Colour still present but quiet.

param(
  [ValidateSet('wash','ink','faded')] [string]$Style = 'wash',
  [string]$Source = 'D:\Projects\active\sage\images',
  [string]$Dest   = 'D:\Projects\active\sage\images\painted',
  [int]$Only = 0,

  # One card only, for fast iteration: -Card Pents05.jpg
  [string]$Card = '',

  # Shadow lift. The dark cards live or die on this one. Higher opens the
  # blacks up so hatching stays readable; 1.0 leaves them alone.
  [double]$Lift = 1.45,

  # How much warm paper tone is laid over the top, as a percentage.
  [int]$Paper = 14,

  # Saturation, 0 = monochrome, 100 = untouched.
  [int]$Colour = 20
)

# Find ImageMagick. A terminal opened before the install still has the old PATH,
# so try that first, then reload PATH from the registry, then go looking.
$magick = (Get-Command magick -ErrorAction SilentlyContinue).Source

if (-not $magick) {
  $env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" +
              [Environment]::GetEnvironmentVariable("Path","User")
  $magick = (Get-Command magick -ErrorAction SilentlyContinue).Source
}

if (-not $magick) {
  $magick = Get-ChildItem "$env:ProgramFiles\ImageMagick*","${env:ProgramFiles(x86)}\ImageMagick*" `
              -Filter magick.exe -Recurse -ErrorAction SilentlyContinue |
            Select-Object -First 1 -ExpandProperty FullName
}

if (-not $magick) {
  Write-Host "ImageMagick not found." -ForegroundColor Red
  Write-Host "Install it from https://imagemagick.org/script/download.php#windows"
  Write-Host "If you just installed it, open a new terminal and try again."
  exit 1
}

Write-Host "Using: $magick" -ForegroundColor DarkGray

# Six cards with enough range to judge a style: a figure, a busy night scene,
# a dramatic one, and three scenic pips.
$sample = @(
  'RWS_Tarot_00_Fool.jpg','RWS_Tarot_18_Moon.jpg','RWS_Tarot_16_Tower.jpg',
  'Swords03.jpg','Pents05.jpg','Wands08.jpg'
)

# -- the treatments -----------------------------------------------------------
# Each is an argument list applied between input and output.

# Two rules learned the hard way, and both are about the dark cards:
#
#   Never clip the black point. -level 5%,95% turns every dark hatched area
#   into one solid mass, which is most of the Five of Pentacles. Lift the
#   shadows with gamma instead, and only pull the white point.
#
#   Never use -paint on this artwork. It merges neighbouring pixels, and the
#   linework here is fine hatching — it turns texture into blobs and takes the
#   crutches and mullions with it.

$styles = @{
  # Muted grey-blue wash on warm paper. Colour drained rather than removed, so
  # the pinks and blues survive faintly.
  'wash' = @(
    '-modulate',"100,$Colour,100",
    '-gamma',"$Lift",                    # open the shadows first
    '-level',"0%,96%",                   # white point only, black left alone
    '-brightness-contrast','2x-16',
    '-blur','0x0.25',                    # barely, just to take the edge off
    '-fill','#F2EDE1','-colorize',"$Paper%",
    '-attenuate','0.12','+noise','Gaussian'
  )

  # Monochrome, closer to a printed engraving. Still lifted, still unclipped.
  'ink' = @(
    '-colorspace','Gray',
    '-gamma',"$Lift",
    '-level','0%,94%',
    '-brightness-contrast','3x6',
    '-fill','#EDE7DA','-colorize',"$([Math]::Max(4,$Paper-6))%"
  )

  # Gentlest: keeps more colour, flattens contrast, sun-bleached.
  'faded' = @(
    '-modulate',"104,$([Math]::Min(100,$Colour+22)),100",
    '-gamma',"$([Math]::Round($Lift + 0.1,2))",
    '-level','0%,95%',
    '-brightness-contrast','4x-20',
    '-fill','#F4EFE4','-colorize',"$([Math]::Min(30,$Paper+4))%"
  )
}

$args = $styles[$Style]

New-Item -ItemType Directory -Force -Path $Dest | Out-Null

$files = Get-ChildItem -LiteralPath $Source -Filter *.jpg -File
if ($Card)      { $files = $files | Where-Object { $_.Name -eq $Card } }
elseif ($Only -gt 0) { $files = $files | Where-Object { $sample -contains $_.Name } }

if (-not $files) { Write-Host "No matching files in $Source" -ForegroundColor Red; exit 1 }

Write-Host "Style: $Style   lift $Lift   paper $Paper%   colour $Colour%" -ForegroundColor Cyan
Write-Host "Cards: $($files.Count)  ->  $Dest`n"

$n = 0
foreach ($f in $files) {
  $out = Join-Path $Dest $f.Name
  & $magick $f.FullName @args $out
  if ($LASTEXITCODE -ne 0) { Write-Host "  failed: $($f.Name)" -ForegroundColor Red }
  else { $n++ }
}

Write-Host "`n$n of $($files.Count) written." -ForegroundColor Green
Write-Host "Now open Sage -> Settings -> Card artwork and pick 'Painted' to compare."
