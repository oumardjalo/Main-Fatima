import { useState, useEffect, useCallback, useRef } from 'react';
import storage from '../utils/storage';
import { createEmptyDailyBundle } from '../utils/helpers';

export function useDailyData(dateStr) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    (async () => {
      const bundle = await storage.get(`daily:${dateStr}`);
      if (!mounted) return;

      if (bundle) {
        // Merge with empty bundle to ensure all fields exist
        const empty = createEmptyDailyBundle(dateStr);
        setData({ ...empty, ...bundle, date: dateStr });
      } else {
        const habitDefs = await storage.get('habit-definitions');
        setData(createEmptyDailyBundle(dateStr, habitDefs));
      }
      setLoading(false);
    })();

    return () => { mounted = false; };
  }, [dateStr]);

  const updateField = useCallback((field, value) => {
    setData(prev => {
      if (!prev) return prev;
      const updated = { ...prev, [field]: value };

      // Debounced save
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        storage.set(`daily:${dateStr}`, updated);
      }, 500);

      return updated;
    });
  }, [dateStr]);

  const saveImmediate = useCallback((newData) => {
    setData(newData);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    storage.set(`daily:${dateStr}`, newData);
  }, [dateStr]);

  return { data, loading, updateField, saveImmediate };
}

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const p = await storage.get('profile');
      setProfile(p);
      setLoading(false);
    })();
  }, []);

  const saveProfile = useCallback(async (newProfile) => {
    setProfile(newProfile);
    await storage.set('profile', newProfile);
  }, []);

  return { profile, loading, saveProfile };
}

export function useHistoricalData(dateKeys) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const bundles = [];
      for (const key of dateKeys) {
        const bundle = await storage.get(`daily:${key}`);
        if (bundle) bundles.push(bundle);
      }
      if (mounted) {
        setData(bundles);
        setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [dateKeys.join(',')]);

  return { data, loading };
}
