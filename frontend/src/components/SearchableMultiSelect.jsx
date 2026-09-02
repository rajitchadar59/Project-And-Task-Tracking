import React, { useState } from 'react';
import './SearchableMultiSelect.css';

const SearchableMultiSelect = ({ items, selectedIds, onToggle, placeholder, emptyMessage }) => {
  const [search, setSearch] = useState('');
  
  const filteredItems = items.filter(item => {
    const text = item.name || item.title || '';
    return text.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="select-box">
      <input 
        type="text" 
        placeholder={placeholder} 
        value={search} 
        onChange={e => setSearch(e.target.value)}
        className="select-search-input"
      />
      <div className="select-checkbox-list">
        {filteredItems.length === 0 ? (
          <span className="select-empty">{emptyMessage}</span>
        ) : (
          filteredItems.map(item => (
            <label key={item._id} className="select-checkbox-label">
              <input 
                type="checkbox" 
                checked={selectedIds.includes(item._id)} 
                onChange={() => onToggle(item._id)} 
              /> 
              {item.name || item.title}
            </label>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchableMultiSelect;