const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api/v1';

// Token de admin - deberías obtenerlo del login
const ADMIN_TOKEN = 'tu_token_aqui'; // Cambiar por token real

const sampleGroups = [
  {
    name: 'Desenvolupadors Frontend',
    description: 'Codificant el futur, un component cada cop. Compartim coneixements sobre React, Vue, Angular i les últimes tecnologies frontend.',
    category: 'Tecnologia',
    visibility: 'PUBLIC',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop'
  },
  {
    name: 'Disseny UX/UI',
    description: 'Creant experiències que importen. Explorarem les millors pràctiques en disseny d\'interfícies i experiència d\'usuari.',
    category: 'Disseny',
    visibility: 'PUBLIC',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop'
  },
  {
    name: 'Marketing Digital',
    description: 'Connectant marques amb persones. Estratègies innovadores de màrqueting digital i xarxes socials.',
    category: 'Marketing',
    visibility: 'PUBLIC',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop'
  },
  {
    name: 'Emprenedors Catalunya',
    description: 'Transformant idees en realitat. Comunitat d\'emprenedors i startups catalanes.',
    category: 'Negocis',
    visibility: 'PUBLIC',
    imageUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop'
  },
  {
    name: 'Projecte Alpha',
    description: 'Innovació confidencial en desenvolupament. Equip exclusiu per a projectes d\'alta tecnologia.',
    category: 'R&D',
    visibility: 'PRIVATE',
    imageUrl: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=300&fit=crop'
  },
  {
    name: 'Consultors Senior',
    description: 'Experiència al servei de l\'excel·lència. Grup de consultors amb més de 5 anys d\'experiència.',
    category: 'Consultoria',
    visibility: 'PRIVATE',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop'
  }
];

async function createGroups() {
  console.log('🚀 Creant grups d\'exemple...');

  for (const group of sampleGroups) {
    try {
      const response = await fetch(`${API_BASE}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        },
        body: JSON.stringify(group)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Grup creat: ${group.name}`);
      } else {
        const error = await response.json();
        console.log(`❌ Error creant ${group.name}:`, error.message);
      }
    } catch (err) {
      console.log(`❌ Error de connexió creant ${group.name}:`, err.message);
    }
  }

  console.log('🎉 Procés completat!');
}

// Ejecutar
createGroups();