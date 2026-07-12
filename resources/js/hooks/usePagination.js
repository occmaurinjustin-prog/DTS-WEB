import { useState, useMemo } from 'react';

export default function usePagination(data, itemsPerPage = 10) {
    const [currentPage, setCurrentPage] = useState(1);

    const paginatedData = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        const start = (currentPage - 1) * itemsPerPage;
        return data.slice(start, start + itemsPerPage);
    }, [data, currentPage, itemsPerPage]);

    const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);

    // Reset to page 1 if data length changes drastically (like a search filter)
    useMemo(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    return {
        currentPage,
        setCurrentPage,
        paginatedData,
        totalPages,
        totalItems: data?.length || 0,
        itemsPerPage
    };
}
