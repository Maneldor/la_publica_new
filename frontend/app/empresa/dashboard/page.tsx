'use client';

import LimitsCard from '@/app/components/LimitsCard';
import {
  BarChart3,
  Users,
  Bot,
  MessageSquare,
  PlusCircle,
  FileText,
  UserPlus
} from 'lucide-react';
import { StatCard, QuickAction, ActivityItem } from '@/components/empresa/dashboard/DashboardWidgets';

export default function EmpresaDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard d'Empresa</h1>
        <p className="text-slate-500 mt-1">Benvingut al teu espai de gestió</p>
      </div>

      {/* Grid de 4 cards de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Vistes al perfil"
          value="1,234"
          subtitle="Últims 30 dies"
          change="+12%"
          changeType="positive"
          icon={BarChart3}
        />
        <StatCard
          title="Equip actiu"
          value="7/10"
          subtitle="Membres"
          icon={Users}
        />
        <StatCard
          title="Agents IA"
          value="2/3"
          subtitle="Actius"
          icon={Bot}
        />
        <StatCard
          title="Missatges"
          value="15"
          subtitle="Pendents de llegir"
          change="+3"
          changeType="positive"
          icon={MessageSquare}
        />
      </div>

      {/* Acciones Rápidas */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Accions Ràpides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            href="/empresa/ofertes/crear"
            label="Nova Oferta"
            description="Publica una nova oferta per als teus clients"
            icon={PlusCircle}
            color="blue"
          />
          <QuickAction
            href="/empresa/facturacio"
            label="Veure Factures"
            description="Consulta i descarrega les teves factures"
            icon={FileText}
            color="green"
          />
          <QuickAction
            href="/empresa/equip"
            label="Convidar Membre"
            description="Afegeix nous membres al teu equip"
            icon={UserPlus}
            color="purple"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card de límites - 2/3 ancho */}
        <div className="lg:col-span-2">
          <LimitsCard />
        </div>

        {/* Actividad Reciente - 1/3 ancho */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 h-full">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Activitat Recent</h2>
          <div className="space-y-4">
            <ActivityItem
              icon={Users}
              text="Nou membre afegit a l'equip"
              time="Fa 2 hores"
            />
            <ActivityItem
              icon={Bot}
              text="Agent IA ha contactat 12 empreses"
              time="Fa 4 hores"
            />
            <ActivityItem
              icon={MessageSquare}
              text="Nou missatge de Joan García"
              time="Fa 5 hores"
            />
            <ActivityItem
              icon={FileText}
              text="Factura de Novembre disponible"
              time="Ahir"
            />
          </div>
        </div>
      </div>
    </div>
  );
}