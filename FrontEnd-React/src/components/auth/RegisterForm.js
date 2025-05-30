import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    cedula: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.cedula) {
      newErrors.cedula = 'La cédula es requerida';
    } else if (!/^\d{8,10}$/.test(formData.cedula)) {
      newErrors.cedula = 'La cédula debe tener entre 8 y 10 dígitos';
    }

    if (formData.telefono && !/^\d{10}$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono debe tener 10 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      showNotification('Registro exitoso. Bienvenido a DocuControl AI', 'success');
      navigate('/dashboard');
    } catch (error) {
      showNotification(
        error.response?.data?.mensaje || 'Error al registrarse',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">DA</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Crear Cuenta</h2>
          <p className="mt-2 text-sm text-gray-600">
            Regístrate como ciudadano para acceder a los servicios municipales
          </p>
        </div>

        {/* Register Form */}
        <Card className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                label="Nombre Completo"
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                error={errors.nombre}
                placeholder="Juan Pérez"
                required
              />
            </div>

            <div>
              <Input
                label="Cédula"
                type="text"
                name="cedula"
                value={formData.cedula}
                onChange={handleChange}
                error={errors.cedula}
                placeholder="12345678"
                required
              />
            </div>

            <div>
              <Input
                label="Correo Electrónico"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="correo@ejemplo.com"
                required
              />
            </div>

            <div>
              <Input
                label="Teléfono"
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                error={errors.telefono}
                placeholder="3001234567"
              />
            </div>

            <div>
              <Input
                label="Contraseña"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <Input
                label="Confirmar Contraseña"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                id="accept-terms"
                name="accept-terms"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-900">
                Acepto los{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                  términos y condiciones
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              Crear Cuenta
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">¿Ya tienes cuenta?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterForm;
