// src/components/patients/PatientForm.tsx - Version glassmorphisme moderne
import React, { useState, useEffect } from 'react';
import { Patient } from '@/types';
import { calculerAge, calculerAnciennete } from '@/utils/calculations';
import { useLists } from '@/hooks/useLists';
import { toast } from 'sonner';
import { safeParseResponse } from '@/utils/json';
import { 
  User, Briefcase, Calendar, Clock, MapPin, Car, 
  ArrowLeft, ArrowRight, Save, X, AlertTriangle,
  Check, ChevronRight, Activity, Users, ShieldCheck,
  ExternalLink, Loader2
} from 'lucide-react';
import { ConsentSelector } from '@/components/consent/ConsentSelector';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { useUnloadConfirmation } from '@/hooks/useUnloadConfirmation';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface PatientFormProps {
  patient?: Patient; // Optionnel : présent en mode édition, absent en mode création
  onSubmit: (patient: Patient) => void;
  onCancel: () => void;
}

interface StepProps {
  title: string;
  icon: React.ReactNode;
  color: string;
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

// Composant astérisque isolé
const RequiredAsterisk = () => (
  <span 
    className="asterisk-required"
    style={{
      color: '#dc2626',
      marginLeft: '0.25rem',
      fontWeight: 'normal',
      fontSize: 'inherit',
      lineHeight: 'inherit',
      display: 'inline',
      position: 'static',
      transform: 'none',
      background: 'transparent',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '0',
      boxShadow: 'none',
      outline: 'none',
      padding: '0',
      margin: '0 0 0 0.25rem',
      textDecoration: 'none',
      textShadow: 'none'
    }}
  >
    *
  </span>
);

const STEPS: StepProps[] = [
  {
    title: "Informations personnelles",
    icon: <User className="w-5 h-5" />,
    color: "blue"
  },
  {
    title: "Informations professionnelles",
    icon: <Briefcase className="w-5 h-5" />,
    color: "emerald"
  },
  {
    title: "Consentement LPD",
    icon: <ShieldCheck className="w-5 h-5" />,
    color: "rose"
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
  const baseClasses = "w-full rounded-lg border text-slate-900 transition-all duration-300 font-normal";
  const activeClasses = readOnly 
    ? "bg-white/60 border-white/40 text-slate-700 backdrop-blur-sm"
    : "bg-white/90 border-slate-200/50 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm hover:bg-white";

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
        {required && <RequiredAsterisk />}
      </label>
      {type === "select" ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`${baseClasses} ${activeClasses} h-11 px-3 pr-8 appearance-none bg-no-repeat bg-right-3 bg-center shadow-sm hover:shadow-md`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundSize: '16px 16px'
          }}
        >
          <option value="" className="text-slate-500 font-normal">Sélectionner...</option>
          {options.map(opt => (
            <option key={opt} value={opt} className="text-slate-900 font-normal py-2">
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
          className={`${baseClasses} ${activeClasses} h-11 px-3 shadow-sm hover:shadow-md`}
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
  const [consentData, setConsentData] = useState<any>(null);

  const initialFormData = {
    nom: '',
    prenom: '',
    civilites: '',
    dateNaissance: '',
    age: 0,
    etatCivil: '',
    poste: '',
    numeroLigne: '',
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

  const [formData, setFormData] = useState(() => {
    if (patient) {
      return {
        ...patient,
        // Formater les dates au format YYYY-MM-DD
        dateNaissance: patient.dateNaissance.split('.').reverse().join('-'),
        dateEntree: patient.dateEntree.split('.').reverse().join('-'),
      };
    }
    return initialFormData;
  });

  const [showNumeroLigne, setShowNumeroLigne] = useState(formData.poste === 'Opérateur SB');

  // Hook pour détecter les modifications non sauvegardées
  const { hasUnsavedChanges } = useUnsavedChanges({
    initialData: patient ? {
      ...patient,
      dateNaissance: patient.dateNaissance.split('.').reverse().join('-'),
      dateEntree: patient.dateEntree.split('.').reverse().join('-'),
    } : initialFormData,
    currentData: formData,
    ignoreFields: ['age', 'anciennete'] // Champs calculés automatiquement
  });

  // Hook pour gérer la confirmation de navigation
  const {
    showConfirmDialog,
    handleNavigationAttempt,
    handleConfirmNavigation,
    handleSaveAndNavigate,
    handleCancelNavigation,
    dialogProps
  } = useNavigationGuard({
    hasUnsavedChanges,
    onNavigate: onCancel,
    title: 'Modifications non sauvegardées',
    message: 'Vous avez des modifications non sauvegardées. Que souhaitez-vous faire ?',
    confirmText: 'Quitter sans sauvegarder',
    saveText: 'Sauvegarder et quitter'
  });

  // Hook pour gérer la confirmation de fermeture de fenêtre
  useUnloadConfirmation({
    hasUnsavedChanges,
    message: 'Vous avez des modifications non sauvegardées sur ce patient. Voulez-vous vraiment quitter ?',
    enabled: true
  });

  useEffect(() => {
    setShowNumeroLigne(formData.poste === 'Opérateur SB');
  }, [formData.poste]);

  if (listsLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-600/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/30 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
              <p className="text-slate-800 font-medium">Chargement des données...</p>
            </div>
          </div>
        </div>
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
          newData.numeroLigne = '';
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

  const checkForDuplicates = async (nom: string) => {
    if (!nom || nom.length < 2) return;
    
    try {
      const response = await fetch(`/api/patients/check-duplicates?nom=${encodeURIComponent(nom)}`);
      
      // Vérifier si c'est une redirection d'authentification
      if (response.status === 404 || response.url.includes('/auth/')) {
        console.warn('Session expirée lors de la vérification de doublons');
        return;
      }
      
      const parseResult = await safeParseResponse(response);
      
      if (!parseResult.success) {
        console.error('Erreur parsing vérification doublons:', parseResult.error);
        return;
      }
      
      const result = parseResult.data;
      
      if (result.data && result.data.length > 0) {
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
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setIsSubmitting(false);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const isEditMode = !!patient;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* En-tête ultra-moderne */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-3xl blur-2xl"></div>
          <div className="relative bg-white/25 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center space-x-6">
              {/* Icône moderne */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-indigo-600/30 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-16 h-16 bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl flex items-center justify-center shadow-xl">
                  {isEditMode ? (
                    <User className="h-8 w-8 text-blue-600" />
                  ) : (
                    <Users className="h-8 w-8 text-emerald-600" />
                  )}
                </div>
              </div>

              {/* Titre et description */}
              <div className="flex-1">
                <h1 className="text-3xl font-light text-slate-900 tracking-tight mb-2">
                  {patient ? 'Modifier le Dossier Patient' : 'Nouveau Dossier Patient'}
                </h1>
                {patient && (
                  <p className="text-lg text-slate-600 mb-2">
                    {patient.civilites} {patient.nom} {patient.prenom}
                  </p>
                )}
                <p className="text-slate-500">Complétez les informations du patient</p>
              </div>

              {/* Bouton fermer */}
              <button
                onClick={() => handleNavigationAttempt()}
                className="group flex items-center space-x-2 text-slate-600 hover:text-red-600 transition-colors duration-300"
                title="Fermer"
              >
                <X className="h-5 w-5" />
                <span className="text-sm font-medium">Fermer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stepper ultra-moderne */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-white/30 backdrop-blur-2xl border border-white/40 rounded-2xl p-6 shadow-xl">
            <div className="relative flex items-end justify-between">
              {/* Ligne de connexion centrée */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-2/3 h-1 bg-white/30 backdrop-blur-sm rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-700 ease-out ${
                  currentStep === 0 
                    ? 'bg-white/50 w-0'
                    : currentStep === 1
                    ? 'bg-gradient-to-r from-blue-500 via-blue-500 to-emerald-500 w-1/2'
                    : currentStep === 2
                    ? 'bg-gradient-to-r from-blue-500 via-emerald-500 to-rose-500 w-full'
                    : 'bg-gradient-to-r from-blue-500 via-emerald-500 to-rose-500 w-full'
                }`} />
              </div>
              
              {STEPS.map((step, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  {/* Cercle du step */}
                  <button
                    type="button"
                    onClick={() => setCurrentStep(index)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg hover:shadow-xl mb-4 relative z-10 ${
                      currentStep >= index 
                        ? step.color === 'blue'
                          ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white scale-110' 
                          : step.color === 'emerald'
                          ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white scale-110'
                          : 'bg-gradient-to-br from-rose-600 to-pink-600 text-white scale-110'
                        : 'bg-white/40 backdrop-blur-sm border border-white/50 text-slate-500 hover:bg-white/50'
                    }`}
                  >
                    {currentStep > index ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step.icon
                    )}
                  </button>
                  
                  {/* Titre du step centré sous l'icône */}
                  <span className={`text-sm font-semibold transition-colors duration-300 text-center ${
                    currentStep >= index 
                      ? step.color === 'blue'
                        ? 'text-blue-700'
                        : step.color === 'emerald'
                        ? 'text-emerald-700'
                        : 'text-rose-700'
                      : 'text-slate-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Formulaire principal */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/30 backdrop-blur-2xl border border-white/40 rounded-3xl overflow-hidden shadow-2xl">
            
            <form onSubmit={handleSubmit}>
              <div className="p-8">
                
                {/* Étape 1 : Informations personnelles */}
                <div className={currentStep === 0 ? 'block' : 'hidden'}>
                  <div className="mb-6">
                    <div className="flex items-center space-x-3 mb-8">
                      <div className="p-2 bg-blue-500/20 backdrop-blur-sm rounded-xl">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900">Informations personnelles</h3>
                    </div>
                  </div>

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
                    
                    <div className="space-y-2">
                      <InputField
                        label="NOM"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        required
                      />
                      
                      {/* Avertissement de doublons */}
                      {showDuplicatesWarning && (
                        <div className="relative mt-3">
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl blur"></div>
                          <div className="relative bg-white/95 backdrop-blur-xl border border-amber-300/60 rounded-xl p-4 shadow-lg">
                            <div className="flex items-start space-x-3">
                              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-amber-800 font-semibold mb-2 text-sm">
                                  Attention! {possibleDuplicates.length} employé(s) avec un nom similaire déjà existant(s)
                                </p>
                                <ul className="space-y-1 text-sm text-slate-700 mb-3">
                                  {possibleDuplicates.map(p => (
                                    <li key={p.id} className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                      <span>{p.civilites} {p.nom} {p.prenom}, {p.poste} ({p.departement})</span>
                                    </li>
                                  ))}
                                </ul>
                                <button 
                                  type="button"
                                  onClick={() => setShowDuplicatesWarning(false)}
                                  className="px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-medium text-amber-800 hover:bg-amber-50 transition-all duration-300"
                                >
                                  Continuer quand même
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

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
                      <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 rounded-lg p-4 flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <span className="text-blue-900 font-semibold">
                          Âge : {formData.age} ans
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Étape 2 : Informations professionnelles */}
                <div className={currentStep === 1 ? 'block' : 'hidden'}>
                  <div className="mb-6">
                    <div className="flex items-center space-x-3 mb-8">
                      <div className="p-2 bg-emerald-500/20 backdrop-blur-sm rounded-xl">
                        <Briefcase className="h-5 w-5 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900">Informations professionnelles</h3>
                    </div>
                  </div>

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
                      label="Horaire"
                      name="horaire"
                      type="select"
                      value={formData.horaire}
                      onChange={handleChange}
                      options={lists['horaires'] || []}
                    />

                    <InputField
                      label="Date d'entrée"
                      name="dateEntree"
                      type="date"
                      value={formData.dateEntree}
                      onChange={handleChange}
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
                      <div className="col-span-2 bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/50 rounded-lg p-4 flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-emerald-600" />
                        <span className="text-emerald-900 font-semibold">
                          Ancienneté : {formData.anciennete}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Étape 3 : Consentement LPD */}
                <div className={currentStep === 2 ? 'block' : 'hidden'}>
                  <div className="mb-6">
                    <div className="flex items-center space-x-3 mb-8">
                      <div className="p-2 bg-rose-500/20 backdrop-blur-sm rounded-xl">
                        <ShieldCheck className="h-5 w-5 text-rose-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900">Consentement pour le traitement des données</h3>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Sélecteur de consentement avec information LPD intégrée */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6">
                      <ConsentSelector
                        onConsentChange={(status, commentaire) => {
                          setConsentData({ status, commentaire });
                        }}
                      />
                    </div>

                    {/* Rappel important */}
                    <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200/50 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-amber-900 mb-1">Information importante</h4>
                          <p className="text-sm text-amber-800">
                            Le consentement peut être modifié ultérieurement depuis le dossier patient. 
                            En cas de doute, vous pouvez sélectionner "En attente" et clarifier avec le patient.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer avec boutons d'action */}
              <div className="bg-white/10 backdrop-blur-sm border-t border-white/20 px-8 py-6 rounded-b-3xl">
                <div className="flex justify-between items-center">
                  {/* Bouton Annuler/Précédent */}
                  <button
                    type="button"
                    onClick={currentStep === 0 ? () => handleNavigationAttempt() : () => setCurrentStep(prev => prev - 1)}
                    className="flex items-center space-x-2 px-6 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg hover:bg-white text-slate-700 hover:text-slate-900 transition-all duration-300 font-medium shadow-sm hover:shadow-md"
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>
                      {currentStep === 0 ? 'Annuler' : 'Précédent'}
                    </span>
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
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>
                          {isEditMode ? 'Modification...' : 'Création...'}
                        </span>
                      </>
                    ) : (
                      <>
                        {currentStep === STEPS.length - 1 ? (
                          <>
                            <Save className="h-4 w-4" />
                            <span>
                              {isEditMode ? 'Enregistrer les modifications' : 'Créer le dossier'}
                            </span>
                          </>
                        ) : (
                          <>
                            <span>Suivant</span>
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer ultra-moderne */}
        <div className="flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-500/10 to-purple-500/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
            
            <div className="relative bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
              <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-8">
                
                {/* Section synchronisation */}
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                  </div>
                  <div className="text-center lg:text-left">
                    <p className="text-sm font-medium text-slate-700">Dernière synchronisation</p>
                    <p className="text-xs text-slate-600">
                      {new Date().toLocaleDateString('fr-FR', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Séparateur */}
                <div className="hidden lg:block h-8 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>

                {/* Section sécurité */}
                <div className="flex items-center space-x-4">
                  <a 
                    href="https://www.ssllabs.com/ssltest/analyze.html?d=app.vital-sync.ch" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl hover:bg-white/30 hover:border-green-500/40 transition-all duration-300 hover:scale-105"
                  >
                    <div className="relative">
                      <ShieldCheck className="h-4 w-4 text-green-600 group-hover:text-green-500 transition-colors" />
                      <div className="absolute inset-0 bg-green-400/20 rounded-full blur-sm group-hover:bg-green-400/40 transition-all duration-300"></div>
                    </div>
                    <span className="text-xs font-medium text-slate-700 group-hover:text-slate-800 transition-colors">
                      Audit SSL/TLS
                    </span>
                    <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-slate-600 transition-colors" />
                  </a>
                </div>

                {/* Séparateur */}
                <div className="hidden lg:block h-8 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>

                {/* Section développeur */}
                <div className="text-center lg:text-right space-y-1">
                  <div className="flex items-center justify-center lg:justify-end space-x-2">
                    <p className="text-sm font-semibold text-slate-800">
                      Développé par{' '}
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold">
                        Amarres®
                      </span>
                    </p>
                    <div className="flex items-center">
                      <img 
                        src="/logo-amarre.png" 
                        alt="Logo Amarre" 
                        className="w-9 h-9 object-contain transition-transform duration-300 hover:scale-150"
                      />
                    </div>
                  </div>
                  <p className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-lite">
                    Software Development
                  </p>
                </div>
              </div>

              {/* Ligne décorative */}
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dialog de confirmation pour la navigation */}
      <ConfirmDialog {...dialogProps} />
    </div>
  );
};