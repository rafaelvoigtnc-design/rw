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
    background: 'bg-pink-50',
    backgroundPattern: 'radial-gradient(circle at 20% 80%, rgba(255, 182, 193, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(173, 216, 230, 0.3) 0%, transparent 50%)',
    primaryColor: 'bg-pink-400',
    secondaryColor: 'bg-purple-300',
    textColor: 'text-gray-800',
    accentColor: 'text-pink-500',
    titleFont: 'font-rounded',
    borderRadius: 'rounded-3xl',
    cardStyle: 'rounded-2xl',
  },
  aventura_acao: {
    background: 'bg-orange-50',
    backgroundPattern: 'linear-gradient(135deg, rgba(255, 165, 0, 0.1) 0%, rgba(255, 69, 0, 0.1) 100%)',
    primaryColor: 'bg-orange-500',
    secondaryColor: 'bg-red-500',
    textColor: 'text-gray-900',
    accentColor: 'text-orange-600',
    titleFont: 'font-bold',
    borderRadius: 'rounded-xl',
    cardStyle: 'rounded-lg',
  },
  esporte_competicao: {
    background: 'bg-gray-900',
    backgroundPattern: 'linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, rgba(20, 20, 20, 0.9) 100%)',
    primaryColor: 'bg-red-600',
    secondaryColor: 'bg-yellow-500',
    textColor: 'text-white',
    accentColor: 'text-red-500',
    titleFont: 'font-black uppercase tracking-wider',
    borderRadius: 'rounded-sm',
    cardStyle: 'rounded-none border-2 border-red-600',
  },
  agua_diversao: {
    background: 'bg-cyan-50',
    backgroundPattern: 'linear-gradient(180deg, rgba(6, 182, 212, 0.1) 0%, rgba(14, 165, 233, 0.2) 50%, rgba(59, 130, 246, 0.1) 100%)',
    primaryColor: 'bg-cyan-500',
    secondaryColor: 'bg-blue-400',
    textColor: 'text-gray-800',
    accentColor: 'text-cyan-600',
    titleFont: 'font-semibold',
    borderRadius: 'rounded-2xl',
    cardStyle: 'rounded-xl',
  },
  festa_elegante: {
    background: 'bg-stone-50',
    backgroundPattern: 'linear-gradient(135deg, rgba(250, 240, 230, 0.5) 0%, rgba(255, 228, 225, 0.3) 100%)',
    primaryColor: 'bg-amber-600',
    secondaryColor: 'bg-rose-400',
    textColor: 'text-gray-900',
    accentColor: 'text-amber-700',
    titleFont: 'font-serif',
    borderRadius: 'rounded-lg',
    cardStyle: 'rounded-sm border border-amber-200',
  },
  classico_divertido: {
    background: 'bg-emerald-50',
    backgroundPattern: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(45, 212, 191, 0.1) 100%)',
    primaryColor: 'bg-emerald-600',
    secondaryColor: 'bg-teal-500',
    textColor: 'text-gray-800',
    accentColor: 'text-emerald-600',
    titleFont: 'font-semibold',
    borderRadius: 'rounded-xl',
    cardStyle: 'rounded-lg',
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
