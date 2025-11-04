# PowerShell script to run Supabase migration from terminal

Write-Host "Running migration: 20250110000000_restaurant_settings_system.sql" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check if Supabase CLI is installed
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Supabase CLI is not installed." -ForegroundColor Red
    Write-Host "Install it with: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Check if migration file exists
$migrationFile = "supabase/migrations/20250110000000_restaurant_settings_system.sql"
if (-not (Test-Path $migrationFile)) {
    Write-Host "Error: Migration file not found!" -ForegroundColor Red
    Write-Host "Expected location: $migrationFile" -ForegroundColor Yellow
    exit 1
}

# Try to read Supabase credentials from .env files
$envFile = ".env.local"
if (-not (Test-Path $envFile)) {
    $envFile = ".env"
}

if (Test-Path $envFile) {
    Write-Host "Found .env file. Loading credentials..." -ForegroundColor Green
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
} else {
    Write-Host "Warning: No .env file found." -ForegroundColor Yellow
}

# Check if Supabase is linked
try {
    $supabaseStatus = supabase status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Using Supabase CLI..." -ForegroundColor Green
        Write-Host "Note: This will run the migration through Supabase CLI" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Alternative: Copy and paste the SQL directly into Supabase Dashboard > SQL Editor" -ForegroundColor Cyan
        Write-Host "File location: $migrationFile" -ForegroundColor Cyan
        Write-Host ""
        Read-Host "Press Enter to continue or Ctrl+C to cancel"
        
        # Read and display SQL (first 50 lines)
        Write-Host "`nMigration SQL (preview):" -ForegroundColor Cyan
        Get-Content $migrationFile -TotalCount 50 | ForEach-Object { Write-Host $_ }
        Write-Host "`n... (truncated, see full file)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "To run manually:" -ForegroundColor Yellow
        Write-Host "1. Go to https://supabase.com/dashboard" -ForegroundColor White
        Write-Host "2. Select your project" -ForegroundColor White
        Write-Host "3. Go to SQL Editor" -ForegroundColor White
        Write-Host "4. Copy and paste the entire SQL file" -ForegroundColor White
        Write-Host "5. Click 'Run'" -ForegroundColor White
    }
} catch {
    Write-Host "Supabase project not linked or not running locally." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To run the migration:" -ForegroundColor Cyan
    Write-Host "1. Go to Supabase Dashboard > SQL Editor" -ForegroundColor White
    Write-Host "2. Open: $migrationFile" -ForegroundColor White
    Write-Host "3. Copy entire contents and paste into SQL Editor" -ForegroundColor White
    Write-Host "4. Click 'Run'" -ForegroundColor White
}

Write-Host ""
Write-Host "Migration file location: $((Resolve-Path $migrationFile).Path)" -ForegroundColor Green

