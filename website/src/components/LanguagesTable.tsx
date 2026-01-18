import React, { useState, useMemo } from 'react';
import { programmingLangDefinitions } from '@cspell/filetypes';
import './languages-table.scss';

export const LanguagesTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLanguages = useMemo(() => {
    if (!searchTerm) return programmingLangDefinitions;

    const term = searchTerm.toLowerCase();
    return programmingLangDefinitions.filter((lang) => {
      const extensions = [...lang.extensions, ...(lang.filenames || [])].join(' ').toLowerCase();
      return (
        lang.id.toLowerCase().includes(term) ||
        (lang.description && lang.description.toLowerCase().includes(term)) ||
        extensions.includes(term)
      );
    });
  }, [searchTerm]);

  return (
    <div className="languages-table-container">
      <div className="search-box">
        <input
          type="text"
          placeholder="Search languages or extensions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-wrapper">
        <div className="table-header">
          <div className="table-cell">Language ID</div>
          <div className="table-cell">Description</div>
          <div className="table-cell">File Extensions & Filenames</div>
        </div>

        <div className="table-body">
          {filteredLanguages.map((lang, index) => (
            <div key={lang.id} className={`table-row ${index % 2 === 0 ? 'striped' : ''}`}>
              <div className="table-cell">
                <code>{lang.id}</code>
              </div>
              <div className="table-cell">{lang.description || '-'}</div>
              <div className="table-cell">
                <code className="extensions">
                  {[...lang.extensions, ...(lang.filenames || [])].join(', ') || 'No specific extensions'}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredLanguages.length === 0 && <p className="no-results">No languages found matching "{searchTerm}"</p>}

      <p className="total-count">
        Total: {filteredLanguages.length} language{filteredLanguages.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
};
