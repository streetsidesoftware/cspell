# Sample powershell file from Rob van der Woude
# cspell:enablecompoundwords
param(
	[switch]$Available,
	[switch]$Used,
	[switch]$h,
	[switch]$V
)

if ( $h ) {
	Write-Host
	Write-Host "Drives.ps1,  Version 1.01"
	Write-Host "List all available and/or used drive letters"
	Write-Host
	Write-Host "Usage:  " -NoNewline
	Write-Host "./Drives.ps1  [ -Available | -Used ]  [ -V ]" -ForegroundColor White
	Write-Host
	Write-Host "Where:  " -NoNewline
	Write-Host "-Available    " -ForegroundColor White -NoNewline
	Write-Host "displays " -NoNewline
	Write-Host "available " -ForegroundColor White -NoNewline
	Write-Host "drive letters (default: all)"
	Write-Host "        -Used         " -ForegroundColor White -NoNewline
	Write-Host "displays drive letters " -NoNewline
	Write-Host "in use    " -ForegroundColor White -NoNewline
	Write-Host "(default: all)"
	Write-Host "        -V            " -ForegroundColor White -NoNewline
	Write-Host "explains what is displayed       (see notes)"
	Write-Host
	Write-Host "Notes:  This script doesn't require elevated privileges."
	Write-Host "        If either the " -NoNewline
	Write-Host "-Available " -ForegroundColor White -NoNewline
	Write-Host "or the " -NoNewline
	Write-Host "-Used " -ForegroundColor White -NoNewline
	Write-Host "switch is used, but not"
	Write-Host "        both, only the drive letters themselves are displayed, not the"
	Write-Host "        explaining text, unless the " -NoNewline
	Write-Host "-V " -ForegroundColor White -NoNewline
	Write-Host "switch is also used."
	Write-Host "        If both " -NoNewline
	Write-Host "-Available " -ForegroundColor White -NoNewline
	Write-Host "and " -NoNewline
	Write-Host "-Used " -ForegroundColor White -NoNewline
	Write-Host "are used, " -NoNewline
	Write-Host "-V " -ForegroundColor White -NoNewline
	Write-Host "is implied."
	Write-Host "        Though this script can be run in PowerShell on Linux, that"
	Write-Host "        would be useless because Linux doesn't use drive letters."
	Write-Host
	Write-Host "Written by Rob van der Woude"
	Write-Host "http://www.robvanderwoude.com"
	Exit 1
}

# List all drive letters in use
$useddrives = @( )
Get-PSDrive -PSProvider FileSystem | ForEach-Object { $useddrives += $_.Name }

# List all drive letters still available
$availabledrives = @( )
[int][char]"A"..[int][char]"Z" | ForEach-Object {
	[string]$drive = [string][char][int]$_
	if ( -not ( $useddrives.Contains( "$drive" ) ) ) {
		$availabledrives += $drive
	}
}

# Display list of drive letters in use
if ( $Used -or -not $Available ) {
	if ( $V -or -not ( $Available -xor $Used ) ) {
		Write-Host "Drive Letters In Use:   " -NoNewline
	}
	$useddrives | ForEach-Object { Write-Host " $_" -NoNewline; Write-Host ":" -NoNewline }
	Write-Host
}

# Display list of available drive letters
if ( $Available -or -not $Used ) {
	if ( $V -or -not ( $Available -xor $Used ) ) {
		Write-Host "Available Drive Letters:" -NoNewline
	}
	$availabledrives | ForEach-Object { Write-Host " $_" -NoNewline; Write-Host ":" -NoNewline }
	Write-Host
}
