import React, { useState, useEffect } from 'react';
import { Patient } from '@/types';
import { calculerAge, calculerAnciennete } from '@/utils/calculations';
import { useLists } from '@/hooks/useLists';
import { toast } from 'sonner';

interface PatientFormProps {
  patient?: Patient; // Optionnel : présent en mode édition, absent en mode création
  onSubmit: (patient: Patient) => void;
  onCancel: () => void;
}

interface StepProps {
  title: string;
  icon: React.ReactNode;
}

interface InputFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'date' | 'select';
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  required?: boolean;
  readOnly?: boolean;
  options?: string[];
  placeholder?: string;
}




const STEPS: StepProps[] = [
  {
    title: "Informations personnelles",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  },
  {
    title: "Informations professionnelles",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  }
];

const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  name, 
  type = "text", 
  value, 
  onChange, 
  required = false, 
  readOnly = false,
  options = [],
  placeholder = ""
}) => {
  const baseClasses = "mt-1 block w-full rounded-lg border text-gray-900 font-medium";
  const activeClasses = readOnly 
    ? "bg-gray-100 border-gray-200 text-gray-700"
    : "bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none";


    
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-800">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {type === "select" ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`${baseClasses} ${activeClasses} h-11 px-3`}
        >
          <option value="">Sélectionner...</option>
          {options.map(opt => (
            <option key={opt} value={opt} className="text-gray-900">
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`${baseClasses} ${activeClasses} h-11 px-3`}
        />
      )}
    </div>
  );
};





export const PatientForm = ({ patient, onSubmit, onCancel }: PatientFormProps) => {
  const { lists, isLoading: listsLoading, error: listsError } = useLists();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [possibleDuplicates, setPossibleDuplicates] = useState<Patient[]>([]);
const [showDuplicatesWarning, setShowDuplicatesWarning] = useState(false);

  const [formData, setFormData] = useState(() => {
    if (patient) {
      return {
        ...patient,
        // Formater les dates au format YYYY-MM-DD
        dateNaissance: patient.dateNaissance.split('.').reverse().join('-'),
        dateEntree: patient.dateEntree.split('.').reverse().join('-'),
      };
    }
    return {
      nom: '',
      prenom: '',
      civilites: '',
      dateNaissance: '',
      age: 0,
      etatCivil: '',
      poste: '',
      numeroLigne: '', // Ajoutez ce champ ici
      manager: '',
      zone: '',
      horaire: '',
      contrat: '',
      tauxActivite: '',
      departement: '',
      dateEntree: '',
      anciennete: '',
      tempsTrajetAller: '',
      tempsTrajetRetour: '',
      typeTransport: ''
    };
  });

  const [showNumeroLigne, setShowNumeroLigne] = useState(formData.poste === 'Opérateur SB');

  useEffect(() => {
    setShowNumeroLigne(formData.poste === 'Opérateur SB');
  }, [formData.poste]);


  if (listsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };

          // Vérification de doublons sur le nom
    if (name === 'nom' && value.length >= 2) {
      checkForDuplicates(value);
    }
      // Gestion spéciale pour le poste "Opérateur SB"
      if (name === 'poste') {
        setShowNumeroLigne(value === 'Opérateur SB');
        if (value !== 'Opérateur SB') {
          newData.numeroLigne = ''; // Réinitialiser si un autre poste est sélectionné
        }
      }
      
      // Calculer l'âge si la date de naissance change
      if (name === 'dateNaissance') {
        newData.age = calculerAge(value);
      }
      
      // Calculer l'ancienneté si la date d'entrée change
      if (name === 'dateEntree') {
        newData.anciennete = calculerAnciennete(value);
      }
      
      return newData;
    });
  };


// Ajoutez cette fonction après handleChange
const checkForDuplicates = async (nom: string) => {
  if (!nom || nom.length < 2) return;
  
  try {
    const response = await fetch(`/api/patients/check-duplicates?nom=${encodeURIComponent(nom)}`);
    const result = await response.json();
    
    if (result.data && result.data.length > 0) {
      // Filtrer pour exclure le patient actuel en mode édition
      const filteredDuplicates = patient 
        ? result.data.filter(p => p.id !== patient.id) 
        : result.data;
        
      if (filteredDuplicates.length > 0) {
        setPossibleDuplicates(filteredDuplicates);
        setShowDuplicatesWarning(true);
      } else {
        setShowDuplicatesWarning(false);
      }
    } else {
      setShowDuplicatesWarning(false);
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des doublons:', error);
  }
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep !== STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log("Début de la soumission");
      await onSubmit(formData as Patient);
      // Ne pas mettre setIsSubmitting(false) ici pour éviter le flash
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setIsSubmitting(false); // Remettre à false uniquement en cas d'erreur
      toast.error("Erreur lors de la mise à jour");
    }
  };

  
  
    // Modifier le titre selon le mode
    const isEditMode = !!patient;

    return (
      <div className="max-w-6xl mx-auto p-6">
<div className="mb-8">
  <h2 className="text-2xl font-bold text-blue-900">
    {patient ? 'Modifier le Dossier Patient' : 'Nouveau Dossier Patient'}
    {patient && (
      <span className="text-gray-500 text-lg ml-2">
        ({patient.civilites} {patient.nom} {patient.prenom})
      </span>
    )}
  </h2>
  <p className="mt-2 text-gray-600">Complétez les informations du patient</p>
</div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={index} className="flex-1 relative">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(index)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0
                    transition-all duration-200
                    ${currentStep >= index 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-500'}`}
                >
                  {step.icon}
                </button>
                {index < STEPS.length - 1 && (
                  <div className={`h-1 flex-1 mx-4 rounded transition-colors duration-200
                    ${currentStep > index ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
              <span className={`absolute -bottom-7 left-0 right-0 text-center text-sm font-medium
                ${currentStep >= index ? 'text-blue-900' : 'text-gray-500'}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg">
        <div className="p-6">
          <div className={currentStep === 0 ? 'block' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Civilité"
                name="civilites"
                type="select"
                value={formData.civilites}
                onChange={handleChange}
                
                options={lists['civilites'] || []}
              />
              <InputField
                label="État civil"
                name="etatCivil"
                type="select"
                value={formData.etatCivil}
                onChange={handleChange}
                
                options={lists['etatsCivils'] || []}
              />
              <InputField
                label="NOM"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
              />

              {/* Avertissement de doublons */}
{showDuplicatesWarning && (
  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
    <p className="text-yellow-800 font-medium">
      Attention! {possibleDuplicates.length} employé(s) avec un nom similaire déjà existant(s)
    </p>
    <ul className="mt-2 text-sm">
      {possibleDuplicates.map(p => (
        <li key={p.id} className="text-gray-700">
          {p.civilites} {p.nom} {p.prenom}, {p.poste} ({p.departement})
        </li>
      ))}
    </ul>
    <div className="mt-3 flex justify-end">
      <button 
        type="button"
        onClick={() => setShowDuplicatesWarning(false)}
        className="text-xs bg-white px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
      >
        Continuer quand même
      </button>
    </div>
  </div>
)}
              <InputField
                label="Prénom"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
              />
              <InputField
                label="Date de naissance"
                name="dateNaissance"
                type="date"
                value={formData.dateNaissance}
                onChange={handleChange}
                
              />
              {formData.age > 0 && (
                <div className="flex items-center bg-blue-50 rounded-lg px-4 py-3">
                  <span className="text-blue-900 font-semibold">
                    Âge : {formData.age} ans
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className={currentStep === 1 ? 'block' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Poste"
                name="poste"
                type="select"
                value={formData.poste}
                onChange={handleChange}
                
                options={lists['postes'] || []}
              />

{showNumeroLigne && (
  <InputField
    label="N° de ligne"
    name="numeroLigne"
    value={formData.numeroLigne || ''}
    onChange={handleChange}
    placeholder="Ex: A12, B45..."
  />
)}




              <InputField
                label="Manager"
                name="manager"
                type="select"
                value={formData.manager}
                onChange={handleChange}
                
                options={lists['managers'] || []}
              />

              <InputField
                label="Zone"
                name="zone"
                type="select"
                value={formData.zone}
                onChange={handleChange}
                
                options={lists['zones'] || []}
              />
              <InputField
                label="Département"
                name="departement"
                type="select"
                value={formData.departement}
                onChange={handleChange}
                
                options={lists['dpt'] || []}
              />
              <InputField
                label="Type de contrat"
                name="contrat"
                type="select"
                value={formData.contrat}
                onChange={handleChange}
                
                options={lists['contrats'] || []}
              />
              <InputField
                label="Taux d'activité"
                name="tauxActivite"
                type="select"
                value={formData.tauxActivite}
                onChange={handleChange}
                
                options={lists['tauxOccupation'] || []}
              />
              <InputField
                label="Date d'entrée"
                name="dateEntree"
                type="date"
                value={formData.dateEntree}
                onChange={handleChange}
                
              />

<InputField
  label="Horaire"
  name="horaire"
  type="select"
  value={formData.horaire}
  onChange={handleChange}
  
  options={lists['horaires'] || []}
/>
              <InputField
                label="Type de transport"
                name="typeTransport"
                type="select"
                value={formData.typeTransport}
                onChange={handleChange}
                
                options={lists['transport'] || []}
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Temps trajet aller"
                  name="tempsTrajetAller"
                  value={formData.tempsTrajetAller}
                  onChange={handleChange}
                  
                  placeholder="En minutes"
                />
                <InputField
                  label="Temps trajet retour"
                  name="tempsTrajetRetour"
                  value={formData.tempsTrajetRetour}
                  onChange={handleChange}
                  
                  placeholder="En minutes"
                />
              </div>
              {formData.anciennete && (
                <div className="col-span-2 bg-blue-50 rounded-lg px-4 py-3">
                  <span className="text-blue-900 font-semibold">
                    Ancienneté : {formData.anciennete}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-between">
  {/* Bouton Annuler/Précédent */}
  <button
    type="button"
    onClick={currentStep === 0 ? onCancel : () => setCurrentStep(prev => prev - 1)}
    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 
              hover:bg-gray-100 transition-colors duration-200 font-medium"
    disabled={isSubmitting}
  >
    {currentStep === 0 ? 'Annuler' : 'Précédent'}
  </button>

  {/* Bouton Suivant/Enregistrer */}
  <button
    type="button"
    onClick={(e) => {
      if (currentStep === STEPS.length - 1) {
        handleSubmit(e);
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }}
    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
              transition-colors duration-200 font-medium disabled:bg-blue-300"
    disabled={isSubmitting}
  >
    {currentStep === STEPS.length - 1 
      ? (isSubmitting ? (isEditMode ? 'Modification...' : 'Création...') 
         : (isEditMode ? 'Enregistrer les modifications' : 'Créer le dossier'))
      : 'Suivant'}
  </button>
</div>
      </form>
    </div>
  );
};