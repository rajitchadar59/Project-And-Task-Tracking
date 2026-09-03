import React, { useState, useRef, useEffect } from 'react';
import './SearchableDropdown.css';

const SearchableDropdown = ({ options, value, onChange, placeholder, searchPlaceholder = "Search..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  const selectedOption = options.find(opt => opt._id === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (id) => {
    onChange(id);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="custom-dropdown-wrapper" ref={dropdownRef}>
      <div className="custom-dropdown-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span>{selectedOption ? selectedOption.name : placeholder}</span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </div>

      {isOpen && (
        <div className="custom-dropdown-menu">
          <div className="dropdown-search-box">
            <input 
              type="text" 
              placeholder={searchPlaceholder} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="dropdown-options-list">
            <div 
              className={`dropdown-option ${value === '' ? 'selected' : ''}`}
              onClick={() => handleSelect('')}
            >
              Clear Filter
            </div>
            {filteredOptions.map(opt => (
              <div 
                key={opt._id} 
                className={`dropdown-option ${value === opt._id ? 'selected' : ''}`}
                onClick={() => handleSelect(opt._id)}
              >
                {opt.name}
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <div className="dropdown-empty">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;