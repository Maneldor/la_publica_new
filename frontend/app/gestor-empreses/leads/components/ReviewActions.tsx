'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

interface ReviewActionsProps {
  leadId: string;
  companyName: string;
  email?: string;
  phone?: string;
  website?: string;
  onApprove: (leadId: string) => void;
  onReject: (leadId: string, reason: string) => void;
  onEdit: (leadId: string, data: { email?: string; phone?: string; website?: string; notes?: string }) => void;
  disabled?: boolean;
}

export default function ReviewActions({
  leadId,
  companyName,
  email = '',
  phone = '',
  website = '',
  onApprove,
  onReject,
  onEdit,
  disabled = false
}: ReviewActionsProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [editData, setEditData] = useState({
    email,
    phone,
    website,
    notes: ''
  });
  const { toast } = useToast();

  const handleApprove = () => {
    try {
      onApprove(leadId);
      toast({
        title: "Lead aprovat!",
        description: `${companyName} ara està disponible al pipeline`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No s'ha pogut aprovar el lead",
        variant: "destructive"
      });
    }
  };

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) {
      toast({
        title: "Error",
        description: "Has d'especificar una raó per rebutjar el lead",
        variant: "destructive"
      });
      return;
    }

    try {
      onReject(leadId, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      toast({
        title: "Lead rebutjat",
        description: `${companyName} ha estat marcat com a rebutjat`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No s'ha pogut rebutjar el lead",
        variant: "destructive"
      });
    }
  };

  const handleEditSubmit = () => {
    try {
      onEdit(leadId, editData);
      setShowEditModal(false);
      toast({
        title: "Lead editat",
        description: `Les dades de ${companyName} han estat actualitzades`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No s'han pogut guardar els canvis",
        variant: "destructive"
      });
    }
  };

  const resetRejectModal = () => {
    setRejectReason('');
    setShowRejectModal(false);
  };

  const resetEditModal = () => {
    setEditData({
      email,
      phone,
      website,
      notes: ''
    });
    setShowEditModal(false);
  };

  return (
    <>
      {/* Acciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Botón Aprovar */}
        <Button
          onClick={handleApprove}
          disabled={disabled}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          size="sm"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Aprovar
        </Button>

        {/* Botón Rebutjar */}
        <Button
          onClick={() => setShowRejectModal(true)}
          disabled={disabled}
          variant="outline"
          className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
          size="sm"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Rebutjar
        </Button>

        {/* Botón Editar */}
        <Button
          onClick={() => setShowEditModal(true)}
          disabled={disabled}
          variant="outline"
          className="w-full"
          size="sm"
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      {/* Modal de Rebutjar */}
      <Dialog open={showRejectModal} onOpenChange={resetRejectModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Per què rebutjes aquest lead?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Especifica la raó per rebutjar <span className="font-medium">{companyName}</span>:
              </p>
              <Textarea
                placeholder="Ex: No encaixa amb el nostre públic objectiu, informació incompleta, empresa ja contactada..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="min-h-[100px]"
                required
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={resetRejectModal}
            >
              Cancel·lar
            </Button>
            <Button
              onClick={handleRejectSubmit}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!rejectReason.trim()}
            >
              Confirmar rebuig
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Editar */}
      <Dialog open={showEditModal} onOpenChange={resetEditModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar dades del lead</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Actualitza les dades de contacte per <span className="font-medium">{companyName}</span>:
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="email@empresa.com"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfon
                  </label>
                  <Input
                    type="tel"
                    placeholder="+34 123 456 789"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lloc web
                  </label>
                  <Input
                    type="url"
                    placeholder="https://www.empresa.com"
                    value={editData.website}
                    onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes addicionals
                  </label>
                  <Textarea
                    placeholder="Afegeix notes o comentaris sobre aquest lead..."
                    value={editData.notes}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={resetEditModal}
            >
              Cancel·lar
            </Button>
            <Button
              onClick={handleEditSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Guardar canvis
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}