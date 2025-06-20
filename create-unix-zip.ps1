# Script pour creer un ZIP avec des chemins Unix pour Shopify
Write-Host "Creation du ZIP avec chemins Unix pour Shopify..." -ForegroundColor Cyan

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$ZipPath = "taiga-bubbly-shopify-unix.zip"

# Supprimer le fichier s'il existe
if (Test-Path $ZipPath) {
    Remove-Item $ZipPath -Force
    Write-Host "Ancien fichier ZIP supprime" -ForegroundColor Green
}

# Creer un nouveau ZIP vide
$zip = [System.IO.Compression.ZipFile]::Open($ZipPath, [System.IO.Compression.ZipArchiveMode]::Create)

# Fonction pour ajouter un fichier avec chemin Unix
function Add-FileToZip {
    param($FilePath, $ZipEntry, $ZipArchive)
    
    if (Test-Path $FilePath) {
        $entry = $ZipArchive.CreateEntry($ZipEntry)
        $entryStream = $entry.Open()
        $fileStream = [System.IO.File]::OpenRead($FilePath)
        $fileStream.CopyTo($entryStream)
        $fileStream.Close()
        $entryStream.Close()
        Write-Host "   Ajoute: $ZipEntry" -ForegroundColor Green
    } else {
        Write-Host "   ERREUR: $FilePath non trouve!" -ForegroundColor Red
    }
}

# Fonction pour ajouter tous les fichiers d'un dossier
function Add-FolderToZip {
    param($FolderPath, $ZipFolderName, $ZipArchive)
    
    if (Test-Path $FolderPath) {
        $files = Get-ChildItem -Path $FolderPath -File -Recurse
        foreach ($file in $files) {
            $relativePath = $file.FullName.Substring((Get-Item $FolderPath).FullName.Length + 1)
            $unixPath = "$ZipFolderName/" + $relativePath.Replace('\', '/')
            Add-FileToZip -FilePath $file.FullName -ZipEntry $unixPath -ZipArchive $zip
        }
    }
}

Write-Host "Ajout des dossiers au ZIP..." -ForegroundColor Yellow

# Ajouter tous les dossiers requis
$folders = @("assets", "config", "layout", "locales", "sections", "snippets", "templates")

foreach ($folder in $folders) {
    Write-Host "Traitement du dossier: $folder" -ForegroundColor Cyan
    Add-FolderToZip -FolderPath $folder -ZipFolderName $folder -ZipArchive $zip
}

# Fermer le ZIP
$zip.Dispose()

Write-Host "ZIP cree avec succes: $ZipPath" -ForegroundColor Green
$FileSize = [math]::Round((Get-Item $ZipPath).Length / 1KB, 2)
Write-Host "Taille: $FileSize KB" -ForegroundColor Cyan 