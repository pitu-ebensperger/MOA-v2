import { useEffect, useState } from 'react';
import { useAddresses, useCreateAddress } from '@/hooks/useAddresses.query';
import { useAuth } from '@/context/AuthContext.jsx';
import { Input, Textarea } from '@/components/ui/Input.jsx';
import { Card, CardContent } from '@/components/shadcn/ui/card.jsx';
import { Label } from '@/components/shadcn/ui/label.jsx';
import { buttonClasses } from '@/components/shadcn/ui/button-classes.js';

const getAddressId = (address) => address?.direccion_id ?? address?.id ?? address?.address_id ?? null;

export function AddressSelector({ onSelect, className = '' }) {
  const { addresses, isLoading: loading, error, refetch } = useAddresses();
  const [mode, setMode] = useState('lista'); // 'lista' | 'nueva'
  const [selectedId, setSelectedId] = useState(null);
  const { user } = useAuth();
  const buildInitialForm = () => ({
    nombre_contacto: user?.nombre || user?.name || '',
    telefono_contacto: user?.telefono || user?.phone || '',
    calle: '',
    numero: '',
    comuna: '',
    ciudad: '',
    region: '',
    referencia: ''
  });
  const [formData, setFormData] = useState(buildInitialForm);
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      nombre_contacto: prev.nombre_contacto || user?.nombre || user?.name || '',
      telefono_contacto: prev.telefono_contacto || user?.telefono || user?.phone || '',
    }));
  }, [user]);
  const [saving, setSaving] = useState(false);

  const createAddressMutation = useCreateAddress();

  const handleSelect = (id) => {
    const normalizedId = id == null ? null : String(id);
    setSelectedId(normalizedId);
    const addr = addresses.find(a => String(getAddressId(a)) === normalizedId) || null;
    if (onSelect) onSelect(addr);
  };

  const handleField = (field) => (e) => {
    setFormData(f => ({ ...f, [field]: e.target.value }));
  };

  const canSave = formData.nombre_contacto && formData.telefono_contacto && formData.calle && formData.numero && formData.comuna && formData.ciudad && formData.region;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const created = await createAddressMutation.mutateAsync(formData);
      setMode('lista');
      const createdId = getAddressId(created);
      setSelectedId(createdId ? String(createdId) : null);
      if (onSelect) onSelect(created);
      setFormData(buildInitialForm());

      refetch();        // ensure fresh data
    } catch (err) {
      console.error('[AddressSelector] Error saving address', err);
      err && null;
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <Label required className="normal-case tracking-normal text-sm font-medium text-(--color-primary2)">Dirección de entrega*</Label>
        <button
          type="button"
          onClick={() => setMode(m => m === 'lista' ? 'nueva' : 'lista')}
          className={buttonClasses({
            variant: 'ghost',
            size: 'sm',
            className: 'text-xs'
          })}
        >
          {mode === 'lista' ? 'Nueva dirección' : 'Ver guardadas'}
        </button>
      </div>
      <Card className="bg-(--color-lightest)/60">
        <CardContent className="p-4">
          {loading && <p className="text-xs text-(--color-text-muted)">Cargando direcciones…</p>}
          {error && <p className="text-xs text-(--color-error)">{error}</p>}

          {!loading && mode === 'lista' && (
            <div className="space-y-2">
              {addresses.length === 0 && (
                <p className="text-xs text-(--color-text-secondary)">No tienes direcciones guardadas aún.</p>
              )}
              {addresses.map(addr => {
                const addrId = getAddressId(addr);
                if (addrId == null) return null;
                const addrIdStr = String(addrId);
                return (
                  <button
                    key={addrIdStr}
                    type="button"
                    onClick={() => handleSelect(addrIdStr)}
                    className={buttonClasses({
                      variant: selectedId === addrIdStr ? 'outline' : 'ghost',
                      size: 'sm',
                      className: 'w-full justify-start text-left flex flex-col gap-0.5'
                    })}
                  >
                    <span className="text-xs font-semibold text-(--color-primary2)">
                      {[addr.calle, addr.numero].filter(Boolean).join(' ')}
                      {addr.comuna ? `, ${addr.comuna}` : ''}
                    </span>
                    <span className="text-[0.65rem] text-(--color-text-muted)">{addr.ciudad}{addr.region ? `, ${addr.region}` : ''}</span>
                  </button>
                );
              })}
            </div>
          )}

          {!loading && mode === 'nueva' && (
            <div className="space-y-3">
              <Input
                label="Nombre de contacto"
                required
                value={formData.nombre_contacto}
                onChange={handleField('nombre_contacto')}
                size="sm"
                placeholder="Ej: Ana Pérez"
                fullWidth
              />
              <Input
                label="Teléfono de contacto"
                required
                type="tel"
                value={formData.telefono_contacto}
                onChange={handleField('telefono_contacto')}
                size="sm"
                placeholder="+56 9 1234 5678"
                fullWidth
              />
              <Input
                label="Calle"
                required
                value={formData.calle}
                onChange={handleField('calle')}
                size="sm"
                placeholder="Ej: Av. Principal"
                fullWidth
              />
              <Input
                label="Número"
                required
                value={formData.numero}
                onChange={handleField('numero')}
                size="sm"
                placeholder="1234"
                fullWidth
              />
              <Input
                label="Comuna"
                required
                value={formData.comuna}
                onChange={handleField('comuna')}
                size="sm"
                placeholder="Comuna"
                fullWidth
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Ciudad"
                  required
                  value={formData.ciudad}
                  onChange={handleField('ciudad')}
                  size="sm"
                  placeholder="Ciudad"
                  fullWidth
                />
                <Input
                  label="Región"
                  required
                  value={formData.region}
                  onChange={handleField('region')}
                  size="sm"
                  placeholder="Región"
                  fullWidth
                />
              </div>
              <Textarea
                label="Referencia"
                value={formData.referencia}
                onChange={handleField('referencia')}
                variant="neutral"
                placeholder="Depto, indicaciones extra, etc. (opcional)"
                rows={3}
                fullWidth
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={!canSave || saving}
                  onClick={handleSave}
                  className={buttonClasses({
                    size: 'sm',
                    variant: 'primary',
                    className: 'text-xs disabled:opacity-50'
                  })}
                >
                  {saving ? 'Guardando…' : 'Guardar dirección'}
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
