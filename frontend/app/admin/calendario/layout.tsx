'use client';

import { CalendarProvider } from '@/lib/context/CalendarContext';

export default function CalendarioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CalendarProvider>
      {children}
    </CalendarProvider>
  );
}
