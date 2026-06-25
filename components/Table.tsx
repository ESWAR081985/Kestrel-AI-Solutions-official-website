import { useState, useMemo } from 'react';
import { ChevronUpDownIcon } from './Icons';

type SortDirection = 'asc' | 'desc' | 'none';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  initialSortKey?: keyof T;
}

const Table = <T extends {}>({ data, columns, initialSortKey }: TableProps<T>) => {
  const [sortKey, setSortKey] = useState<keyof T | null>(() => {
    if (initialSortKey) return initialSortKey;
    const firstSortable = columns.find(col => typeof col.accessor !== 'function');
    return firstSortable ? (firstSortable.accessor as keyof T) : null;
  });
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sortedData = useMemo(() => {
    if (!sortKey || sortDirection === 'none') {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === bValue) return 0;
      
      const order = sortDirection === 'asc' ? 1 : -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * order;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * order;
      }
      
      // Fallback for other types
      if (aValue > bValue) return order;
      if (aValue < bValue) return -order;
      return 0;
    });
  }, [data, sortKey, sortDirection]);

  const handleSort = (accessor: keyof T | ((item: T) => React.ReactNode)) => {
    if (typeof accessor === 'function') return;
    
    if (accessor === sortKey) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(accessor);
      setSortDirection('asc');
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
      <table className="min-w-full text-sm divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                onClick={() => handleSort(col.accessor)}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none whitespace-nowrap ${typeof col.accessor !== 'function' ? 'cursor-pointer' : ''}`}
              >
                <div className="flex items-center">
                  {col.header}
                  {typeof col.accessor !== 'function' && <ChevronUpDownIcon className="w-4 h-4 ml-2 text-gray-400" />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns.map((col, colIdx) => (
                <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {typeof col.accessor === 'function' 
                    ? col.accessor(row) 
                    : String(row[col.accessor])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
