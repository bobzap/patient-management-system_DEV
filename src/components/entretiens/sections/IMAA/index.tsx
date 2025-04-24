// src/components/entretiens/sections/IMAA/index.tsx
// src/components/entretiens/sections/IMAA/index.tsx
'use client';

interface IMAAProps {
  data: any;
  onChange: (data: any) => void;
}

export const IMAA = ({ data = {}, onChange }: IMAAProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow bg-white/80 rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-green-800 mb-4">IMAA</h3>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800">
            Cette section est en cours de développement et sera disponible prochainement.
          </p>
        </div>
      </div>
    </div>
  );
};