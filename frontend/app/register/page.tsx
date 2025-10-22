'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

type AdministrationType = 'LOCAL' | 'AUTONOMICA' | 'CENTRAL';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nick: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    administration: '' as AdministrationType | '',
    acceptTerms: false,
    acceptPrivacy: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validations, setValidations] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [checkingNick, setCheckingNick] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Debounce timer refs
  const [nickTimer, setNickTimer] = useState<NodeJS.Timeout | null>(null);
  const [emailTimer, setEmailTimer] = useState<NodeJS.Timeout | null>(null);

  // Generar color aleatorio para avatar
  const generateRandomColor = () => {
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
      '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Obtener gradiente según administración
  const getGradientByAdministration = (admin: AdministrationType) => {
    const gradients = {
      LOCAL: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      AUTONOMICA: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
      CENTRAL: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    };
    return gradients[admin];
  };

  // Validar nick
  const validateNick = (nick: string) => {
    const nickRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!nick) return 'El nick és obligatori';
    if (!nickRegex.test(nick)) {
      return 'Només lletres, números, guions i guió baix (3-20 caràcters)';
    }
    return '';
  };

  // Validar email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "L'email és obligatori";
    if (!emailRegex.test(email)) return 'Format email no vàlid';
    return '';
  };

  // Calcular força de contrasenya
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  // Validar contrasenya
  const validatePassword = (password: string) => {
    if (!password) return 'La contrasenya és obligatòria';
    if (password.length < 8) return 'Mínim 8 caràcters';
    if (!/[A-Z]/.test(password)) return 'Ha de tenir almenys una majúscula';
    if (!/[a-z]/.test(password)) return 'Ha de tenir almenys una minúscula';
    if (!/[0-9]/.test(password)) return 'Ha de tenir almenys un número';
    return '';
  };

  // Check nick únic amb debounce
  useEffect(() => {
    if (formData.nick && !validateNick(formData.nick)) {
      if (nickTimer) clearTimeout(nickTimer);

      const newTimer = setTimeout(async () => {
        setCheckingNick(true);
        try {
          const response = await api.get(`/auth/check-nick/${formData.nick}`);
          setValidations(prev => ({ ...prev, nick: response.data.available }));
          if (!response.data.available) {
            setErrors(prev => ({ ...prev, nick: 'Aquest nick ja està en ús' }));
          }
        } catch (error) {
          console.error('Error checking nick:', error);
        } finally {
          setCheckingNick(false);
        }
      }, 500);

      setNickTimer(newTimer);
    }
  }, [formData.nick]);

  // Check email únic amb debounce
  useEffect(() => {
    if (formData.email && !validateEmail(formData.email)) {
      if (emailTimer) clearTimeout(emailTimer);

      const newTimer = setTimeout(async () => {
        setCheckingEmail(true);
        try {
          const response = await api.get(`/auth/check-email/${formData.email}`);
          setValidations(prev => ({ ...prev, email: response.data.available }));
          if (!response.data.available) {
            setErrors(prev => ({ ...prev, email: 'Aquest email ja està registrat' }));
          }
        } catch (error) {
          console.error('Error checking email:', error);
        } finally {
          setCheckingEmail(false);
        }
      }, 500);

      setEmailTimer(newTimer);
    }
  }, [formData.email]);

  // Actualitzar força de contrasenya
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(formData.password));
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Validar en temps real
    let error = '';
    if (name === 'nick') {
      error = validateNick(value);
    } else if (name === 'email') {
      error = validateEmail(value);
    } else if (name === 'firstName' && value.length < 2) {
      error = 'Mínim 2 caràcters';
    } else if (name === 'lastName' && value.length < 2) {
      error = 'Mínim 2 caràcters';
    } else if (name === 'password') {
      error = validatePassword(value);
    } else if (name === 'confirmPassword') {
      error = value !== formData.password ? 'Les contrasenyes no coincideixen' : '';
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    if (!error && value) {
      setValidations(prev => ({
        ...prev,
        [name]: true
      }));
    } else {
      setValidations(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  const isFormValid = () => {
    return (
      formData.nick &&
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.password &&
      formData.confirmPassword === formData.password &&
      formData.administration &&
      formData.acceptTerms &&
      formData.acceptPrivacy &&
      !Object.values(errors).some(err => err) &&
      validations.nick &&
      validations.email
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        nick: formData.nick,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        administration: formData.administration,
        avatarInitials: formData.firstName[0].toUpperCase() + formData.lastName[0].toUpperCase(),
        avatarColor: generateRandomColor(),
        coverGradient: getGradientByAdministration(formData.administration as AdministrationType)
      });

      if (response.data.success) {
        // Guardar token i info d'usuari
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Redirigir a dashboard
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrors({
        general: err.response?.data?.error || 'Error en el registre'
      });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Dèbil';
    if (passwordStrength <= 3) return 'Mitjana';
    return 'Forta';
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'text-red-500';
    if (passwordStrength <= 3) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 py-4 px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl py-6 px-8">
        <div className="text-center mb-6">
          <img
            src="/images/cropped-logo_la-Pública-ok-2.png"
            alt="La Pública"
            className="w-[150px] h-auto mx-auto mb-3"
          />
          <p className="text-gray-600 text-sm">Crea el teu compte</p>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nick */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nick d'usuari *
            </label>
            <div className="relative">
              <input
                type="text"
                name="nick"
                value={formData.nick}
                onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.nick ? 'border-red-500' : validations.nick ? 'border-green-500' : 'border-gray-300'
                }`}
                placeholder="joanmarti"
              />
              <div className="absolute right-3 top-3">
                {checkingNick ? (
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                ) : validations.nick ? (
                  <span className="text-green-500">✓</span>
                ) : errors.nick ? (
                  <span className="text-red-500">✗</span>
                ) : null}
              </div>
            </div>
            {!errors.nick && formData.nick && (
              <p className="text-xs text-gray-500 mt-1">Aquest serà el teu @{formData.nick} a la comunitat</p>
            )}
            {errors.nick && (
              <p className="text-xs text-red-500 mt-1">{errors.nick}</p>
            )}
          </div>

          {/* Nom */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.firstName ? 'border-red-500' : formData.firstName ? 'border-green-500' : 'border-gray-300'
              }`}
              placeholder="Joan"
            />
            {errors.firstName && (
              <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
            )}
          </div>

          {/* Cognoms */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cognoms *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.lastName ? 'border-red-500' : formData.lastName ? 'border-green-500' : 'border-gray-300'
              }`}
              placeholder="Martí Garcia"
            />
            {errors.lastName && (
              <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
            )}
          </div>

          {/* Email */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.email ? 'border-red-500' : validations.email ? 'border-green-500' : 'border-gray-300'
                }`}
                placeholder="joan.marti@exemple.cat"
              />
              <div className="absolute right-3 top-3">
                {checkingEmail ? (
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                ) : validations.email ? (
                  <span className="text-green-500">✓</span>
                ) : errors.email ? (
                  <span className="text-red-500">✗</span>
                ) : null}
              </div>
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Contrasenya */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Contrasenya *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.password ? 'border-red-500' : formData.password && !errors.password ? 'border-green-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? '👁' : '👁‍🗨'}
              </button>
            </div>
            {formData.password && (
              <div className="mt-2">
                <div className="flex justify-between text-xs">
                  <span>Força:</span>
                  <span className={getPasswordStrengthColor()}>{getPasswordStrengthText()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      passwordStrength <= 2 ? 'bg-red-500' :
                      passwordStrength <= 3 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  ></div>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                )}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Mínim 8 caràcters, 1 majúscula, 1 minúscula, 1 número
            </p>
          </div>

          {/* Confirmar contrasenya */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar contrasenya *</label>
            <div className="relative">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.confirmPassword ? 'border-red-500' :
                  formData.confirmPassword && formData.confirmPassword === formData.password ? 'border-green-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              <div className="absolute right-3 top-3">
                {formData.confirmPassword && (
                  formData.confirmPassword === formData.password ? (
                    <span className="text-green-500">✓</span>
                  ) : (
                    <span className="text-red-500">✗</span>
                  )
                )}
              </div>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Administració */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">Administració *</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'LOCAL', title: 'Local', subtitle: 'Ajuntaments, Diputacions' },
                { value: 'AUTONOMICA', title: 'Autonòmica', subtitle: 'Generalitat de Catalunya' },
                { value: 'CENTRAL', title: 'Central', subtitle: "Administració General de l'Estat" }
              ].map(option => (
                <label
                  key={option.value}
                  className={`relative flex flex-col items-center p-2 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-400 hover:shadow-md ${
                    formData.administration === option.value
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="administration"
                    value={option.value}
                    checked={formData.administration === option.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className={`font-semibold text-sm ${
                      formData.administration === option.value ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {option.title}
                    </div>
                    <div className={`text-xs mt-1 ${
                      formData.administration === option.value ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {option.subtitle}
                    </div>
                  </div>
                  {formData.administration === option.value && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      ✓
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Acceptació */}
          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="flex items-start">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="mt-1 mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Accepto els{' '}
                <Link href="/termes" className="text-blue-600 hover:underline font-medium">
                  Termes i Condicions
                </Link>
              </span>
            </label>

            <label className="flex items-start">
              <input
                type="checkbox"
                name="acceptPrivacy"
                checked={formData.acceptPrivacy}
                onChange={handleChange}
                className="mt-1 mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Accepto la{' '}
                <Link href="/privacitat" className="text-blue-600 hover:underline font-medium">
                  Política de Privacitat
                </Link>
              </span>
            </label>
          </div>

          {/* Botó */}
          <div className="col-span-1 md:col-span-2 mt-2">
            <button
              type="submit"
              disabled={!isFormValid() || loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Creant compte...
                </span>
              ) : (
                'Crear el meu compte'
              )}
            </button>
          </div>

          {/* Link a login */}
          <div className="col-span-1 md:col-span-2 text-center mt-2">
            <p className="text-sm text-gray-600">
              Ja tens compte?{' '}
              <Link href="/login" className="text-blue-600 hover:underline font-semibold">
                Inicia sessió
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}