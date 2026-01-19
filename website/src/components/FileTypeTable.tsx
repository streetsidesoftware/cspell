import React, { useState, useMemo } from 'react';
import { fileTypeDefinitions, isBinaryFileType } from '@cspell/filetypes';

import './file-type-table.scss';

export const FileTypeTable = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showBinary, setShowBinary] = useState(false);

    const filteredFileTypes = useMemo(() => {
        let filtered = fileTypeDefinitions;

        if (!showBinary) {
            filtered = filtered.filter((f) => !isBinaryFileType(f.id));
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter((f) => {
                const extensions = [...f.extensions, ...(f.filenames || [])].join(' ').toLowerCase();
                return (
                    f.id.toLowerCase().includes(term) ||
                    (f.description && f.description.toLowerCase().includes(term)) ||
                    extensions.includes(term)
                );
            });
        }

        return filtered;
    }, [searchTerm, showBinary]);

    const binaryCount = fileTypeDefinitions.filter((f) => isBinaryFileType(f.id)).length;
    const textCount = fileTypeDefinitions.length - binaryCount;

    return (
        <div className="languages-table-container">
            <div className="search-box">
                <input
                    type="text"
                    placeholder="Search file types or extensions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="filter-controls">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={showBinary}
                        onChange={(e) => setShowBinary(e.target.checked)}
                    />
                    <span>Show binary file types ({binaryCount})</span>
                </label>
                <span className="info-text">
                    Showing {filteredFileTypes.length} of {showBinary ? fileTypeDefinitions.length : textCount} file
                    types
                </span>
            </div>

            <div className="table-wrapper">
                <div className="table-header">
                    <div className="table-cell">File Type ID</div>
                    <div className="table-cell">Description</div>
                    <div className="table-cell">Filenames</div>
                    <div className="table-cell">Extensions</div>
                </div>

                <div className="table-body">
                    {filteredFileTypes.map((m, index) => (
                        <div key={m.id} className={`table-row ${index % 2 === 0 ? 'striped' : ''}`}>
                            <div className="table-cell">
                                <code>{m.id}</code>
                                {m.format === 'Binary' && <span className="badge binary-badge">Binary</span>}
                            </div>
                            <div className="table-cell">{m.description || '-'}</div>
                            <div className="table-cell">
                                {m.filenames && <code className="extensions">{m.filenames.join(', ')}</code>}
                                {!m.filenames && <>-</>}
                            </div>
                            <div className="table-cell">
                                {m.extensions && <code className="extensions">{m.extensions.join(', ')}</code>}
                                {!m.extensions && <>-</>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {filteredFileTypes.length === 0 && (
                <p className="no-results">No file types found matching "{searchTerm}"</p>
            )}

            <p className="total-count">
                Total: {filteredFileTypes.length} file type{filteredFileTypes.length !== 1 ? 's' : ''}
            </p>
        </div>
    );
};
