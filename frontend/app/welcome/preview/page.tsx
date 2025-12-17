// app/welcome/preview/page.tsx
// Página de preview para visualizar el WelcomeExperience sin verificar onboarding
import { WelcomeExperience } from '../WelcomeExperience'

export default function WelcomePreviewPage() {
  return <WelcomeExperience userName="Laura" userId="preview-user" />
}
