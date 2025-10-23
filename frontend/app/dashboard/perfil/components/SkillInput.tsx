'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface SkillInputProps {
  skills: string[];
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
  placeholder: string;
  color: 'blue' | 'green';
}

export const SkillInput = ({
  skills,
  onAddSkill,
  onRemoveSkill,
  placeholder,
  color
}: SkillInputProps) => {
  const [input, setInput] = useState('');

  const colorClasses = {
    blue: {
      button: 'bg-blue-600 hover:bg-blue-700',
      focus: 'focus:ring-blue-500',
      tag: 'bg-blue-100 text-blue-800',
      tagHover: 'hover:bg-blue-200'
    },
    green: {
      button: 'bg-green-600 hover:bg-green-700',
      focus: 'focus:ring-green-500',
      tag: 'bg-green-100 text-green-800',
      tagHover: 'hover:bg-green-200'
    }
  };

  const classes = colorClasses[color];

  const handleAdd = () => {
    if (input.trim() && !skills.includes(input.trim())) {
      onAddSkill(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-4">
      {/* Input Section */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className={`flex-1 px-4 py-3 rounded-lg border border-gray-300 ${classes.focus} focus:border-transparent transition-all`}
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          className={`px-4 py-3 ${classes.button} text-white rounded-lg disabled:bg-gray-300 transition-colors`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <p className="text-sm text-gray-500">
        Prem Enter o fes clic en + per afegir
      </p>

      {/* Current Skills/Interests */}
      {skills.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Elements afegits ({skills.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className={`inline-flex items-center gap-1 px-3 py-1 ${classes.tag} text-sm rounded-full`}
              >
                {skill}
                <button
                  onClick={() => onRemoveSkill(skill)}
                  className={`ml-1 ${classes.tagHover} rounded-full p-0.5 transition-colors`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};