import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const ViolationsTable = ({ violations, getSeverityColor, getViolationIcon }) => {
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedViolations = [...violations].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'date') {
      aValue = new Date(aValue.split('/').reverse().join('-'));
      bValue = new Date(bValue.split('/').reverse().join('-'));
    }
    
    if (sortField === 'cost') {
      aValue = Number(aValue);
      bValue = Number(bValue);
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedViolations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedViolations = sortedViolations.slice(startIndex, startIndex + itemsPerPage);

  const SortButton = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-left hover:text-secondary transition-colors duration-150"
    >
      <span>{children}</span>
      <Icon 
        name={sortField === field ? (sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
        size={14}
        className={sortField === field ? 'text-secondary' : 'text-text-tertiary'}
      />
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium text-text-secondary">
                <SortButton field="date">Date & Heure</SortButton>
              </th>
              <th className="text-left py-3 px-4 font-medium text-text-secondary">
                <SortButton field="type">Type de Violation</SortButton>
              </th>
              <th className="text-left py-3 px-4 font-medium text-text-secondary">
                <SortButton field="severity">Gravité</SortButton>
              </th>
              <th className="text-left py-3 px-4 font-medium text-text-secondary">
                Localisation
              </th>
              <th className="text-left py-3 px-4 font-medium text-text-secondary">
                Détails
              </th>
              <th className="text-left py-3 px-4 font-medium text-text-secondary">
                <SortButton field="cost">Coût (XOF)</SortButton>
              </th>
              <th className="text-left py-3 px-4 font-medium text-text-secondary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedViolations.map((violation) => (
              <tr key={violation.id} className="border-b border-border-light hover:bg-surface-secondary transition-colors duration-150">
                <td className="py-4 px-4">
                  <div>
                    <p className="font-medium text-text-primary">{violation.date}</p>
                    <p className="text-sm text-text-secondary font-data">{violation.time}</p>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <Icon name={getViolationIcon(violation.type)} size={16} className="text-text-secondary" />
                    <span className="text-text-primary">{violation.type}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`status-indicator ${getSeverityColor(violation.severity)}`}>
                    {violation.severity}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <p className="text-text-primary text-sm">{violation.location}</p>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-text-secondary">
                    {violation.speed && (
                      <p>Vitesse: <span className="font-data text-error">{violation.speed}</span> (limite: {violation.speedLimit})</p>
                    )}
                    {violation.gForce && (
                      <p>Force G: <span className="font-data">{violation.gForce}</span></p>
                    )}
                    {violation.eyeClosure && (
                      <p>Fermeture yeux: <span className="font-data">{violation.eyeClosure}</span></p>
                    )}
                    {violation.lateralG && (
                      <p>G latéral: <span className="font-data">{violation.lateralG}</span></p>
                    )}
                    <p>Durée: <span className="font-data">{violation.duration}</span></p>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="font-medium text-error font-data">
                    {violation.cost.toLocaleString('fr-FR')}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    {violation.hasVideo && (
                      <button className="p-1 text-secondary hover:text-secondary-700 transition-colors duration-150">
                        <Icon name="Play" size={16} />
                      </button>
                    )}
                    <button className="p-1 text-text-secondary hover:text-text-primary transition-colors duration-150">
                      <Icon name="MapPin" size={16} />
                    </button>
                    <button className="p-1 text-text-secondary hover:text-text-primary transition-colors duration-150">
                      <Icon name="MoreHorizontal" size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {paginatedViolations.map((violation) => (
          <div key={violation.id} className="card p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Icon name={getViolationIcon(violation.type)} size={16} className="text-text-secondary" />
                <span className="font-medium text-text-primary">{violation.type}</span>
              </div>
              <span className={`status-indicator ${getSeverityColor(violation.severity)}`}>
                {violation.severity}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Date:</span>
                <span className="text-text-primary font-data">{violation.date} {violation.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Lieu:</span>
                <span className="text-text-primary text-right">{violation.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Coût:</span>
                <span className="text-error font-medium font-data">{violation.cost.toLocaleString('fr-FR')} XOF</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-light">
              <div className="text-xs text-text-secondary">
                Durée: {violation.duration}
              </div>
              <div className="flex items-center space-x-2">
                {violation.hasVideo && (
                  <button className="p-2 text-secondary hover:text-secondary-700 transition-colors duration-150">
                    <Icon name="Play" size={16} />
                  </button>
                )}
                <button className="p-2 text-text-secondary hover:text-text-primary transition-colors duration-150">
                  <Icon name="MapPin" size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-text-secondary">
            Affichage {startIndex + 1}-{Math.min(startIndex + itemsPerPage, violations.length)} sur {violations.length} violations
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              <Icon name="ChevronLeft" size={16} />
            </button>
            <span className="text-sm text-text-primary font-medium">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              <Icon name="ChevronRight" size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViolationsTable;