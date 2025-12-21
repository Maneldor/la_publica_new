'use client'

import { useState, useEffect } from 'react'
import { Linkedin, Twitter, Github, Globe } from 'lucide-react'

interface SocialData {
  linkedin?: string
  twitter?: string
  github?: string
  website?: string
}

interface Step3SocialProps {
  data: SocialData
  onChange: (data: SocialData) => void
}

export default function Step3Social({ data, onChange }: Step3SocialProps) {
  const [formData, setFormData] = useState<SocialData>({
    linkedin: data?.linkedin || '',
    twitter: data?.twitter || '',
    github: data?.github || '',
    website: data?.website || ''
  })

  useEffect(() => {
    onChange(formData)
  }, [formData, onChange])

  const handleChange = (field: keyof SocialData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Xarxes Socials</h3>
        <p className="text-sm text-gray-500">Perfils professionals i socials de l&apos;usuari (opcionals)</p>
      </div>

      <div className="space-y-4">
        {/* LinkedIn */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <Linkedin className="w-4 h-4 inline mr-2 text-[#0077b5]" />
            LinkedIn
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
              linkedin.com/in/
            </span>
            <input
              type="text"
              value={formData.linkedin}
              onChange={(e) => handleChange('linkedin', e.target.value)}
              placeholder="usuari"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Twitter/X */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <Twitter className="w-4 h-4 inline mr-2 text-gray-800" />
            Twitter / X
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
              @
            </span>
            <input
              type="text"
              value={formData.twitter}
              onChange={(e) => handleChange('twitter', e.target.value.replace('@', ''))}
              placeholder="usuari"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* GitHub */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <Github className="w-4 h-4 inline mr-2" />
            GitHub
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
              github.com/
            </span>
            <input
              type="text"
              value={formData.github}
              onChange={(e) => handleChange('github', e.target.value)}
              placeholder="usuari"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <Globe className="w-4 h-4 inline mr-2 text-indigo-500" />
            Pàgina Web Personal
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="https://www.exemple.cat"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Les xarxes socials són opcionals i ajuden a connectar amb altres membres de la comunitat.
          L&apos;usuari podrà modificar-les després des del seu perfil.
        </p>
      </div>
    </div>
  )
}
