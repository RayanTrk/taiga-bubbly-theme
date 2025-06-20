const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Vérification du fichier ZIP pour Shopify...\n');

const zipFile = 'taiga-bubbly-shopify-theme.zip';

// Vérifier que le ZIP existe
if (!fs.existsSync(zipFile)) {
    console.error('❌ Fichier ZIP non trouvé:', zipFile);
    process.exit(1);
}

console.log('📊 Taille du fichier:', Math.round(fs.statSync(zipFile).size / 1024), 'KB');

// Lister le contenu du ZIP avec tar
try {
    console.log('\n📁 Contenu du ZIP:');
    const content = execSync(`tar -tf ${zipFile}`, { encoding: 'utf8' });
    const files = content.trim().split('\n');
    
    // Vérifier les dossiers requis par Shopify
    const requiredFolders = ['assets/', 'config/', 'layout/', 'locales/', 'sections/', 'snippets/', 'templates/'];
    const requiredFiles = ['layout/theme.liquid', 'config/settings_schema.json'];
    
    console.log('\n✅ Dossiers requis:');
    requiredFolders.forEach(folder => {
        const hasFolder = files.some(file => file.startsWith(folder));
        console.log(`   ${hasFolder ? '✅' : '❌'} ${folder}`);
    });
    
    console.log('\n✅ Fichiers critiques:');
    requiredFiles.forEach(file => {
        const hasFile = files.includes(file);
        console.log(`   ${hasFile ? '✅' : '❌'} ${file}`);
    });
    
    // Vérifier theme.liquid spécifiquement
    const themeFile = files.find(file => file === 'layout/theme.liquid');
    if (themeFile) {
        console.log('\n🎉 SUCCÈS: layout/theme.liquid trouvé dans le ZIP!');
        console.log('✅ Le thème devrait être accepté par Shopify.');
    } else {
        console.log('\n❌ ERREUR: layout/theme.liquid manquant!');
        process.exit(1);
    }
    
    console.log('\n📋 Résumé:');
    console.log(`   📁 Total de fichiers: ${files.length}`);
    console.log(`   📦 Nom du fichier: ${zipFile}`);
    console.log(`   💾 Taille: ${Math.round(fs.statSync(zipFile).size / 1024)} KB`);
    console.log('\n🚀 Prêt pour téléversement sur Shopify!');
    
} catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    process.exit(1);
} 