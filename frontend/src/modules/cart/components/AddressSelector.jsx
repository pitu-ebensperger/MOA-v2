import { useState } from 'react';
import { useAddresses, useCreateAddress } from '@/hooks/useAddresses.query';
import { Input, Textarea } from '@/components/ui/Input.jsx';
import { Card, CardContent } from '@/components/shadcn/ui/card.jsx';
import { Label } from '@/components/shadcn/ui/label.jsx';
import { buttonClasses } from '@/components/shadcn/ui/button-classes.js';

export function AddressSelector({ onSelect, className = '' }) {
  const { addresses, isLoading: loading, error, refetch } = useAddresses();
  const [mode, setMode] = useState('lista'); // 'lista' | 'nueva'
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    calle: '',
    comuna: '',
    ciudad: '',
    region: '',
    referencia: ''
  });
  const [saving, setSaving] = useState(false);

  const createAddressMutation = useCreateAddress();

  const handleSelect = (id) => {
    setSelectedId(id);
    const addr = addresses.find(a => a.id === id) || null;
    if (onSelect) onSelect(addr);
  };

  const handleField = (field) => (e) => {
    setFormData(f => ({ ...f, [field]: e.target.value }));
  };

  const canSave = formData.calle && formData.comuna && formData.ciudad && formData.region;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const { data: created } = await createAddressMutation.mutateAsync(formData);
      setMode('lista');
      setSelectedId(created?.id || created?.direccion_id || null);
      if (onSelect) onSelect(created);
      setFormData({ calle: '', comuna: '', ciudad: '', region: '', referencia: '' });

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
              {addresses.map(addr => (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => handleSelect(addr.id)}
                  className={buttonClasses({
                    variant: selectedId === addr.id ? 'outline' : 'ghost',
                    size: 'sm',
                    className: 'w-full justify-start text-left flex flex-col gap-0.5'
                  })}
                >
                  <span className="text-xs font-semibold text-(--color-primary2)">{addr.calle}{addr.comuna ? `, ${addr.comuna}` : ''}</span>
                  <span className="text-[0.65rem] text-(--color-text-muted)">{addr.ciudad}{addr.region ? `, ${addr.region}` : ''}</span>
                </button>
              ))}
            </div>
          )}

          {!loading && mode === 'nueva' && (
            <div className="space-y-3">
              <Input
                label="Calle y número"
                required
                value={formData.calle}
                onChange={handleField('calle')}
                size="sm"
                placeholder="Ej: Av. Principal 1234"
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
