'use client';

interface ApplicationFiltersProps {
  filters: {
    status: string;
    source: string;
    search: string;
  };
  onChange: (filters: any) => void;
}

export function ApplicationFilters({ filters, onChange }: ApplicationFiltersProps) {
  const handleChange = (key: string, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-1 flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <input
          type="text"
          placeholder="Search company or job title..."
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          className="w-full rounded-md border border-gray-300 px-4 py-2 pl-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <svg
          className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Status Filter */}
      <select
        value={filters.status}
        onChange={(e) => handleChange('status', e.target.value)}
        className="rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="">All Statuses</option>
        <option value="saved">Saved</option>
        <option value="applied">Applied</option>
        <option value="assessment">Assessment</option>
        <option value="interview">Interview</option>
        <option value="offer">Offer</option>
        <option value="accepted">Accepted</option>
        <option value="rejected">Rejected</option>
      </select>

      {/* Source Filter */}
      <select
        value={filters.source}
        onChange={(e) => handleChange('source', e.target.value)}
        className="rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="">All Sources</option>
        <option value="linkedin">LinkedIn</option>
        <option value="indeed">Indeed</option>
        <option value="company_site">Company Site</option>
        <option value="referral">Referral</option>
        <option value="other">Other</option>
      </select>

      {/* Clear Filters */}
      {(filters.status || filters.source || filters.search) && (
        <button
          onClick={() => onChange({ status: '', source: '', search: '' })}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
