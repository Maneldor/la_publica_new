'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SimpleWizard from '@/components/wizard/SimpleWizard';
import {
  MessageSquare,
  Users,
  User,
  Building2,
  Clock,
  Settings,
  CheckCircle,
  Bell,
  Send,
  Calendar,
  Search,
  X
} from 'lucide-react';

interface MessageFormData {
  // Step 1 - Tipo de mensaje
  messageMode: 'individual' | 'massive';
  messageType: 'message' | 'announcement' | 'notification' | 'alert';

  // Step 2 - Destinatarios
  recipientType: 'all' | 'employees' | 'companies' | 'groups' | 'individual';
  selectedUsers: any[];
  selectedGroups: any[];
  groups: any[];
  recipients: any[];

  // Step 3 - Contenido
  title: string;
  content: string;
  preview: string;

  // Step 4 - Programación
  sendNow: boolean;
  scheduledDate: string;
  scheduledTime: string;

  // Step 5 - Opciones
  priority: 'normal' | 'high' | 'urgent';
  enableNotifications: boolean;
  bidirectional: boolean;

  // Step 6 - Revisión
  totalRecipients: number;
}

export default function CrearMissatgePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const [formData, setFormData] = useState<MessageFormData>({
    messageMode: 'individual',
    messageType: 'message',
    recipientType: 'individual',
    selectedUsers: [],
    selectedGroups: [],
    groups: [],
    recipients: [],
    title: '',
    content: '',
    preview: '',
    sendNow: true,
    scheduledDate: '',
    scheduledTime: '',
    priority: 'normal',
    enableNotifications: true,
    bidirectional: true,
    totalRecipients: 0
  });

  const steps = [
    { id: 1, title: 'Tipus', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 2, title: 'Destinataris', icon: <Users className="w-5 h-5" /> },
    { id: 3, title: 'Contingut', icon: <Send className="w-5 h-5" /> },
    { id: 4, title: 'Programació', icon: <Calendar className="w-5 h-5" /> },
    { id: 5, title: 'Opcions', icon: <Settings className="w-5 h-5" /> },
    { id: 6, title: 'Revisió', icon: <CheckCircle className="w-5 h-5" /> }
  ];

  const updateField = (field: keyof MessageFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleClose = () => {
    router.push('/admin/missatges');
  };

  const validateStep = (step: number): boolean => {
    const newErrors: any = {};

    switch (step) {
      case 1:
        if (!formData.messageMode) newErrors.messageMode = 'Selecciona un mode de missatge';
        if (!formData.messageType) newErrors.messageType = 'Selecciona un tipus de missatge';
        break;
      case 2:
        if (!formData.recipientType) newErrors.recipientType = 'Selecciona destinataris';
        if (formData.recipientType === 'individual' && formData.selectedUsers.length === 0) {
          newErrors.selectedUsers = 'Selecciona almenys un usuari';
        }
        if (formData.recipientType === 'groups' && formData.selectedGroups.length === 0) {
          newErrors.selectedGroups = 'Selecciona almenys un grup';
        }
        break;
      case 3:
        if (!formData.title.trim()) newErrors.title = 'El títol és obligatori';
        if (!formData.content.trim()) newErrors.content = 'El contingut és obligatori';
        break;
      case 4:
        if (!formData.sendNow && !formData.scheduledDate) {
          newErrors.scheduledDate = 'Selecciona una data';
        }
        if (!formData.sendNow && !formData.scheduledTime) {
          newErrors.scheduledTime = 'Selecciona una hora';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    try {
      // Crear el mensaje
      const messageData = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString(),
        status: formData.sendNow ? 'sent' : 'scheduled',
        totalRecipients: calculateTotalRecipients()
      };

      // Guardar en localStorage
      const existingMessages = JSON.parse(localStorage.getItem('adminMessages') || '[]');
      const updatedMessages = [...existingMessages, messageData];
      localStorage.setItem('adminMessages', JSON.stringify(updatedMessages));

      // Simular envío si es para enviar ahora
      if (formData.sendNow) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      router.push('/admin/missatges');
    } catch (error) {
      console.error('Error al crear el missatge:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalRecipients = (): number => {
    switch (formData.recipientType) {
      case 'all':
        return 1000; // Mock total users
      case 'employees':
        return 250; // Mock employees
      case 'companies':
        return 150; // Mock companies
      case 'groups':
        return formData.selectedGroups.reduce((total, group) => total + (group.memberCount || 0), 0);
      case 'individual':
        return formData.selectedUsers.length;
      default:
        return 0;
    }
  };

  // Actualizar bidireccional automáticamente
  useEffect(() => {
    const shouldBeBidirectional = formData.recipientType !== 'employees';
    updateField('bidirectional', shouldBeBidirectional);
  }, [formData.recipientType]);

  // Actualizar preview del contenido
  useEffect(() => {
    const preview = formData.content.length > 100
      ? formData.content.substring(0, 100) + '...'
      : formData.content;
    updateField('preview', preview);
  }, [formData.content]);

  // Actualizar total de destinatarios
  useEffect(() => {
    const total = calculateTotalRecipients();
    updateField('totalRecipients', total);
  }, [formData.recipientType, formData.selectedUsers, formData.selectedGroups]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1MessageType formData={formData} updateField={updateField} errors={errors} />;
      case 2:
        return <Step2Recipients formData={formData} updateField={updateField} errors={errors} />;
      case 3:
        return <Step3Content formData={formData} updateField={updateField} errors={errors} />;
      case 4:
        return <Step4Schedule formData={formData} updateField={updateField} errors={errors} />;
      case 5:
        return <Step5Options formData={formData} updateField={updateField} errors={errors} />;
      case 6:
        return <Step6Review formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <SimpleWizard
      title="Crear Nou Missatge"
      steps={steps}
      currentStep={currentStep}
      onClose={handleClose}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitText="Enviar Missatge"
      loadingText="Enviant..."
      showModal={true}
    >
      {renderStep()}
    </SimpleWizard>
  );
}

// Step 1: Tipo de mensaje
function Step1MessageType({ formData, updateField, errors }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Selecciona el tipus de missatge</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Mode de missatge</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => updateField('messageMode', 'individual')}
                className={`p-4 border rounded-lg transition-colors ${
                  formData.messageMode === 'individual'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-center">
                  <User className="w-8 h-8 mx-auto mb-2" />
                  <span className="font-medium">Individual</span>
                  <p className="text-sm text-gray-600">Missatge a usuaris específics</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => updateField('messageMode', 'massive')}
                className={`p-4 border rounded-lg transition-colors ${
                  formData.messageMode === 'massive'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-center">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <span className="font-medium">Massiu</span>
                  <p className="text-sm text-gray-600">Missatge a grups o tots</p>
                </div>
              </button>
            </div>
            {errors.messageMode && (
              <p className="mt-1 text-sm text-red-600">{errors.messageMode}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Tipus de missatge</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => updateField('messageType', 'message')}
                className={`p-4 border rounded-lg transition-colors ${
                  formData.messageType === 'message'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-center">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                  <span className="font-medium">Missatge</span>
                  <p className="text-sm text-gray-600">Comunicació estàndard</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => updateField('messageType', 'announcement')}
                className={`p-4 border rounded-lg transition-colors ${
                  formData.messageType === 'announcement'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-center">
                  <Bell className="w-8 h-8 mx-auto mb-2" />
                  <span className="font-medium">Anunci</span>
                  <p className="text-sm text-gray-600">Comunicació oficial</p>
                </div>
              </button>
            </div>
            {errors.messageType && (
              <p className="mt-1 text-sm text-red-600">{errors.messageType}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 2: Recipients
function Step2Recipients({ formData, updateField, errors }: any) {
  const recipientOptions = formData.messageMode === 'massive'
    ? [
        { value: 'all', label: 'Tots els usuaris', icon: <Users className="w-6 h-6" />, description: 'Enviar a tots els usuaris registrats' },
        { value: 'employees', label: 'Empleats públics', icon: <Building2 className="w-6 h-6" />, description: 'Només empleats del sector públic' },
        { value: 'companies', label: 'Empreses', icon: <Building2 className="w-6 h-6" />, description: 'Usuaris del sector privat' },
        { value: 'groups', label: 'Grups específics', icon: <Users className="w-6 h-6" />, description: 'Seleccionar grups concrets' }
      ]
    : [
        { value: 'individual', label: 'Usuaris individuals', icon: <User className="w-6 h-6" />, description: 'Seleccionar usuaris específics' }
      ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Selecciona els destinataris</h3>

        <div className="space-y-3">
          {recipientOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateField('recipientType', option.value)}
              className={`w-full p-4 border rounded-lg transition-colors text-left ${
                formData.recipientType === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center">
                <div className="mr-3">{option.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {errors.recipientType && (
          <p className="mt-1 text-sm text-red-600">{errors.recipientType}</p>
        )}

        {/* Mensaje sobre bidireccionalidad */}
        <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Nota sobre missatges bidireccionals:</strong>
                {formData.recipientType === 'employees' ? (
                  <span> Els missatges a empleats públics són <strong>unidireccionals</strong> (només admin pot escriure).</span>
                ) : (
                  <span> Els missatges a altres tipus d'usuaris són <strong>bidireccionals</strong> (poden respondre).</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Selección específica según el tipo */}
        {formData.recipientType === 'individual' && (
          <UserSelector
            selectedUsers={formData.selectedUsers}
            onUsersChange={(users) => updateField('selectedUsers', users)}
            error={errors.selectedUsers}
          />
        )}

        {formData.recipientType === 'groups' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grups seleccionats: {formData.selectedGroups.length}
            </label>
            <div className="border border-gray-300 rounded-lg p-4 min-h-32 bg-gray-50">
              <p className="text-sm text-gray-600">
                Aquí apareixeran els grups seleccionats. (Funcionalitat de selecció de grups per implementar)
              </p>
            </div>
            {errors.selectedGroups && (
              <p className="mt-1 text-sm text-red-600">{errors.selectedGroups}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Step 3: Content
function Step3Content({ formData, updateField, errors }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contingut del missatge</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Títol del missatge *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Informació important sobre..."
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contingut del missatge *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => updateField('content', e.target.value)}
              rows={8}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Escriu aquí el contingut del missatge..."
            />
            <div className="mt-1 flex justify-between text-sm text-gray-500">
              <span>{formData.content.length} caràcters</span>
              {errors.content && (
                <span className="text-red-600">{errors.content}</span>
              )}
            </div>
          </div>

          {formData.content && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Previsualització
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-900 mb-1">{formData.title}</div>
                <div className="text-sm text-gray-600">{formData.preview}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Step 4: Schedule
function Step4Schedule({ formData, updateField, errors }: any) {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toTimeString().slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Programació d\'enviament</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Quan enviar?</label>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => updateField('sendNow', true)}
                className={`w-full p-4 border rounded-lg transition-colors text-left ${
                  formData.sendNow
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center">
                  <Send className="w-6 h-6 mr-3 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">Enviar ara</div>
                    <div className="text-sm text-gray-600">El missatge s\'enviarà immediatament</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => updateField('sendNow', false)}
                className={`w-full p-4 border rounded-lg transition-colors text-left ${
                  !formData.sendNow
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center">
                  <Clock className="w-6 h-6 mr-3 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Programar enviament</div>
                    <div className="text-sm text-gray-600">Seleccionar data i hora específica</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {!formData.sendNow && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data d\'enviament *
                </label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => updateField('scheduledDate', e.target.value)}
                  min={today}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.scheduledDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.scheduledDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.scheduledDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora d\'enviament *
                </label>
                <input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => updateField('scheduledTime', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.scheduledTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.scheduledTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.scheduledTime}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Step 5: Options
function Step5Options({ formData, updateField, errors }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Opcions del missatge</h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Prioritat del missatge</label>
            <div className="space-y-2">
              {[
                { value: 'normal', label: 'Normal', description: 'Prioritat estàndard', color: 'gray' },
                { value: 'high', label: 'Alta', description: 'Missatge important', color: 'yellow' },
                { value: 'urgent', label: 'Urgent', description: 'Requereix atenció immediata', color: 'red' }
              ].map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => updateField('priority', priority.value)}
                  className={`w-full p-3 border rounded-lg transition-colors text-left ${
                    formData.priority === priority.value
                      ? `border-${priority.color}-500 bg-${priority.color}-50`
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{priority.label}</div>
                      <div className="text-sm text-gray-600">{priority.description}</div>
                    </div>
                    <div className={`w-4 h-4 rounded-full ${
                      priority.value === 'normal' ? 'bg-gray-400' :
                      priority.value === 'high' ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableNotifications"
                checked={formData.enableNotifications}
                onChange={(e) => updateField('enableNotifications', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="enableNotifications" className="ml-2 text-sm text-gray-700">
                🔔 Activar notificacions push
              </label>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="bidirectional"
                  checked={formData.bidirectional}
                  onChange={() => {}} // Disabled, controlled automatically
                  disabled={true}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                />
                <label htmlFor="bidirectional" className="ml-2 text-sm text-gray-700">
                  💬 Missatge bidireccional (els usuaris poden respondre)
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                {formData.recipientType === 'employees'
                  ? 'Desactivat automàticament per a empleats públics'
                  : 'Activat automàticament per a aquest tipus de destinatari'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 6: Review
function Step6Review({ formData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Revisió del missatge</h3>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <p className="text-sm text-blue-700">
            Revisa la informació abans d\'enviar el missatge
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900">Tipus de missatge</h4>
            <div className="mt-2 bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="text-sm"><span className="font-medium">Mode:</span> {formData.messageMode === 'individual' ? 'Individual' : 'Massiu'}</p>
              <p className="text-sm"><span className="font-medium">Tipus:</span> {
                formData.messageType === 'message' ? '💬 Missatge' :
                formData.messageType === 'announcement' ? '📢 Anunci' :
                formData.messageType === 'notification' ? '🔔 Notificació' : '⚠️ Alerta'
              }</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900">Destinataris</h4>
            <div className="mt-2 bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="text-sm"><span className="font-medium">Tipus:</span> {
                formData.recipientType === 'all' ? '👥 Tots els usuaris' :
                formData.recipientType === 'employees' ? '👔 Empleats públics' :
                formData.recipientType === 'companies' ? '🏢 Empreses' :
                formData.recipientType === 'groups' ? '👥 Grups seleccionats' : '👤 Usuaris individuals'
              }</p>
              <p className="text-sm"><span className="font-medium">Total destinataris:</span> {formData.totalRecipients}</p>
              <p className="text-sm"><span className="font-medium">Bidireccional:</span> {formData.bidirectional ? 'Sí' : 'No'}</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900">Contingut</h4>
            <div className="mt-2 bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="text-sm"><span className="font-medium">Títol:</span> {formData.title}</p>
              <p className="text-sm"><span className="font-medium">Contingut:</span></p>
              <div className="bg-white p-3 rounded border text-sm">{formData.content}</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900">Programació</h4>
            <div className="mt-2 bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="text-sm"><span className="font-medium">Enviament:</span> {
                formData.sendNow ? 'Ara mateix' : `${formData.scheduledDate} a les ${formData.scheduledTime}`
              }</p>
              <p className="text-sm"><span className="font-medium">Prioritat:</span> {
                formData.priority === 'normal' ? 'Normal' :
                formData.priority === 'high' ? 'Alta' : 'Urgent'
              }</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900">Opcions</h4>
            <div className="mt-2 bg-gray-50 p-4 rounded-lg">
              <ul className="text-sm space-y-1">
                {formData.enableNotifications && <li>✓ Notificacions activades</li>}
                {formData.bidirectional && <li>✓ Missatge bidireccional</li>}
                {!formData.bidirectional && <li>ℹ️ Missatge unidireccional (només admin)</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para seleccionar usuarios
function UserSelector({ selectedUsers, onUsersChange, error }: any) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Mock users - en un entorno real vendrían de una API
  const mockUsers = [
    { id: 1, name: 'Joan García', email: 'joan.garcia@email.com', role: 'Empleat públic', avatar: '👨‍💼' },
    { id: 2, name: 'Maria López', email: 'maria.lopez@empresa.com', role: 'Empresa', avatar: '👩‍💼' },
    { id: 3, name: 'Pere Martínez', email: 'pere.martinez@email.com', role: 'Ciutadà', avatar: '👨' },
    { id: 4, name: 'Anna Fernández', email: 'anna.fernandez@email.com', role: 'Empleat públic', avatar: '👩‍💼' },
    { id: 5, name: 'Carles Vila', email: 'carles.vila@empresa.com', role: 'Empresa', avatar: '👨‍💼' },
    { id: 6, name: 'Laura Santos', email: 'laura.santos@email.com', role: 'Ciutadana', avatar: '👩' },
    { id: 7, name: 'David Ruiz', email: 'david.ruiz@email.com', role: 'Empleat públic', avatar: '👨‍💼' },
    { id: 8, name: 'Sara Moreno', email: 'sara.moreno@empresa.com', role: 'Empresa', avatar: '👩‍💼' },
    { id: 9, name: 'Miquel Torres', email: 'miquel.torres@email.com', role: 'Ciutadà', avatar: '👨' },
    { id: 10, name: 'Clara Jiménez', email: 'clara.jimenez@email.com', role: 'Ciutadana', avatar: '👩' }
  ];

  // Filtrar usuarios según el término de búsqueda
  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Usuarios ya seleccionados
  const selectedUserIds = selectedUsers.map((user: any) => user.id);

  const handleUserSelect = (user: any) => {
    if (!selectedUserIds.includes(user.id)) {
      onUsersChange([...selectedUsers, user]);
    }
    setSearchTerm('');
    setShowResults(false);
  };

  const handleUserRemove = (userId: number) => {
    onUsersChange(selectedUsers.filter((user: any) => user.id !== userId));
  };

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Seleccionar usuaris ({selectedUsers.length} seleccionats)
      </label>

      {/* Buscador */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowResults(e.target.value.length > 0);
            }}
            onFocus={() => searchTerm.length > 0 && setShowResults(true)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Buscar per nom, email o rol..."
          />
        </div>

        {/* Resultados de búsqueda */}
        {showResults && searchTerm.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleUserSelect(user)}
                  disabled={selectedUserIds.includes(user.id)}
                  className={`w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                    selectedUserIds.includes(user.id)
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{user.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          user.role === 'Empleat públic' ? 'bg-blue-100 text-blue-700' :
                          user.role === 'Empresa' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  {selectedUserIds.includes(user.id) && (
                    <p className="text-xs text-gray-500 mt-1">✓ Ja seleccionat</p>
                  )}
                </button>
              ))
            ) : (
              <div className="p-3 text-sm text-gray-500 text-center">
                No s'han trobat usuaris que coincideixin amb "{searchTerm}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Usuarios seleccionados */}
      {selectedUsers.length > 0 && (
        <div className="mt-3">
          <div className="text-sm text-gray-600 mb-2">Usuaris seleccionats:</div>
          <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
            {selectedUsers.map((user: any) => (
              <div key={user.id} className="flex items-center justify-between bg-white p-2 rounded border">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{user.avatar}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleUserRemove(user.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Eliminar usuari"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje de ayuda */}
      {selectedUsers.length === 0 && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 Escriu el nom, email o rol per trobar usuaris. Pots seleccionar múltiples usuaris.
          </p>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}