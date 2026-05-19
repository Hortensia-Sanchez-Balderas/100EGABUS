import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Bus, Lock, Mail, AlertCircle } from 'lucide-react';


interface LoginProps {
  onLogin: (role: 'admin' | 'operator', userId: string, userName: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Autenticar con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Error de autenticación:', authError);
        setError('Credenciales incorrectas. Verifica tu email y contraseña.');
        setLoading(false);
        return;
      }

      // Obtener información del usuario desde la tabla usuarios
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError || !userData) {
        console.error('Error obteniendo datos de usuario:', userError);
        setError('No se encontró el usuario en el sistema.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Verificar que el usuario esté activo
      if (!userData.activo) {
        setError('Tu cuenta ha sido desactivada. Contacta al administrador.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Actualizar último acceso
      await supabase
        .from('usuarios')
        .update({ ultimo_acceso: new Date().toISOString() })
        .eq('id', userData.id);

      // Login exitoso - detectar rol automáticamente
      const role = userData.rol === 'admin' ? 'admin' : 'operator';
      onLogin(role, userData.id, userData.nombre_completo);
    } catch (error) {
      console.error('Error en login:', error);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Bus className="w-16 h-16 text-emerald-600" />
          </div>
          <h1 className="text-5xl font-bold text-emerald-800 mb-3">100EGABUS</h1>
          <p className="text-xl text-gray-600">Sistema de Gestión de Transporte Estudiantil</p>
          <p className="text-sm text-gray-500 mt-2">Ciénega de Flores, Nuevo León</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border-2 border-emerald-200">
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-6 text-white">
            <h2 className="text-2xl font-bold text-center">Iniciar Sesión</h2>
            <p className="text-emerald-100 text-sm text-center mt-1">Acceso al sistema</p>
          </div>

          <form onSubmit={handleLogin} className="p-6">
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@100egabus.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all shadow-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Acceder al Sistema'}
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Sistema de análisis y optimización del programa 100EGABUS
          </p>
        </div>
      </div>
    </div>
  );
}
