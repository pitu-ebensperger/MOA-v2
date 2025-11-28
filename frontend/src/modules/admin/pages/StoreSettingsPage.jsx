import { useState, useEffect } from 'react';
import { Save, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { getStoreConfig, updateStoreConfig } from '@/services/config.api.js';
import { Button } from '@/components/ui/Button.jsx';
import { Input } from '@/components/ui/Input.jsx';
import { Textarea } from '@/components/ui/primitives';
import AdminPageHeader from '@/modules/admin/components/AdminPageHeader.jsx';

const StoreSettingsPage = () => {
  const [config, setConfig] = useState({
    nombre_tienda: '',
    descripcion: '',
    direccion: '',
    telefono: '',
    email: '',
    instagram_url: '',
    facebook_url: '',
    twitter_url: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getStoreConfig();
      const configPayload = response?.data ?? response;
      setConfig(configPayload);
    } catch (err) {
      console.error('Error al cargar configuración:', err);
      setError('Error al cargar la configuración. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      await updateStoreConfig(config);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error al guardar configuración:', err);
      setError(err.response?.data?.message || 'Error al guardar los cambios. Por favor, intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center gap-3 text-primary">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Cargando configuración...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <AdminPageHeader
        title="Configuración de la Tienda"
      />

      {error && (
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-(--color-error)">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <h3 className="font-semibold leading-tight">¡Ups! Algo salió mal</h3>
              <p className="text-sm leading-relaxed">
                Ha ocurrido un error inesperado en la aplicación.
              </p>
            </div>
          </div>
          {typeof error === 'string' && (
            <p className="text-xs text-(--color-text-muted)">
              {error}
            </p>
          )}
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-(--color-success) bg-(--color-success)/10 p-4 text-(--color-success)">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold">¡Éxito!</h3>
            <p className="text-sm">Los cambios se guardaron correctamente.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <section className="rounded-2xl bg-white p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-(--text-strong)">
              Información básica
            </h2>
          </div>
          
          <div className="space-y-5">
            <div>
              <label htmlFor="nombre_tienda" className="mb-2 block text-sm font-medium text-(--color-secondary1)">
                Nombre de la tienda
              </label>
              <Input
                id="nombre_tienda"
                name="nombre_tienda"
                value={config.nombre_tienda}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="descripcion" className="mb-2 block text-sm font-medium text-(--color-secondary1)">
                Descripción breve
              </label>
              <Textarea
                id="descripcion"
                name="descripcion"
                value={config.descripcion}
                onChange={handleChange}
                required
                className="bg-white text-(--color-primary2)"
              />
              <p className="mt-2 text-sm text-(--color-text-muted)">
                Este texto se muestra en el footer del sitio y en algunos módulos de comunicación.
              </p>
            </div>
          </div>
        </section>

        {/* Información de Contacto */}
        <section className="rounded-2xl bg-white p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-(--text-strong)">
              Información de contacto
            </h2>
          </div>
          
          <div className="space-y-5">
            <div>
              <label htmlFor="direccion" className="mb-2 block text-sm font-medium text-(--color-secondary1)">
                Dirección física
              </label>
              <Input
                id="direccion"
                name="direccion"
                value={config.direccion}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="telefono" className="mb-2 block text-sm font-medium text-(--color-secondary1)">
                  Teléfono
                </label>
                <Input
                  id="telefono"
                  name="telefono"
                  value={config.telefono}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-(--color-secondary1)">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={config.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
        </section>

        {/* Redes Sociales */}
        <section className="rounded-2xl bg-white p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-(--text-strong)">
              Redes sociales
            </h2>
          </div>
          
          <div className="space-y-5">
            <div>
              <label htmlFor="instagram_url" className="mb-2 block text-sm font-medium text-(--color-secondary1)">
                Instagram
              </label>
              <Input
                id="instagram_url"
                name="instagram_url"
                type="url"
                value={config.instagram_url}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="facebook_url" className="mb-2 block text-sm font-medium text-(--color-secondary1)">
                Facebook
              </label>
              <Input
                id="facebook_url"
                name="facebook_url"
                type="url"
                value={config.facebook_url}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="twitter_url" className="mb-2 block text-sm font-medium text-(--color-secondary1)">
                Twitter / X
              </label>
              <Input
                id="twitter_url"
                name="twitter_url"
                type="url"
                value={config.twitter_url}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* Botones de Acción */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            appearance="ghost"
            intent="neutral"
            size="sm"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={loadConfig}
            disabled={saving}
          >
            Recargar
          </Button>
          
          <Button
            type="submit"
            appearance="solid"
            intent="primary"
            size="sm"
            leftIcon={saving ? null : <Save className="h-4 w-4" />}
            loading={saving}
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StoreSettingsPage;
