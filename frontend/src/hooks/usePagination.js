import { useState, useCallback, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { debounce } from '../utils/helpers';

export const usePagination = (fetchFn, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [params, setParams] = useState(initialParams);

  const fetch = useCallback(async (overrideParams = {}) => {
    setLoading(true);
    try {
      const res = await fetchFn({ ...params, ...overrideParams, search });
      setData(res.data);
      setPagination(res.pagination);
    } catch (err) {
      toast.error(err.message || 'Gagal mengambil data');
    } finally {
      setLoading(false);
    }
  }, [fetchFn, params, search]);

  const debouncedSearch = useCallback(
    debounce((val) => {
      setSearch(val);
      setParams(p => ({ ...p, page: 1 }));
    }, 300),
    []
  );

  const goToPage = (page) => setParams(p => ({ ...p, page }));
  const setLimit = (limit) => setParams(p => ({ ...p, limit, page: 1 }));
  const setFilter = (key, value) => setParams(p => ({ ...p, [key]: value, page: 1 }));

  return { data, pagination, loading, search, params, fetch, debouncedSearch, goToPage, setLimit, setFilter };
};

export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
};
