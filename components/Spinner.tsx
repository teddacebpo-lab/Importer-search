
import React from 'react';

interface SpinnerProps {
  message?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ message }) => (
  <div className="flex flex-col justify-center items-center py-10">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
    {message && <p className="mt-4 text-slate-400 text-lg tracking-wide">{message}</p>}
  </div>
);