// src/components/entretiens/sections/Conclusion/Actions.tsx
'use client';

import { ActionData } from '../../types/ConclusionTypes';
import { useState, useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ActionsProps {
  data?: ActionData;
  onChange: (data: ActionData) => void;
  isReadOnly?: boolean; // Ajout du prop isReadOnly
}

const defaultData: ActionData = {
  orientation: { selected: [], commentaire: '' },
  etudePoste: { aFaire: false, commentaire: '' },
  manager: { entretienNecessaire: false, managerSelectionne: '', commentaire: '', dateRappel: '' },
  entretien: { aPrevoir: false, dateRappel: '' },
  medecin: { echangeNecessaire: false, commentaire: '' },
  visiteMedicale: { aPlanifier: false, dateRappel: '', commentaire: '' }
};

interface ActionSectionProps {
  title: string;
  children: React.ReactNode;
}

const ActionSection = ({ title, children }: ActionSectionProps) => (
  <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
    <h4 className="font-medium text-gray-900">{title}</h4>
    {children}
  </div>
);

export const Actions = ({ data = defaultData, onChange, isReadOnly = false }: ActionsProps) => {
  const [lists, setLists] = useState<{
    orientation: string[];
    managers: string[];
  }>({
    orientation: [],
    managers: []
  });

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const response = await fetch('/api/lists');
        const result = await response.json();
        
        const orientations = result.data.find((list: any) => list.listId === 'orientation');
        const managers = result.data.find((list: any) => list.listId === 'managers');

        setLists({
          orientation: orientations?.items.map((item: any) => item.value) || [],
          managers: managers?.items.map((item: any) => item.value) || []
        });
      } catch (error) {
        console.error('Erreur chargement listes:', error);
      }
    };

    fetchLists();
  }, []);

  // Helper pour simplifier la mise à jour des données
  const handleChange = (updates: Partial<ActionData>) => {
    if (isReadOnly) return; // Ne pas mettre à jour si en mode lecture seule
    onChange({ ...data, ...updates });
  };

  // Exemple pour mise à jour de sous-propriétés
  const updateOrientation = (updates: Partial<typeof data.orientation>) => {
    if (isReadOnly) return;
    handleChange({
      orientation: {
        ...data.orientation,
        ...updates
      }
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Actions à suivre</h3>

      <div className="space-y-4">
        {/* Action 1: Orientations */}
        <ActionSection title="1. Orientations">
          <Select
            value={data.orientation.selected[0] || ''}
            onValueChange={(value) => updateOrientation({ selected: [value] })}
            disabled={isReadOnly}
          >
            <SelectTrigger className={isReadOnly ? 'bg-gray-100 text-gray-700 cursor-not-allowed border-gray-200' : ''}>
              <SelectValue placeholder="Choisir une orientation..." />
            </SelectTrigger>
            <SelectContent>
              {lists.orientation.map((item) => (
                <SelectItem key={item} value={item}>{item}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            value={data.orientation.commentaire}
            onChange={(e) => updateOrientation({ commentaire: e.target.value })}
            placeholder="Commentaire sur l'orientation..."
            className={`mt-2 ${isReadOnly ? 'bg-gray-100 text-gray-700 cursor-not-allowed border-gray-200' : ''}`}
            readOnly={isReadOnly}
          />
        </ActionSection>

        {/* Action 2: Étude de poste */}
        <ActionSection title="2. Étude de poste">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="etude-poste"
              checked={data.etudePoste.aFaire}
              onCheckedChange={(checked) => handleChange({
                etudePoste: {
                  ...data.etudePoste,
                  aFaire: checked as boolean
                }
              })}
              disabled={isReadOnly}
              className={isReadOnly ? 'cursor-not-allowed' : ''}
            />
            <Label htmlFor="etude-poste" className={isReadOnly ? 'cursor-not-allowed' : ''}>Étude à faire</Label>
          </div>
          {data.etudePoste.aFaire && (
            <Textarea
              value={data.etudePoste.commentaire}
              onChange={(e) => handleChange({
                etudePoste: {
                  ...data.etudePoste,
                  commentaire: e.target.value
                }
              })}
              placeholder="Commentaire sur l'étude..."
              className={`mt-2 ${isReadOnly ? 'bg-gray-100 text-gray-700 cursor-not-allowed border-gray-200' : ''}`}
              readOnly={isReadOnly}
            />
          )}
        </ActionSection>

        {/* Action 3: Manager */}
        <ActionSection title="3. Entretien Manager">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="entretien-manager"
              checked={data.manager.entretienNecessaire}
              onCheckedChange={(checked) => handleChange({
                manager: {
                  ...data.manager,
                  entretienNecessaire: checked as boolean
                }
              })}
              disabled={isReadOnly}
              className={isReadOnly ? 'cursor-not-allowed' : ''}
            />
            <Label htmlFor="entretien-manager" className={isReadOnly ? 'cursor-not-allowed' : ''}>Entretien nécessaire</Label>
          </div>
          {data.manager.entretienNecessaire && (
            <div className="space-y-3 mt-2">
              <Select
                value={data.manager.managerSelectionne}
                onValueChange={(value) => handleChange({
                  manager: {
                    ...data.manager,
                    managerSelectionne: value
                  }
                })}
                disabled={isReadOnly}
              >
                <SelectTrigger className={isReadOnly ? 'bg-gray-100 text-gray-700 cursor-not-allowed border-gray-200' : ''}>
                  <SelectValue placeholder="Sélectionner un manager..." />
                </SelectTrigger>
                <SelectContent>
                  {lists.managers.map((manager) => (
                    <SelectItem key={manager} value={manager}>{manager}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                value={data.manager.commentaire}
                onChange={(e) => handleChange({
                  manager: {
                    ...data.manager,
                    commentaire: e.target.value
                  }
                })}
                placeholder="Commentaire pour l'entretien..."
                className={isReadOnly ? 'bg-gray-100 text-gray-700 cursor-not-allowed border-gray-200' : ''}
                readOnly={isReadOnly}
              />
              <div>
                <Label className={isReadOnly ? 'cursor-not-allowed' : ''}>Date de rappel</Label>
                <Input
                  type="date"
                  value={data.manager.dateRappel}
                  onChange={(e) => handleChange({
                    manager: {
                      ...data.manager,
                      dateRappel: e.target.value
                    }
                  })}
                  className={`mt-1 ${isReadOnly ? 'bg-gray-100 text-gray-700 cursor-not-allowed border-gray-200' : ''}`}
                  readOnly={isReadOnly}
                />
              </div>
            </div>
          )}
        </ActionSection>

        {/* Action 4: Entretien */}
        <ActionSection title="4. Prochain Entretien">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="entretien-prevoir"
              checked={data.entretien.aPrevoir}
              onCheckedChange={(checked) => handleChange({
                entretien: {
                  ...data.entretien,
                  aPrevoir: checked as boolean
                }
              })}
              disabled={isReadOnly}
              className={isReadOnly ? 'cursor-not-allowed' : ''}
            />
            <Label htmlFor="entretien-prevoir" className={isReadOnly ? 'cursor-not-allowed' : ''}>Entretien à prévoir</Label>
          </div>
          {data.entretien.aPrevoir && (
            <div className="mt-2">
              <Label className={isReadOnly ? 'cursor-not-allowed' : ''}>Date de rappel</Label>
              <Input
                type="date"
                value={data.entretien.dateRappel}
                onChange={(e) => handleChange({
                  entretien: {
                    ...data.entretien,
                    dateRappel: e.target.value
                  }
                })}
                className={`mt-1 ${isReadOnly ? 'bg-gray-100 text-gray-700 cursor-not-allowed border-gray-200' : ''}`}
                readOnly={isReadOnly}
              />
            </div>
          )}
        </ActionSection>

        {/* Action 5: Médecin */}
        <ActionSection title="5. Échange Médecin">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="echange-medecin"
              checked={data.medecin.echangeNecessaire}
              onCheckedChange={(checked) => handleChange({
                medecin: {
                  ...data.medecin,
                  echangeNecessaire: checked as boolean
                }
              })}
              disabled={isReadOnly}
              className={isReadOnly ? 'cursor-not-allowed' : ''}
            />
            <Label htmlFor="echange-medecin" className={isReadOnly ? 'cursor-not-allowed' : ''}>Échange nécessaire</Label>
          </div>
          {data.medecin.echangeNecessaire && (
            <Textarea
              value={data.medecin.commentaire}
              onChange={(e) => handleChange({
                medecin: {
                  ...data.medecin,
                  commentaire: e.target.value
                }
              })}
              placeholder="Commentaire pour le médecin..."
              className={`mt-2 ${isReadOnly ? 'bg-gray-100 text-gray-700 cursor-not-allowed border-gray-200' : ''}`}
              readOnly={isReadOnly}
            />
          )}
        </ActionSection>

        {/* Action 6: Visite médicale */}
        <ActionSection title="6. Visite Médicale">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="visite-medicale"
              checked={data.visiteMedicale.aPlanifier}
              onCheckedChange={(checked) => handleChange({
                visiteMedicale: {
                  ...data.visiteMedicale,
                  aPlanifier: checked as boolean
                }
              })}
              disabled={isReadOnly}
              className={isReadOnly ? 'cursor-not-allowed' : ''}
            />
            <Label htmlFor="visite-medicale" className={isReadOnly ? 'cursor-not-allowed' : ''}>Visite à planifier</Label>
          </div>
          {data.visiteMedicale.aPlanifier && (
            <div className="space-y-3 mt-2">
              <div>
                <Label className={isReadOnly ? 'cursor-not-allowed' : ''}>Date de rappel</Label>
                <Input
                  type="date"
                  value={data.visiteMedicale.dateRappel}
                  onChange={(e) => handleChange({
                    visiteMedicale: {
                      ...data.visiteMedicale,
                      dateRappel: e.target.value
                    }
                  })}
                  className={`mt-1 ${isReadOnly ? 'bg-gray-100 text-gray-700 cursor-not-allowed border-gray-200' : ''}`}
                  readOnly={isReadOnly}
                />
              </div>
              <Textarea
                value={data.visiteMedicale.commentaire}
                onChange={(e) => handleChange({
                  visiteMedicale: {
                    ...data.visiteMedicale,
                    commentaire: e.target.value
                  }
                })}
                placeholder="Commentaire pour la visite..."
                className={isReadOnly ? 'bg-gray-100 text-gray-700 cursor-not-allowed border-gray-200' : ''}
                readOnly={isReadOnly}
              />
            </div>
          )}
        </ActionSection>
      </div>
    </div>
  );
};