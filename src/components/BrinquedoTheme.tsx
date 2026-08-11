import { ReactNode } from 'react';

export interface BrinquedoTheme {
  background: string;
  backgroundPattern?: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  accentColor: string;
  titleFont: string;
  borderRadius: string;
  cardStyle: string;
}

export const temas: Record<string, BrinquedoTheme> = {
  infantil_ludico: {
    background: 'bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100',
    backgroundPattern: 'radial-gradient(circle at 20% 80%, rgba(236, 72, 153, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.15) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
    primaryColor: 'bg-pink-500',
    secondaryColor: 'bg-purple-400',
    textColor: 'text-gray-800',
    accentColor: 'text-pink-600',
    titleFont: 'font-bold',
    borderRadius: 'rounded-3xl',
    cardStyle: 'rounded-3xl',
  },
  aventura_acao: {
    background: 'bg-gradient-to-br from-orange-100 via-red-50 to-yellow-100',
    backgroundPattern: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(239, 68, 68, 0.15) 50%, rgba(234, 179, 8, 0.1) 100%)',
    primaryColor: 'bg-orange-600',
    secondaryColor: 'bg-red-500',
    textColor: 'text-gray-900',
    accentColor: 'text-orange-700',
    titleFont: 'font-black uppercase tracking-wide',
    borderRadius: 'rounded-2xl',
    cardStyle: 'rounded-2xl',
  },
  esporte_competicao: {
    background: 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800',
    backgroundPattern: 'linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(30, 41, 59, 0.8) 50%, rgba(15, 23, 42, 0.9) 100%)',
    primaryColor: 'bg-red-600',
    secondaryColor: 'bg-yellow-500',
    textColor: 'text-white',
    accentColor: 'text-red-500',
    titleFont: 'font-black uppercase tracking-widest',
    borderRadius: 'rounded-xl',
    cardStyle: 'rounded-xl border-2 border-red-600/50',
  },
  agua_diversao: {
    background: 'bg-gradient-to-br from-cyan-100 via-blue-100 to-teal-100',
    backgroundPattern: 'linear-gradient(180deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.15) 50%, rgba(20, 184, 166, 0.2) 100%)',
    primaryColor: 'bg-cyan-600',
    secondaryColor: 'bg-blue-500',
    textColor: 'text-gray-800',
    accentColor: 'text-cyan-700',
    titleFont: 'font-semibold',
    borderRadius: 'rounded-2xl',
    cardStyle: 'rounded-2xl',
  },
  festa_elegante: {
    background: 'bg-gradient-to-br from-amber-50 via-rose-50 to-stone-100',
    backgroundPattern: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(244, 63, 94, 0.08) 50%, rgba(168, 162, 158, 0.05) 100%)',
    primaryColor: 'bg-amber-700',
    secondaryColor: 'bg-rose-500',
    textColor: 'text-gray-900',
    accentColor: 'text-amber-800',
    titleFont: 'font-serif',
    borderRadius: 'rounded-xl',
    cardStyle: 'rounded-xl border border-amber-300/50',
  },
  classico_divertido: {
    background: 'bg-gradient-to-br from-emerald-100 via-teal-50 to-green-100',
    backgroundPattern: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(45, 212, 191, 0.1) 50%, rgba(34, 197, 94, 0.15) 100%)',
    primaryColor: 'bg-emerald-600',
    secondaryColor: 'bg-teal-500',
    textColor: 'text-gray-800',
    accentColor: 'text-emerald-700',
    titleFont: 'font-semibold',
    borderRadius: 'rounded-2xl',
    cardStyle: 'rounded-2xl',
  },
};

interface BrinquedoThemeProviderProps {
  tema: string;
  children: ReactNode;
}

export default function BrinquedoThemeProvider({ tema, children }: BrinquedoThemeProviderProps) {
  const theme = temas[tema] || temas.classico_divertido;

  return (
    <div
      className={`min-h-screen ${theme.background} ${theme.textColor}`}
      style={{
        background: theme.backgroundPattern ? theme.backgroundPattern : undefined,
      }}
    >
      {children}
    </div>
  );
}
