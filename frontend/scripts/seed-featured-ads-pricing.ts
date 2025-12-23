/**
 * Script per fer seed dels preus d'anuncis destacats
 * Executar amb: npx tsx scripts/seed-featured-ads-pricing.ts
 */

import { seedFeaturedAdPricing } from '../lib/services/featuredAdsService'

async function main() {
  console.log('🌱 Iniciant seed de preus d\'anuncis destacats...')

  try {
    await seedFeaturedAdPricing()
    console.log('✅ Seed completat correctament!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error durant el seed:', error)
    process.exit(1)
  }
}

main()
