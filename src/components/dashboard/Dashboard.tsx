// src/components/dashboard/Dashboard.tsx
'use client';

interface DashboardProps {
  patients: {
    data: Array<{
      id: number;
      dateCreation: string;
      dateEntretien?: string;
      departement: string;
      manager: string;
    }>;
  };
}

export const Dashboard = ({ patients }: DashboardProps) => {
  const patientsData = patients?.data || [];
  const todayDate = new Date().toISOString().split('T')[0];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Tableau de bord</h2>
      
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Nouveaux dossiers aujourd'hui */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl font-bold text-green-600">
            {patientsData.filter(p => p.dateCreation === todayDate).length}
          </div>
          <div className="text-gray-600">Nouveaux dossiers aujourd'hui</div>
        </div>

        {/* Total des dossiers */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl font-bold text-blue-600">
            {patientsData.length}
          </div>
          <div className="text-gray-600">Total des dossiers</div>
        </div>

        {/* Entretiens prévus */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl font-bold text-purple-600">
            {patientsData.filter(p => p.dateEntretien === todayDate).length}
          </div>
          <div className="text-gray-600">Entretiens prévus aujourd'hui</div>
        </div>
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distribution par département */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Distribution par département
          </h3>
          <div className="space-y-2">
            {Object.entries(
              patientsData.reduce((acc, patient) => {
                acc[patient.departement] = (acc[patient.departement] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([departement, count]) => (
              <div key={departement} className="flex justify-between items-center">
                <span className="text-gray-600">{departement}</span>
                <span className="text-blue-600 font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Distribution par manager */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Distribution par manager
          </h3>
          <div className="space-y-2">
            {Object.entries(
              patientsData.reduce((acc, patient) => {
                acc[patient.manager] = (acc[patient.manager] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([manager, count]) => (
              <div key={manager} className="flex justify-between items-center">
                <span className="text-gray-600">{manager}</span>
                <span className="text-blue-600 font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};