import { useState } from 'react';
import PropTypes from 'prop-types';
import { MapPin, Plus, Trash2, Star, StarOff, Edit } from "lucide-react";
import { useAddresses } from '@/context/AddressContext.jsx'
import { Button } from '@/components/shadcn/ui/button.jsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/radix/Dialog.jsx';
import { Input } from '@/components/shadcn/ui/input.jsx'
import { Label } from '@/components/shadcn/ui/label.jsx'
import { Textarea } from '@/components/shadcn/ui/textarea.jsx'

// Alias para AlertDialog (usamos Dialog)
const AlertDialog = Dialog;
const AlertDialogContent = DialogContent;
const AlertDialogHeader = DialogHeader;
const AlertDialogTitle = DialogTitle;
const AlertDialogDescription = DialogDescription;
const AlertDialogFooter = DialogFooter;
const AlertDialogAction = Button;
const AlertDialogCancel = (props) => <DialogClose asChild><Button variant="outline" {...props} /></DialogClose>;

// Regiones de Chile
const REGIONES = [
  'Arica y Parinacota',
  'Tarapacá',
  'Antofagasta',
  'Atacama',
  'Coquimbo',
  'Valparaíso',
  'Metropolitana',
  "O'Higgins",
  'Maule',
  'Ñuble',
  'Biobío',
  'Araucanía',
  'Los Ríos',
  'Los Lagos',
  'Aysén',
  'Magallanes',
];

const addressShape = PropTypes.shape({
  direccion_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  calle: PropTypes.string,
  departamento: PropTypes.string,
  comuna: PropTypes.string,
  ciudad: PropTypes.string,
  region: PropTypes.oneOf(REGIONES),
  codigo_postal: PropTypes.string,
  referencia: PropTypes.string,
  etiqueta: PropTypes.string,
  predeterminada: PropTypes.bool,
});

const noopAsync = async () => {};

const AddressCard = ({ address, onEdit, onDelete, onSetDefault }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <div className={`border rounded-lg p-4 ${address.predeterminada ? 'border-primary bg-primary/5' : ''}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            {address.predeterminada && (
              <Star className="w-4 h-4 fill-primary text-primary" />
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(address)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>

        <div className="space-y-1 text-sm">
          <p className="font-medium">{address.calle}</p>
          {address.departamento && <p className="text-muted-foreground">{address.departamento}</p>}
          <p className="text-muted-foreground">
            {address.comuna}, {address.ciudad}
          </p>
          <p className="text-muted-foreground">{address.region}</p>
          {address.codigo_postal && (
            <p className="text-muted-foreground">CP: {address.codigo_postal}</p>
          )}
          {address.referencia && (
            <p className="text-muted-foreground italic mt-2">"{address.referencia}"</p>
          )}
        </div>

        {!address.predeterminada && (
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            onClick={() => onSetDefault(address.direccion_id)}
          >
            <Star className="w-3 h-3 mr-1" />
            Establecer como predeterminada
          </Button>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar dirección?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La dirección será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(address.direccion_id);
                setShowDeleteDialog(false);
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

AddressCard.propTypes = {
  address: addressShape.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onSetDefault: PropTypes.func.isRequired,
};

const AddressForm = ({ address, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(
    address || {
      calle: '',
      departamento: '',
      comuna: '',
      ciudad: '',
      region: '',
      codigo_postal: '',
      referencia: '',
      predeterminada: false,
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked) => {
    setFormData(prev => ({ ...prev, predeterminada: checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Remover campos vacíos opcionales
    const cleanData = { ...formData };
    if (!cleanData.departamento) delete cleanData.departamento;
    if (!cleanData.codigo_postal) delete cleanData.codigo_postal;
    if (!cleanData.referencia) delete cleanData.referencia;

    onSubmit(cleanData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="calle">Calle y número *</Label>
        <Input
          id="calle"
          name="calle"
          placeholder="Ej: Av. Providencia 1234"
          value={formData.calle}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="departamento">Depto/Oficina</Label>
        <Input
          id="departamento"
          name="departamento"
          placeholder="Ej: Depto 501"
          value={formData.departamento}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="comuna">Comuna *</Label>
          <Input
            id="comuna"
            name="comuna"
            placeholder="Ej: Providencia"
            value={formData.comuna}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ciudad">Ciudad *</Label>
          <Input
            id="ciudad"
            name="ciudad"
            placeholder="Ej: Santiago"
            value={formData.ciudad}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="region">Región *</Label>
        <select
          id="region"
          name="region"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={formData.region}
          onChange={handleChange}
          required
        >
          <option value="">Seleccionar región</option>
          {REGIONES.map(region => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="codigo_postal">Código Postal</Label>
        <Input
          id="codigo_postal"
          name="codigo_postal"
          placeholder="Ej: 7500000"
          value={formData.codigo_postal}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="referencia">Referencia adicional</Label>
        <Textarea
          id="referencia"
          name="referencia"
          placeholder="Ej: Casa azul con portón blanco"
          value={formData.referencia}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="predeterminada"
          checked={formData.predeterminada}
          onChange={(e) => handleCheckboxChange(e.target.checked)}
          className="w-4 h-4 cursor-pointer"
        />
        <Label htmlFor="predeterminada" className="cursor-pointer">
          Establecer como dirección predeterminada
        </Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {address ? 'Actualizar' : 'Agregar'} dirección
        </Button>
      </DialogFooter>
    </form>
);
};

AddressForm.propTypes = {
  address: addressShape,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

AddressForm.defaultProps = {
  address: null,
};

export const AddressesSection = ({
  addresses: controlledAddresses,
  loading: controlledLoading,
  error: controlledError,
  addAddress: controlledAddAddress,
  updateAddress: controlledUpdateAddress,
  setDefault: controlledSetDefault,
  removeAddress: controlledRemoveAddress,
} = {}) => {
  const addressesContext = useAddresses();

  const addresses = controlledAddresses ?? addressesContext?.addresses ?? [];
  const loading = controlledLoading ?? addressesContext?.loading ?? false;
  const error = controlledError ?? addressesContext?.error ?? null;
  const addAddress = controlledAddAddress ?? addressesContext?.addAddress ?? noopAsync;
  const updateAddress = controlledUpdateAddress ?? addressesContext?.updateAddress ?? noopAsync;
  const setDefault = controlledSetDefault ?? addressesContext?.setDefault ?? noopAsync;
  const removeAddress = controlledRemoveAddress ?? addressesContext?.removeAddress ?? noopAsync;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const handleAdd = async (data) => {
    try {
      await addAddress(data);
      closeDialog();
    } catch (err) {
      console.error('Error al agregar dirección:', err);
    }
  };

  const handleEdit = async (data) => {
    try {
      await updateAddress(editingAddress.direccion_id, data);
      closeDialog();
    } catch (err) {
      console.error('Error al actualizar dirección:', err);
    }
  };

  const handleSetDefault = async (direccionId) => {
    try {
      await setDefault(direccionId);
    } catch (err) {
      console.error('Error al establecer dirección predeterminada:', err);
    }
  };

  const handleDelete = async (direccionId) => {
    try {
      await removeAddress(direccionId);
    } catch (err) {
      console.error('Error al eliminar dirección:', err);
    }
  };

  const openDialog = (address = null) => {
    setEditingAddress(address);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingAddress(null);
  };

  if (loading && addresses.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Cargando direcciones...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Mis Direcciones</h2>
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Agregar dirección
        </Button>
      </div>

      {dialogOpen && (
        <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? 'Editar dirección' : 'Nueva dirección'}
              </DialogTitle>
              <DialogDescription>
                {editingAddress
                  ? 'Modifica los datos de tu dirección'
                  : 'Completa los datos de tu nueva dirección de envío'
                }
              </DialogDescription>
            </DialogHeader>
            <AddressForm
              address={editingAddress}
              onSubmit={editingAddress ? handleEdit : handleAdd}
              onCancel={closeDialog}
            />
          </DialogContent>
        </Dialog>
      )}

      {error && (
        <div className="p-4 border border-destructive bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">
            No tienes direcciones guardadas
          </p>
          <Button onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar tu primera dirección
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
            {addresses.map(address => (
              <AddressCard
                key={address.direccion_id}
                address={address}
                onEdit={openDialog}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
              />
          ))}
        </div>
      )}
    </div>
  );
};

AddressesSection.propTypes = {
  addresses: PropTypes.arrayOf(addressShape),
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.node, PropTypes.instanceOf(Error)]),
  addAddress: PropTypes.func,
  updateAddress: PropTypes.func,
  setDefault: PropTypes.func,
  removeAddress: PropTypes.func,
};

AddressesSection.defaultProps = {
  addresses: undefined,
  loading: undefined,
  error: undefined,
  addAddress: undefined,
  updateAddress: undefined,
  setDefault: undefined,
  removeAddress: undefined,
};
