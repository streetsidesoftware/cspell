import React from 'react';
import { HomePageTableProps } from './table-data';

import './home.scss';

export function HomePageTable(props: HomePageTableProps): React.ReactElement {
  return (
    <div className={`home-table-wrapper ${props.className || ''}`}>
      <div className="home-table">
        <div className="home-table-header">
          {props.headerColumns.map((col, index) => (
            <div key={index} className="home-table-header-cell">
              {col.header}
            </div>
          ))}
        </div>
        <div className="home-table-body">
          {props.rows.map((row, rowIndex) => (
            <div key={rowIndex} className="home-table-row">
              {row.cells.map((cell, cellIndex) => (
                <div
                  key={cellIndex}
                  className="home-table-cell"
                  data-label={props.headerColumns[cellIndex]?.header || ''}
                >
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
