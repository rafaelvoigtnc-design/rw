'use client';

import { useState } from 'react';
import { 
  Heart, Shield, Clock, Users, Target, Eye, 
  Package, Calendar, DollarSign, Star, Tag, FileText,
  Truck, Sparkles, Gift, Check, X, Plus, Minus,
  Search, Filter, Menu, Home, Phone, Mail, MapPin,
  ChevronLeft, ChevronRight, ArrowRight, Settings,
  TrendingUp, ShoppingCart, LayoutDashboard
} from 'lucide-react';

const ICONS = [
  { name: 'Heart', component: Heart },
  { name: 'Shield', component: Shield },
  { name: 'Clock', component: Clock },
  { name: 'Users', component: Users },
  { name: 'Target', component: Target },
  { name: 'Eye', component: Eye },
  { name: 'Package', component: Package },
  { name: 'Calendar', component: Calendar },
  { name: 'DollarSign', component: DollarSign },
  { name: 'Star', component: Star },
  { name: 'Tag', component: Tag },
  { name: 'FileText', component: FileText },
  { name: 'Truck', component: Truck },
  { name: 'Sparkles', component: Sparkles },
  { name: 'Gift', component: Gift },
  { name: 'Check', component: Check },
  { name: 'X', component: X },
  { name: 'Plus', component: Plus },
  { name: 'Minus', component: Minus },
  { name: 'Search', component: Search },
  { name: 'Filter', component: Filter },
  { name: 'Menu', component: Menu },
  { name: 'Home', component: Home },
  { name: 'Phone', component: Phone },
  { name: 'Mail', component: Mail },
  { name: 'MapPin', component: MapPin },
  { name: 'ChevronLeft', component: ChevronLeft },
  { name: 'ChevronRight', component: ChevronRight },
  { name: 'ArrowRight', component: ArrowRight },
  { name: 'Settings', component: Settings },
  { name: 'TrendingUp', component: TrendingUp },
  { name: 'ShoppingCart', component: ShoppingCart },
  { name: 'LayoutDashboard', component: LayoutDashboard },
];

interface IconPickerProps {
  onSelect: (iconName: string) => void;
  selectedIcon?: string;
}

export default function IconPicker({ onSelect, selectedIcon }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredIcons = ICONS.filter(icon =>
    icon.name.toLowerCase().includes(search.toLowerCase())
  );

  const IconComponent = ICONS.find(i => i.name === selectedIcon)?.component;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center hover:border-primary-blue-500 transition-colors bg-white"
      >
        {IconComponent ? (
          <IconComponent className="w-6 h-6 text-gray-700" />
        ) : (
          <span className="text-gray-400 text-sm">Ícone</span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                placeholder="Buscar ícone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>
            <div className="p-4 grid grid-cols-6 gap-2 overflow-y-auto max-h-72">
              {filteredIcons.map((icon) => {
                const Icon = icon.component;
                return (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => {
                      onSelect(icon.name);
                      setIsOpen(false);
                    }}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      selectedIcon === icon.name
                        ? 'bg-primary-blue-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    title={icon.name}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
