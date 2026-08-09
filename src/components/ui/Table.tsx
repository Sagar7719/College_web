import React from 'react';
import styles from './ui.module.css';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
  responsive?: boolean;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ children, responsive = true, className = '', ...props }, ref) => {
    const tableEl = (
      <table ref={ref} className={`${styles.table} ${className}`} {...props}>
        {children}
      </table>
    );

    if (responsive) {
      return <div className={styles.tableResponsive}>{tableEl}</div>;
    }

    return tableEl;
  }
);
Table.displayName = 'Table';

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className = '', ...props }) => (
  <thead className={`${styles.tableHeader} ${className}`} {...props}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className = '', ...props }) => (
  <tbody className={`${styles.tableBody} ${className}`} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, className = '', ...props }) => (
  <tr className={`${styles.tableRow} ${className}`} {...props}>
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, className = '', ...props }) => (
  <th className={`${styles.tableHead} ${className}`} {...props}>
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, className = '', ...props }) => (
  <td className={`${styles.tableCell} ${className}`} {...props}>
    {children}
  </td>
);
