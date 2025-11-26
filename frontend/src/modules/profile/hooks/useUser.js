import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/services/api-client.js';
import { useAuth } from '@/context/AuthContext.jsx';

export const useUser = () => {
  const { user: authUser } = useAuth(); // traemos el usuario autenticado
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchAbortRef = useRef(null);
  const updateAbortRef = useRef(null);

  const abortOutstanding = useCallback((ref) => {
    if (ref.current) {
      ref.current.abort();
      ref.current = null;
    }
  }, []);

  // Traer perfil del usuario 
  const fetchProfile = useCallback(async () => {
    if (!authUser) {
      setProfile(null);
      setError(null);
      setLoading(false);
      return;
    }
    abortOutstanding(fetchAbortRef);
    const controller = new AbortController();
    fetchAbortRef.current = controller;
    setLoading(true);
    try {
      const data = await apiClient.private.get(`/api/users/${authUser.id}`, {
        signal: controller.signal,
      });
      setProfile(data);
      setError(null);
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(err);
      }
    } finally {
      if (fetchAbortRef.current === controller) {
        fetchAbortRef.current = null;
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }
  }, [abortOutstanding, authUser]);

  // Actualizar perfil del usuario
  const updateProfile = useCallback(async (updatedData) => {
    if (!authUser) return;
    abortOutstanding(updateAbortRef);
    const controller = new AbortController();
    updateAbortRef.current = controller;
    setLoading(true);
    try {
      const data = await apiClient.private.put(
        `/api/users/${authUser.id}`,
        updatedData,
        { signal: controller.signal }
      );
      setProfile(data);
      setError(null);
      return data;
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(err);
      }
      if (!controller.signal.aborted) {
        throw err;
      }
    } finally {
      if (updateAbortRef.current === controller) {
        updateAbortRef.current = null;
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }
  }, [abortOutstanding, authUser]);

  useEffect(() => {
    fetchProfile();
  }, [authUser, fetchProfile]);

  useEffect(() => {
    return () => {
      abortOutstanding(fetchAbortRef);
      abortOutstanding(updateAbortRef);
    };
  }, [abortOutstanding]);

  return { profile, loading, error, fetchProfile, updateProfile };
};
