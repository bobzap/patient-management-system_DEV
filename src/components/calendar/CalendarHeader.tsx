// src/components/calendar/CalendarHeader.tsx
'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, X } from 'lucide-react';

interface CalendarHeaderProps {
  title: string;
  view: 'month' | 'week' | 'day';
  onViewChange: (view: 'month' | 'week' | 'day') => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  eventTypes: string[];
  statusTypes: string[];
  departments: string[];
  filterEventType: string;
  filterStatus: string;
  filterDepartment: string;
  onFilterChange: (filterType: string, value: string) => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  title,
  view,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
  eventTypes,
  statusTypes,
  departments,
  filterEventType,
  filterStatus,
  filterDepartment,
  onFilterChange
}) => {
  const [showFilters, setShowFilters] = useState(false);

  // Gestion des filtres actifs
  const hasActiveFilters = filterEventType || filterStatus || filterDepartment;

  // Réinitialiser tous les filtres
  const resetAllFilters = () => {
    onFilterChange('eventType', '');
    onFilterChange('status', '');
    onFilterChange('department', '');
  };

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-4">
        {/* Titre et navigation */}
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-gray-900 capitalize">{title}</h2>
          <div className="flex space-x-2">
            <button
              onClick={onPrevious}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Période précédente"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={onNext}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Période suivante"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={onToday}
              className="px-3 py-1 rounded-md bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              Aujourd'hui
            </button>
          </div>
        </div>

        {/* Contrôles de vue et filtres */}
        <div className="flex items-center space-x-4">
          {/* Sélection de vue */}
          <div className="flex rounded-md shadow-sm bg-gray-100 p-1">
            <button
              onClick={() => onViewChange('month')}
              className={`px-3 py-1 text-sm rounded-md ${
                view === 'month'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Mois
            </button>
            <button
              onClick={() => onViewChange('week')}
              className={`px-3 py-1 text-sm rounded-md ${
                view === 'week'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => onViewChange('day')}
              className={`px-3 py-1 text-sm rounded-md ${
                view === 'day'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Jour
            </button>
          </div>

          {/* Bouton de filtres */}
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-1 px-3 py-2 rounded-md border transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Filter size={16} />
              <span>Filtres</span>
              {hasActiveFilters && (
                <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {(filterEventType ? 1 : 0) + (filterStatus ? 1 : 0) + (filterDepartment ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Panneau de filtres */}
            {showFilters && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Filtres</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Type d'événement */}
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 mb-1">Type d'événement</label>
                  <select
                    value={filterEventType}
                    onChange={(e) => onFilterChange('eventType', e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  >
                    <option value="">Tous les types</option>
                    {eventTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Statut */}
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 mb-1">Statut</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => onFilterChange('status', e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  >
                    <option value="">Tous les statuts</option>
                    {statusTypes.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Département */}
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 mb-1">Département</label>
                  <select
                    value={filterDepartment}
                    onChange={(e) => onFilterChange('department', e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  >
                    <option value="">Tous les départements</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bouton de réinitialisation */}
                <div className="flex justify-end mt-3">
                  <button
                    onClick={resetAllFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Réinitialiser tous les filtres
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Indicateurs de filtres actifs */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filterEventType && (
            <div className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
              Type: {filterEventType}
              <button
                onClick={() => onFilterChange('eventType', '')}
                className="ml-1 text-blue-500 hover:text-blue-700"
              >
                <X size={14} />
              </button>
            </div>
          )}
          {filterStatus && (
            <div className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
              Statut: {filterStatus}
              <button
                onClick={() => onFilterChange('status', '')}
                className="ml-1 text-blue-500 hover:text-blue-700"
              >
                <X size={14} />
              </button>
            </div>
          )}
          {filterDepartment && (
            <div className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
              Département: {filterDepartment}
              <button
                onClick={() => onFilterChange('department', '')}
                className="ml-1 text-blue-500 hover:text-blue-700"
              >
                <X size={14} />
              </button>
            </div>
          )}
          <button
            onClick={resetAllFilters}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 bg-gray-100 rounded-full"
          >
            Effacer tous les filtres
          </button>
        </div>
      )}
    </div>
  );
};

export default CalendarHeader;