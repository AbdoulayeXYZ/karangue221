import { useState, useCallback } from 'react';

export default function useApiResource(api) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger toutes les ressources
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAll();
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Créer une ressource
  const create = useCallback(async (item) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.create(item);
      setData(prev => [...prev, res]);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Mettre à jour une ressource
  const update = useCallback(async (id, item) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.update(id, item);
      setData(prev => prev.map(d => d.id === id ? { ...d, ...item } : d));
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Supprimer une ressource
  const remove = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await api.remove(id);
      setData(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  return { data, loading, error, fetchAll, create, update, remove };
} 