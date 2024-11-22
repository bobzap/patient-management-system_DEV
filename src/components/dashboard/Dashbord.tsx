'use client';
import { Patient } from '@/types';

interface DashboardProps {
  patients: Patient[];
}

export const Dashboard = ({ patients }: DashboardProps) => {
  const todayDate = new Date().toLocaleDateString('fr-FR');
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-900">Tableau de bord</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl font-bold text-blue-600">{patients.length}</div>
          <div className="text-gray-600">Dossiers patients</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl font-bold text-green-600">
            {patients.filter(p => p.dateCreation === todayDate).length}
          </div>
          <div className="text-gray-600">Nouveaux dossiers aujourd'hui</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl font-bold text-purple-600">
            {patients.reduce((acc, curr) => acc + curr.numeroEntretien, 0)}
          </div>
          <div className="text-gray-600">Total entretiens</div>
        </div>
      </div>
    </div>
  );
};