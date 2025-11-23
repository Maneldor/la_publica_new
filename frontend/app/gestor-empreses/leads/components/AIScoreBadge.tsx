'use client';

import { Star, TrendingUp } from 'lucide-react';

interface AIScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function AIScoreBadge({
  score,
  size = 'md',
  showLabel = true
}: AIScoreBadgeProps) {
  // Determinar colores y etiqueta según el score
  const getScoreConfig = (score: number) => {
    if (score >= 85) {
      return {
        bgColor: 'bg-green-500',
        textColor: 'text-white',
        label: 'Excel·lent',
        icon: Star
      };
    } else if (score >= 70) {
      return {
        bgColor: 'bg-blue-500',
        textColor: 'text-white',
        label: 'Molt bo',
        icon: TrendingUp
      };
    } else if (score >= 50) {
      return {
        bgColor: 'bg-orange-500',
        textColor: 'text-white',
        label: 'Acceptable',
        icon: TrendingUp
      };
    } else {
      return {
        bgColor: 'bg-red-500',
        textColor: 'text-white',
        label: 'Baix',
        icon: TrendingUp
      };
    }
  };

  const config = getScoreConfig(score);
  const IconComponent = config.icon;

  // Configuración de tamaños
  const sizeConfig = {
    sm: {
      container: 'px-2 py-1',
      icon: 'h-3 w-3',
      scoreText: 'text-sm font-bold',
      maxText: 'text-xs opacity-90',
      labelText: 'text-xs ml-1'
    },
    md: {
      container: 'px-3 py-1.5',
      icon: 'h-4 w-4',
      scoreText: 'text-lg font-bold',
      maxText: 'text-xs opacity-90',
      labelText: 'text-xs ml-1'
    },
    lg: {
      container: 'px-4 py-2',
      icon: 'h-5 w-5',
      scoreText: 'text-xl font-bold',
      maxText: 'text-sm opacity-90',
      labelText: 'text-sm ml-2'
    }
  };

  const sizes = sizeConfig[size];

  return (
    <div className={`
      flex items-center gap-2 ${config.bgColor} ${config.textColor}
      ${sizes.container} rounded-full transition-all hover:brightness-110
    `}>
      <IconComponent className={sizes.icon} />

      <div className="flex items-baseline gap-0.5">
        <span className={sizes.scoreText}>
          {score}
        </span>
        <span className={sizes.maxText}>
          /100
        </span>
      </div>

      {showLabel && (
        <span className={sizes.labelText}>
          {config.label}
        </span>
      )}
    </div>
  );
}