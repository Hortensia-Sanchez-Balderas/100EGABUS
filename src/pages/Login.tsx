import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bus, Shield, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-green-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute border border-green-400 rounded-full"
              style={{
                width: `${(i + 1) * 80}px`,
                height: `${(i + 1) * 80}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-md relative">
        {/* Header Card */}
        <div className="bg-green-800 rounded-t-2xl px-8 py-6 text-center border border-green-700">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="bg-green-500 p-2.5 rounded-xl">
              <Bus className="text-white" size={28} />
            </div>
            <div className="text-left">
              <p className="text-green-300 text-xs font-medium tracking-wider uppercase">Sistema de Gestión de Transporte</p>
            </div>
          </div>
          <p className="text-green-400 text-sm mt-2">Municipio de Ciénega de Flores, N.L.</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-b-2xl px-8 py-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Shield size={18} className="text-green-600" />
            <h2 className="text-gray-800 font-semibold text-lg">Acceso al Sistema</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="usuario@100egabus.mx"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all pr-11"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">Cuentas de demostración</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setEmail('admin@100egabus.mx'); setPassword('admin123456'); }}
                className="text-xs bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg py-2 px-3 transition-colors"
              >
                Administrador
              </button>
              <button
                onClick={() => { setEmail('operador@100egabus.mx'); setPassword('operador123456'); }}
                className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg py-2 px-3 transition-colors"
              >
                Operador
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-green-500 text-xs mt-4 opacity-60">
          Sistema Integral de Gestión y Optimización del Transporte v1.0
        </p>
      </div>
    </div>
  );
}
