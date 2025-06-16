import { useEffect } from 'react';
import { useListKnowledgeBasesQuery } from '../../features/api/ragApi';

/**
 * KBDropdown - Reusable dropdown for selecting a Knowledge Base (RTK Query version)
 *
 * @param {Object} props
 * @param {string} value - currently selected KB id
 * @param {function} onChange - called with new KB object when selection changes
 * @param {string} className - additional classes for styling
 * @param {boolean} disabled - disable the dropdown
 * @param {boolean} autoSelectFirst - if true, auto-select first KB and call onChange
 */
export default function KBDropdown({ value, onChange, className = '', disabled = false, autoSelectFirst = true }) {
  const { 
    data: kbList = [], 
    isLoading,
    isError,
    error,
    isFetching 
  } = useListKnowledgeBasesQuery();

  useEffect(() => {
    if (autoSelectFirst && kbList && kbList.length > 0 && !value) {
      onChange && onChange(kbList[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kbList, autoSelectFirst, value, onChange]);

  if (isLoading || isFetching) return <span className={`text-gray-500 dark:text-gray-400 ${className}`}>Loading KBs...</span>;
  if (isError) return <span className={`text-red-500 ${className}`}>Error loading KBs: {error?.data?.message || error?.error || 'Unknown error'}</span>;
  if (!kbList || kbList.length === 0) return <span className={`text-gray-500 dark:text-gray-400 ${className}`}>No Knowledge Bases found.</span>;

  return (
    <select
      value={value || ''}
      onChange={e => {
        const kb = kbList.find(kb => kb.id === e.target.value);
        onChange && onChange(kb);
      }}
      className={`border rounded px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 ${className}`}
      aria-label="Select Knowledge Base"
      disabled={disabled || isLoading || isFetching}
    >
      {kbList.map(kb => (
        <option key={kb.id} value={kb.id}>{kb.name}</option>
      ))}
    </select>
  );
}
