"use client";

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  rowKey?: (row: T) => string;
  className?: string;
}

function Table<T>({
  columns,
  data,
  onRowClick,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  rowKey,
  className = "",
}: TableProps<T>) {
  const getRowId = (row: T, idx: number) =>
    rowKey ? rowKey(row) : String(idx);

  const allSelected =
    data.length > 0 && data.every((row, i) => selectedIds.includes(getRowId(row, i)));

  const toggleAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map((row, i) => getRowId(row, i)));
    }
  };

  const toggleRow = (id: string) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((s) => s !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {selectable && (
              <th className="w-10 px-3 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-border accent-accent"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-3 py-3 text-left font-medium text-muted whitespace-nowrap"
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => {
            const id = getRowId(row, idx);
            const isSelected = selectedIds.includes(id);
            return (
              <tr
                key={id}
                onClick={() => onRowClick?.(row)}
                className={`
                  border-b border-border transition-colors
                  ${onRowClick ? "cursor-pointer" : ""}
                  ${isSelected ? "bg-accent/5" : "hover:bg-surface-2/50"}
                `}
              >
                {selectable && (
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(id)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 rounded border-border accent-accent"
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-3 py-3 text-text-primary"
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export { Table };
export type { TableProps, Column };
