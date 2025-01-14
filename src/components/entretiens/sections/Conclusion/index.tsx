// src/components/entretiens/sections/Conclusion/index.tsx
'use client';

import React from 'react';
import { Prevention } from './Prevention';
import { Limitation } from './Limitation';
import { Actions } from './Actions';
import type { ConclusionData } from '../../types/ConclusionTypes';

interface ConclusionProps {
  data: ConclusionData;
  onChange: (data: ConclusionData) => void;
}

export const Conclusion: React.FC<ConclusionProps> = ({ data, onChange }) => {
  const handlePreventionChange = (prevention: PreventionData) => {
    onChange({ ...data, prevention });
  };

  const handleLimitationChange = (limitation: LimitationData) => {
    onChange({ ...data, limitation });
  };

  const handleActionsChange = (actions: ActionData) => {
    onChange({ ...data, actions });
  };

  return (
    <div className="space-y-6">
      <Prevention 
        data={data.prevention} 
        onChange={handlePreventionChange} 
      />
      <Limitation 
        data={data.limitation} 
        onChange={handleLimitationChange} 
      />
      <Actions 
        data={data.actions} 
        onChange={handleActionsChange} 
      />
    </div>
  );
};