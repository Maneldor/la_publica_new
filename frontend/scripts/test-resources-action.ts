// test-resources-action.ts - Script para probar la acción getResources
import { getResources } from '../lib/gestio-empreses/actions/resources-actions'

async function testGetResources() {
  console.log('🧪 Testing getResources action...')

  try {
    console.log('📞 Calling getResources with no filters...')
    const result = await getResources({}, 'test-user', 'ADMIN')

    console.log('✅ Result:', result)

    if (result.success && result.data) {
      console.log(`📊 Found ${result.data.length} resources:`)
      result.data.forEach((resource, index) => {
        console.log(`${index + 1}. ${resource.title} (${resource.type})`)
      })
    } else {
      console.error('❌ Error:', result.error)
    }
  } catch (error) {
    console.error('💥 Exception:', error)
  }
}

testGetResources()
  .then(() => {
    console.log('✨ Test completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💀 Fatal error:', error)
    process.exit(1)
  })