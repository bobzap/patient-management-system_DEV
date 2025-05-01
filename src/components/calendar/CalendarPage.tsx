// src/components/calendar/CalendarPage.tsx
'use client';

import React from 'react';
import Calendar from './Calendar';

export const CalendarPage: React.FC = () => {
  return (
    <div className="p-6 h-[calc(100vh-80px)]">
      <Calendar />
    </div>
  );
};

export default CalendarPage;