import { useCallback, useEffect, useState } from 'react';
import { errMsg } from './api';

export function useFetch(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(async () => {
    setLoading(true); setError('');
    try { setData(await fn()); } catch (e) { setError(errMsg(e)); } finally { setLoading(false); }
  }, deps);
  useEffect(() => { run(); }, [run]);
  return { data, loading, error, reload: run, setData };
}
