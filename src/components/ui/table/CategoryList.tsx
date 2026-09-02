import React from 'react';
import { DataRow } from './DataRow';
import { TableRowData } from './types';
import { StaggerList } from '../AnimationKit';

export const CategoryList: React.FC<{ data: TableRowData[]; collapsed: boolean; categoryId?: string }> = ({ data, collapsed, categoryId }) => {
  if (collapsed) return null;
  return (
    <StaggerList className="flex flex-col gap-px">
      {data.map((row) => (
        <DataRow key={row.id} row={row} categoryId={categoryId} />
      ))}
    </StaggerList>
  );
};
