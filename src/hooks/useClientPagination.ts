import { useEffect, useMemo, useState } from 'react';

/**
 * Paginado en cliente: recibe la lista completa y devuelve la página actual,
 * el límite seleccionado y los items de la página.
 * Resetea a la página 1 cuando cambia la lista (filtros/orden/data nueva).
 */
export function useClientPagination<T>(items: T[], initialLimit = 10) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);

  useEffect(() => {
    setPage(1);
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(items.length / limit));
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(
    () => items.slice((currentPage - 1) * limit, currentPage * limit),
    [items, currentPage, limit],
  );

  const changeLimit = (l: number) => {
    setLimit(l);
    setPage(1);
  };

  const goPage = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  return { page: currentPage, limit, totalPages, pageItems, goPage, changeLimit };
}
