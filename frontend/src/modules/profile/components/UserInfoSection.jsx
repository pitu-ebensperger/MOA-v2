import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@/lib/react-query-lite'
import { useAuth } from '../../../context/auth-context.js'
import { authApi } from '../../../services/auth.api.js'
import { usersApi } from '../../../services/users.api.js'
import { IconButton } from "@/components/ui/Button.jsx";
import { TooltipNeutral } from "@/components/ui/Tooltip.jsx";
import { Edit3 } from "lucide-react";

const UserInfoSection = () => {
  const { user, token } = useAuth();  
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Query para obtener perfil del usuario
  const { data: profileData, isLoading: loading, error } = useQuery({
    queryKey: ['userProfile', token],
    queryFn: () => authApi.profile(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
  });

  // Actualizar form cuando lleguen los datos
  useEffect(() => {
    if (profileData) {
      setForm({
        nombre: profileData.nombre || "",
        email: profileData.email || "",
        telefono: profileData.telefono || "",
      });
    }
  }, [profileData]);

  // Mutation para actualizar usuario
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }) => usersApi.updateUser(userId, data),
    onSuccess: (updatedData) => {
      // Actualizar cache
      queryClient.setQueryData(['userProfile', token], (old) => ({
        ...old,
        ...updatedData.user,
      }));
      
      // Actualizar form local
      if (updatedData.user) {
        setForm({
          nombre: updatedData.user.nombre,
          email: updatedData.user.email,
          telefono: updatedData.user.telefono,
        });
      }
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Error PATCH:", error);
    },
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveClick = () => {
    if (!user || !(user.id || user.usuario_id)) {
      console.error('[UserInfoSection] No hay usuario válido para actualizar');
      return;
    }

    const userId = user.id || user.usuario_id;
    updateUserMutation.mutate({
      userId,
      data: {
        nombre: form.nombre,
        telefono: form.telefono,
      },
    });
  };

  // Guard: Si no hay token, mostrar mensaje de autenticación requerida
  if (!token) {
    return (
      <section className="space-y-6">
        <div className="bg-(--color-error)/10 rounded-2xl p-8 text-center">
          <p className="text-(--color-error) font-medium">Debes iniciar sesión para ver tu perfil</p>
          <Link to="/login" className="mt-4 inline-block px-6 py-2 bg-(--color-primary1) text-white rounded-full hover:bg-(--color-primary2) transition">
            Iniciar Sesión
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl text-(--text-strong)">Mi Perfil</h1>
          <p className="text-(--text-secondary1) text-sm mt-1">Gestiona tu información personal</p>
        </div>
        {!isEditing && (
          <TooltipNeutral label="Editar perfil" position="bottom">
            <IconButton
              aria-label="Editar perfil"
              appearance="solid"
              intent="neutral"
              size="md"
              icon={<Edit3 className="h-4 w-4" />}
              onClick={() => setIsEditing(true)}
            />
          </TooltipNeutral>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-(--color-light) rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-32 h-32 rounded-full bg-(--color-primary4) flex items-center justify-center">
              <i className="fa-solid fa-user text-5xl text-(--color-primary1)"></i>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-(--text-strong)">@{form.nombre || "Usuario"}</h2>
              <p className="text-sm text-(--text-secondary1)">{form.email}</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="flex-1 space-y-6">
            {loading && (
              <div className="bg-(--color-primary4)/50 rounded-2xl p-4 text-center">
                <p className="text-sm text-(--text-secondary1)">Cargando información...</p>
              </div>
            )}

            {error && (
              <div className="bg-(--color-error)/10 rounded-2xl p-4 text-center">
                <p className="text-sm text-(--color-error)">Error: {error.message || "No se pudo cargar la información"}</p>
              </div>
            )}

            <form className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="nombre" className="block text-sm font-medium text-(--text-strong)">
                  Nombre
                </label>
                <input
                  id="nombre"
                  type="text"
                  name="nombre"
                  disabled={!isEditing}
                  value={form.nombre}
                  onChange={handleChange}
                  className="w-full rounded-2xl bg-white/75 px-4 py-3 text-(--text-strong) outline-none transition focus:bg-white focus:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Tu nombre"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-(--text-strong)">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  disabled
                  value={form.email}
                  className="w-full rounded-2xl bg-white/75 px-4 py-3 text-(--text-secondary1) cursor-not-allowed opacity-50"
                  placeholder="tu@email.com"
                />
                {isEditing && (
                  <p className="text-xs text-(--text-muted)">El email no se puede modificar</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="telefono" className="block text-sm font-medium text-(--text-strong)">
                  Teléfono
                </label>
                <input
                  id="telefono"
                  type="tel"
                  name="telefono"
                  disabled={!isEditing}
                  value={form.telefono}
                  onChange={handleChange}
                  className="w-full rounded-2xl bg-white/75 px-4 py-3 text-(--text-strong) outline-none transition focus:bg-white focus:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="+56 9 1234 5678"
                />
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 bg-white/75 text-(--text-strong) rounded-full font-medium transition-all hover:bg-white hover:shadow-md active:scale-95 text-sm"
                    onClick={() => setIsEditing(false)}
                    disabled={updateUserMutation.isPending}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 bg-(--color-primary1) text-white rounded-full font-medium transition-all hover:bg-(--color-primary2) hover:shadow-md active:scale-95 text-sm disabled:opacity-50"
                    onClick={handleSaveClick}
                    disabled={updateUserMutation.isPending}
                  >
                    {updateUserMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserInfoSection
