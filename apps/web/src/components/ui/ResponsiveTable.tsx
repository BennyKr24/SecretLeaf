import type { ReactNode } from "react";

export type ResponsiveTableColumn<T> = {
  header: string;
  cell: (row: T) => ReactNode;
  /** Extra classes for the desktop `<td>` — defaults to the muted body
   * text color; pass e.g. "font-semibold text-foreground" for a title/id
   * column. */
  tdClassName?: string;
  /** Marks this column's cell as the mobile card's title (shown large,
   * above the label:value list, instead of as its own row). Exactly one
   * column should set this — defaults to the first column if none do. */
  isTitle?: boolean;
  /** For action buttons or anything that reads better as a full-width row
   * than a "Label: value" line — rendered below the label:value list on
   * mobile, without a label. */
  fullWidthOnMobile?: boolean;
};

type ResponsiveTableProps<T> = {
  columns: ResponsiveTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Matches the original table's `min-w-[…]` so the md+ table stays
   * pixel-identical to before this component existed. */
  minWidthClassName?: string;
  /** Matches the original table's cell padding (varies per page: some
   * use px-3 py-2, others px-4 py-3). */
  cellPadding?: string;
};

/**
 * Renders `rows` as the original `<table>` markup at `md` and up (visually
 * unchanged), and as a stacked card list below `md` — one card per row,
 * each non-title column shown as a "label: value" line, so none of the 7
 * data tables in the app force horizontal scrolling on a phone anymore.
 */
export function ResponsiveTable<T>({
  columns,
  rows,
  rowKey,
  minWidthClassName = "",
  cellPadding = "px-3 py-2",
}: ResponsiveTableProps<T>) {
  const titleCol = columns.find((c) => c.isTitle) ?? columns[0];
  const bodyCols = columns.filter((c) => c !== titleCol && !c.fullWidthOnMobile);
  const fullWidthCols = columns.filter((c) => c !== titleCol && c.fullWidthOnMobile);

  return (
    <>
      {/* Desktop / tablet — original table markup, unchanged */}
      <div className="hidden overflow-x-auto md:block">
        <table className={`w-full text-left text-sm ${minWidthClassName}`}>
          <thead className="bg-background text-foreground/80">
            <tr>
              {columns.map((col) => (
                <th key={col.header} className={`${cellPadding} font-semibold`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)} className="border-t border-border">
                {columns.map((col) => (
                  <td key={col.header} className={`${cellPadding} ${col.tdClassName ?? "text-foreground/80"}`}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile — one card per row */}
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <div key={rowKey(row)} className="rounded-xl border border-border bg-card p-4">
            {titleCol && (
              <div className={titleCol.tdClassName ?? "font-semibold text-foreground"}>
                {titleCol.cell(row)}
              </div>
            )}
            <dl className="mt-2 space-y-1.5">
              {bodyCols.map((col) => (
                <div key={col.header} className="flex items-baseline justify-between gap-3 text-sm">
                  <dt className="flex-shrink-0 text-muted-fg">{col.header}</dt>
                  <dd className={`text-right ${col.tdClassName ?? "text-foreground/80"}`}>{col.cell(row)}</dd>
                </div>
              ))}
            </dl>
            {fullWidthCols.map((col) => (
              <div key={col.header} className="mt-3 border-t border-border pt-3">
                {col.cell(row)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
