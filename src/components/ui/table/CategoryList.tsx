import React from 'react';
import { DataRow } from './DataRow';
import { TableRowData } from './types';

export const CategoryList: React.FC<{ data: TableRowData[]; collapsed: boolean; categoryId?: string }> = ({ data, collapsed, categoryId }) => {
  if (collapsed) return null;
  return (
    <>
      {data.map((row) => (
        <DataRow key={row.id} row={row} categoryId={categoryId} />
      ))}
    </>
  );
};
