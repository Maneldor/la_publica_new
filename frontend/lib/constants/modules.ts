// Mòduls disponibles per la pàgina Avui
// Mapejats als components existents a app/dashboard/agenda/components/modules/

export const AVAILABLE_MODULES = [
  { id: 'gratitude', name: 'Agraïments', icon: 'Heart', description: 'Escriu tres coses per les que estàs agraït', component: 'AgraïmentsModule' },
  { id: 'challenge', name: 'Desafiament 21 dies', icon: 'Flame', description: 'Repte de 21 dies per crear nous hàbits', component: 'DesafiamentModule' },
  { id: 'conclusions', name: 'Conclusions', icon: 'FileText', description: 'Conclusions i reflexions del dia', component: 'ConclusionsModule' },
  { id: 'readings', name: 'Les meves lectures', icon: 'BookOpen', description: 'Registra i segueix les teves lectures', component: 'LecturesModule' },
  { id: 'travels', name: 'Els meus viatges', icon: 'Plane', description: 'Planifica i recorda els teus viatges', component: 'ViatgesModule' },
  { id: 'triangles', name: '6 Triangles de la vida', icon: 'Triangle', description: 'Equilibri entre les àrees vitals', component: 'TrianglesModule' },
  { id: 'capsule', name: 'Càpsula del temps', icon: 'Clock', description: 'Missatges al teu jo futur', component: 'CapsulaModule' },
  { id: 'visualizations', name: 'Visualitzacions', icon: 'Eye', description: 'Visualitza els teus objectius', component: 'VisualitzacionsModule' },
  { id: 'diary', name: 'Diari Privat', icon: 'Lock', description: 'El teu espai privat de reflexió', component: 'DiariPrivatModule' },
  { id: 'contacts', name: 'Contactes', icon: 'Users', description: 'Gestiona contactes importants', component: 'ContactsModule' },
] as const

export type ModuleId = typeof AVAILABLE_MODULES[number]['id']

export function getModuleById(id: string) {
  return AVAILABLE_MODULES.find(m => m.id === id)
}
