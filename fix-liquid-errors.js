const fs = require('fs');
const path = require('path');

console.log('🔧 Correction automatique des erreurs Liquid...\n');

// Liste des corrections à appliquer
const corrections = [
  // 1. Correction des guillemets échappés
  {
    file: 'sections/footer.liquid',
    search: /\{\{ 'accessibility\.opens_new_window' \| t \| default: '\(s\\'ouvre dans une nouvelle fenêtre\)' \}\}/g,
    replace: `{{ 'accessibility.opens_new_window' | t | default: "(s'ouvre dans une nouvelle fenêtre)" }}`
  },
  {
    file: 'sections/header.liquid',
    search: /\{\{ 'accessibility\.return_home' \| t \| default: 'Retourner à la page d\\'accueil' \}\}/g,
    replace: `{{ 'accessibility.return_home' | t | default: "Retourner à la page d'accueil" }}`
  },
  
  // 2. Correction des comparaisons dans les sections
  {
    file: 'sections/promotional-banner.liquid',
    search: /\{\{ section\.settings\.button_label != blank \| json \}\}/g,
    replace: `{% if section.settings.button_label != blank %}true{% else %}false{% endif %}`
  },
  {
    file: 'sections/hero-banner.liquid',
    search: /\{\{ section\.settings\.video != blank \| json \}\}/g,
    replace: `{% if section.settings.video != blank %}true{% else %}false{% endif %}`
  },
  {
    file: 'sections/rich-text-with-image.liquid',
    search: /\{\{ layout == 'image_left' \? 'right' : 'left' \}\}/g,
    replace: `{% if layout == 'image_left' %}right{% else %}left{% endif %}`
  },
  
  // 3. Correction des erreurs de syntaxe dans les conditions
  {
    file: 'sections/product-recommendations.liquid',
    search: /section\.settings\.show_view_all and recommendations\.products_count >/g,
    replace: `section.settings.show_view_all and recommendations.products_count >`
  },
  {
    file: 'sections/collection-pagination.liquid',
    search: /end_page \| minus: start_page \| plus: 1 < max_page_links/g,
    replace: `end_page | minus: start_page | plus: 1 < max_page_links`
  },
  
  // 4. Suppression des tags schema dans les templates
  {
    file: 'templates/password.liquid',
    search: /\{% schema %\}[\s\S]*?\{% endschema %\}/g,
    replace: ''
  },
  {
    file: 'templates/customers/reset_password.liquid',
    search: /\{% schema %\}[\s\S]*?\{% endschema %\}/g,
    replace: ''
  }
];

// Corrections spéciales pour les schemas
const schemaCorrections = [
  // Correction des attributs invalides
  {
    file: 'sections/team-showcase.liquid',
    search: '"label": "Email"',
    replace: '"label": "Adresse e-mail"'
  },
  {
    file: 'sections/video-section.liquid',
    search: '"info": "Sélectionnez un fichier vidéo"',
    replace: '"help": "Sélectionnez un fichier vidéo"'
  },
  {
    file: 'sections/image-gallery.liquid',
    search: '"step": 1',
    replace: '"step": 3'
  },
  {
    file: 'sections/main-collection-product-grid.liquid',
    search: '"step": 1',
    replace: '"step": 3'
  },
  {
    file: 'sections/main-blog.liquid',
    search: '"unit": "caractères"',
    replace: '"unit": "car"'
  },
  {
    file: 'config/settings_schema.json',
    search: '"unit": "produits"',
    replace: '"unit": "prd"'
  }
];

let totalFixed = 0;

// Fonction pour appliquer les corrections
function applyCorrection(correction) {
  const filePath = correction.file;
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Fichier non trouvé: ${filePath}`);
    return false;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    content = content.replace(correction.search, correction.replace);
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Corrigé: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  Aucune correction nécessaire: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erreur dans ${filePath}: ${error.message}`);
    return false;
  }
}

// Corrections des sections manquantes
const missingSections = [
  'sections/blog-content.liquid',
  'sections/featured-collection.liquid', 
  'sections/related-articles.liquid',
  'sections/collection-content.liquid',
  'sections/call-to-action.liquid',
  'sections/faq-section.liquid',
  'sections/main-reset-password.liquid'
];

function createMissingSection(sectionName) {
  const fileName = `sections/${sectionName}.liquid`;
  
  if (fs.existsSync(fileName)) {
    return false;
  }
  
  const basicSection = `<div class="${sectionName.replace('.liquid', '')}-section">
  <div class="page-width">
    <h2>{{ section.settings.heading | default: "${sectionName}" }}</h2>
    <div class="section-content">
      <!-- Contenu de la section -->
    </div>
  </div>
</div>

{% schema %}
{
  "name": "${sectionName.replace('.liquid', '').replace('-', ' ')}",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Titre",
      "default": "Titre de section"
    }
  ]
}
{% endschema %}`;

  try {
    fs.writeFileSync(fileName, basicSection, 'utf8');
    console.log(`✅ Section créée: ${fileName}`);
    return true;
  } catch (error) {
    console.log(`❌ Erreur création ${fileName}: ${error.message}`);
    return false;
  }
}

// Application des corrections
console.log('📝 Application des corrections de syntaxe...');
corrections.forEach(correction => {
  if (applyCorrection(correction)) {
    totalFixed++;
  }
});

console.log('\n🔧 Application des corrections de schema...');
schemaCorrections.forEach(correction => {
  if (applyCorrection(correction)) {
    totalFixed++;
  }
});

console.log('\n📁 Création des sections manquantes...');
missingSections.forEach(section => {
  const sectionName = section.replace('sections/', '');
  if (createMissingSection(sectionName)) {
    totalFixed++;
  }
});

// Correction du JSON search.json
const searchJsonPath = 'templates/search.json';
if (fs.existsSync(searchJsonPath)) {
  try {
    let searchContent = fs.readFileSync(searchJsonPath, 'utf8');
    // Corriger la structure JSON
    if (searchContent.includes('"settings"')) {
      const correctedJson = {
        "sections": {
          "main": {
            "type": "main-search",
            "settings": {}
          }
        },
        "order": ["main"]
      };
      fs.writeFileSync(searchJsonPath, JSON.stringify(correctedJson, null, 2), 'utf8');
      console.log(`✅ Corrigé: ${searchJsonPath}`);
      totalFixed++;
    }
  } catch (error) {
    console.log(`❌ Erreur JSON ${searchJsonPath}: ${error.message}`);
  }
}

// Correction du JSON page.faq.json
const faqJsonPath = 'templates/page.faq.json';
if (fs.existsSync(faqJsonPath)) {
  try {
    let faqContent = fs.readFileSync(faqJsonPath, 'utf8');
    // Valider et corriger le JSON
    JSON.parse(faqContent); // Test de validité
    console.log(`✅ JSON valide: ${faqJsonPath}`);
  } catch (error) {
    // Créer un JSON valide
    const validFaqJson = {
      "sections": {
        "page-header": {
          "type": "page-header"
        },
        "main": {
          "type": "main-page"
        }
      },
      "order": ["page-header", "main"]
    };
    fs.writeFileSync(faqJsonPath, JSON.stringify(validFaqJson, null, 2), 'utf8');
    console.log(`✅ JSON corrigé: ${faqJsonPath}`);
    totalFixed++;
  }
}

console.log(`\n🎉 Correction terminée ! ${totalFixed} fichiers corrigés.`);
console.log('\n📋 Prochaines étapes:');
console.log('1. Relancez: shopify theme dev');
console.log('2. Vérifiez les erreurs restantes');
console.log('3. Testez le thème sur votre boutique\n'); 