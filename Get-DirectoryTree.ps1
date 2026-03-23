function Get-DirectoryTree {
    param(
        [string]$Path = ".",
        [int]$MaxDepth = 3,
        [int]$CurrentDepth = 0,
        [string]$Indent = "",
        [string[]]$ExcludeFolders = @("node_modules", ".git", "bin", "obj", "debug", "release", "dist", "build", ".vs", ".vscode", ".idea")
    )
    
    # Check if we've reached max depth
    if ($CurrentDepth -ge $MaxDepth) {
        return
    }
    
    # Get the full path
    try {
        $fullPath = Resolve-Path $Path -ErrorAction Stop
    } catch {
        Write-Host "Error: Path '$Path' not found" -ForegroundColor Red
        return
    }
    
    # Get all items in current directory
    try {
        $items = Get-ChildItem -Path $fullPath -Force -ErrorAction SilentlyContinue | Sort-Object { $_.PSIsContainer -eq $false }, Name
    } catch {
        return
    }
    
    $itemCount = $items.Count
    $index = 0
    
    foreach ($item in $items) {
        $index++
        $isLast = ($index -eq $itemCount)
        
        # Determine the prefix for the current item (using ASCII characters)
        if ($isLast) {
            $prefix = "+-- "
            $newIndent = $Indent + "    "
        } else {
            $prefix = "|-- "
            $newIndent = $Indent + "|   "
        }
        
        # Check if it's a directory
        if ($item.PSIsContainer) {
            # Skip excluded folders
            if ($ExcludeFolders -contains $item.Name) {
                Write-Host "$Indent$prefix[DIR] $($item.Name)/ (excluded)" -ForegroundColor DarkGray
                continue
            }
            
            # Output directory
            Write-Host "$Indent$prefix[DIR] $($item.Name)/" -ForegroundColor Cyan
            
            # Recurse into subdirectory
            Get-DirectoryTree -Path $item.FullName -MaxDepth $MaxDepth -CurrentDepth ($CurrentDepth + 1) -Indent $newIndent -ExcludeFolders $ExcludeFolders
        } else {
            # Output file
            $size = Get-FileSize $item.Length
            Write-Host "$Indent$prefix[FILE] $($item.Name) ($size)" -ForegroundColor White
        }
    }
}

function Get-FileSize {
    param([long]$bytes)
    
    if ($bytes -ge 1GB) {
        return "{0:N2} GB" -f ($bytes / 1GB)
    } elseif ($bytes -ge 1MB) {
        return "{0:N2} MB" -f ($bytes / 1MB)
    } elseif ($bytes -ge 1KB) {
        return "{0:N2} KB" -f ($bytes / 1KB)
    } else {
        return "$bytes B"
    }
}

# Alternative function that returns text instead of writing to console
function Get-DirectoryTreeText {
    param(
        [string]$Path = ".",
        [int]$MaxDepth = 3,
        [int]$CurrentDepth = 0,
        [string]$Indent = "",
        [string[]]$ExcludeFolders = @("node_modules", ".git", "bin", "obj", "debug", "release", "dist", "build", ".vs", ".vscode", ".idea")
    )
    
    $output = ""
    
    # Check if we've reached max depth
    if ($CurrentDepth -ge $MaxDepth) {
        return ""
    }
    
    # Get the full path
    try {
        $fullPath = Resolve-Path $Path -ErrorAction Stop
    } catch {
        return "Error: Path '$Path' not found`n"
    }
    
    # Get all items in current directory
    try {
        $items = Get-ChildItem -Path $fullPath -Force -ErrorAction SilentlyContinue | Sort-Object { $_.PSIsContainer -eq $false }, Name
    } catch {
        return ""
    }
    
    $itemCount = $items.Count
    $index = 0
    
    foreach ($item in $items) {
        $index++
        $isLast = ($index -eq $itemCount)
        
        # Determine the prefix for the current item (using ASCII characters)
        if ($isLast) {
            $prefix = "+-- "
            $newIndent = $Indent + "    "
        } else {
            $prefix = "|-- "
            $newIndent = $Indent + "|   "
        }
        
        # Check if it's a directory
        if ($item.PSIsContainer) {
            # Skip excluded folders
            if ($ExcludeFolders -contains $item.Name) {
                $output += "$Indent$prefix[DIR] $($item.Name)/ (excluded)`n"
                continue
            }
            
            # Add directory to output
            $output += "$Indent$prefix[DIR] $($item.Name)/`n"
            
            # Recurse into subdirectory
            $output += Get-DirectoryTreeText -Path $item.FullName -MaxDepth $MaxDepth -CurrentDepth ($CurrentDepth + 1) -Indent $newIndent -ExcludeFolders $ExcludeFolders
        } else {
            # Add file to output
            $size = Get-FileSize $item.Length
            $output += "$Indent$prefix[FILE] $($item.Name) ($size)`n"
        }
    }
    
    return $output
}

# Simple function for quick output
function Get-SimpleTree {
    param(
        [string]$Path = ".",
        [int]$Levels = 2
    )
    
    Write-Host "`nDirectory: $Path" -ForegroundColor Yellow
    Write-Host "=" * 50 -ForegroundColor Yellow
    
    # Get directories first
    $dirs = Get-ChildItem -Path $Path -Directory -ErrorAction SilentlyContinue | Sort-Object Name
    foreach ($dir in $dirs) {
        Write-Host "[DIR]  $($dir.Name)/" -ForegroundColor Cyan
        
        if ($Levels -gt 1) {
            $subDirs = Get-ChildItem -Path $dir.FullName -Directory -ErrorAction SilentlyContinue | Sort-Object Name
            foreach ($subDir in $subDirs) {
                Write-Host "  [DIR]  $($subDir.Name)/" -ForegroundColor Cyan
            }
            
            $files = Get-ChildItem -Path $dir.FullName -File -ErrorAction SilentlyContinue | Sort-Object Name
            foreach ($file in $files) {
                $size = Get-FileSize $file.Length
                Write-Host "  [FILE] $($file.Name) ($size)" -ForegroundColor White
            }
        }
    }
    
    # Get files in root
    $rootFiles = Get-ChildItem -Path $Path -File -ErrorAction SilentlyContinue | Sort-Object Name
    foreach ($file in $rootFiles) {
        $size = Get-FileSize $file.Length
        Write-Host "[FILE] $($file.Name) ($size)" -ForegroundColor White
    }
}

# Main script execution
Write-Host "`n=== DIRECTORY TREE STRUCTURE ===" -ForegroundColor Green
Write-Host "Path: $(Resolve-Path .)`n" -ForegroundColor Yellow

# Option 1: Detailed tree view
Write-Host "`n--- DETAILED TREE VIEW ---" -ForegroundColor Green
Get-DirectoryTree -Path "." -MaxDepth 3 -ExcludeFolders @("node_modules", ".git", "bin", "obj", "debug", "release", "dist", "build", ".vs", ".vscode", ".idea")

# Option 2: Plain text version for chat (with code block)
Write-Host "`n--- COPY THIS TO CHAT ---" -ForegroundColor Green
Write-Host "```" -ForegroundColor Yellow
$textOutput = Get-DirectoryTreeText -Path "." -MaxDepth 3
Write-Host $textOutput
Write-Host "```" -ForegroundColor Yellow

# Option 3: Simple overview
Write-Host "`n--- SIMPLE OVERVIEW ---" -ForegroundColor Green
Get-SimpleTree -Path "." -Levels 2

# Option 4: Minimal version (just list files and folders)
Write-Host "`n--- MINIMAL LISTING ---" -ForegroundColor Green
Write-Host "FOLDERS:" -ForegroundColor Cyan
Get-ChildItem -Path "." -Directory | ForEach-Object { Write-Host "  $($_.Name)/" -ForegroundColor Cyan }

Write-Host "`nFILES:" -ForegroundColor White
Get-ChildItem -Path "." -File | ForEach-Object { 
    $size = Get-FileSize $_.Length
    Write-Host "  $($_.Name) ($size)" -ForegroundColor White 
}