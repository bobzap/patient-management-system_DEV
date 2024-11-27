// prisma/seeds/formConfig.ts

interface FormField {
    name: string;
    label: string;
    type: string;
    required: boolean;
    order: number;
    listId?: string;
    defaultValue?: string;
    validation?: string;
  }
  
  interface FormSection {
    name: string;
    label: string;
    order: number;
    fields: FormField[];
  }
  
  interface FormConfig {
    pageId: string;
    name: string;
    sections: FormSection[];
  }
  
  export const initialFormConfig: FormConfig = {
    pageId: 'patientForm',
    name: 'Formulaire Patient',
    sections: [
      {
        name: 'informations_personnelles',
        label: 'Informations Personnelles',
        order: 1,
        fields: [
          {
            name: 'civilite',
            label: 'Civilité',
            type: 'select',
            required: true,
            order: 1,
            listId: 'civilites'
          },
          {
            name: 'nom',
            label: 'Nom',
            type: 'text',
            required: true,
            order: 2
          },
          {
            name: 'prenom',
            label: 'Prénom',
            type: 'text',
            required: true,
            order: 3
          },
          {
            name: 'dateNaissance',
            label: 'Date de naissance',
            type: 'date',
            required: true,
            order: 4
          },
          {
            name: 'etatCivil',
            label: 'État civil',
            type: 'select',
            required: true,
            order: 5,
            listId: 'etatsCivils'
          }
        ]
      },
      {
        name: 'informations_professionnelles',
        label: 'Informations Professionnelles',
        order: 2,
        fields: [
          {
            name: 'poste',
            label: 'Poste',
            type: 'select',
            required: true,
            order: 1,
            listId: 'postes'
          },
          {
            name: 'manager',
            label: 'Manager',
            type: 'select',
            required: true,
            order: 2,
            listId: 'managers'
          }
        ]
      }
    ]
  };