// components/admin/FormBuilder/AvailableFields.tsx
interface AvailableFieldsProps {
    onAddField: (type: string) => void;
  }
  
  const FIELD_TYPES = [
    { type: 'text', label: 'Champ texte', icon: '📝' },
    { type: 'select', label: 'Liste déroulante', icon: '📋' },
    { type: 'date', label: 'Date', icon: '📅' },
    { type: 'number', label: 'Nombre', icon: '🔢' },
    { type: 'checkbox', label: 'Case à cocher', icon: '☑️' },
  ];
  
  export const AvailableFields = ({ onAddField }: AvailableFieldsProps) => {
    return (
      <div>
        <h3 className="font-semibold mb-4">Champs disponibles</h3>
        <div className="space-y-2">
          {FIELD_TYPES.map(({ type, label, icon }) => (
            <button
              key={type}
              onClick={() => onAddField(type)}
              className="w-full p-2 text-left bg-gray-50 hover:bg-gray-100 
                       rounded transition-colors duration-200 flex items-center gap-2"
            >
              <span className="text-xl">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };