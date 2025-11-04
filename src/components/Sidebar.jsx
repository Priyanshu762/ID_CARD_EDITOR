import React, { useState } from 'react';
import { Plus, Type, Image, QrCode, Layout, Trash2, Copy } from 'lucide-react';
import useCardStore from '../store/useCardStore';

const Sidebar = () => {
  const { addElement, elements, selectElement, selectedElementId, deleteElement, duplicateElement } = useCardStore();
  const [customLabel, setCustomLabel] = useState('');
  const [customValue, setCustomValue] = useState('');

  const addTextField = () => {
    addElement({
      type: 'text',
      label: customLabel || 'New Field',
      value: customValue || 'Enter text',
      x: 50,
      y: 50,
      fontSize: 16,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      color: '#000000',
      align: 'left',
      zIndex: 1,
    });
    setCustomLabel('');
    setCustomValue('');
  };

  const addImage = () => {
    addElement({
      type: 'image',
      src: null,
      x: 20,
      y: 20,
      width: 100,
      height: 100,
      borderRadius: 0,
      zIndex: 2,
    });
  };

  const addQRCode = () => {
    addElement({
      type: 'qr',
      data: 'https://example.com',
      x: 300,
      y: 150,
      size: 80,
      zIndex: 3,
    });
  };

  const predefinedFields = [
    { label: 'Name', value: 'John Doe' },
    { label: 'Employee ID', value: 'EMP-12345' },
    { label: 'Department', value: 'Engineering' },
    { label: 'Position', value: 'Software Engineer' },
    { label: 'Email', value: 'john.doe@company.com' },
    { label: 'Phone', value: '+1 234 567 8900' },
  ];

  const addPredefinedField = (field) => {
    addElement({
      type: 'text',
      label: field.label,
      value: field.value,
      x: 50,
      y: 50 + elements.filter(el => el.type === 'text').length * 30,
      fontSize: 16,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      color: '#000000',
      align: 'left',
      zIndex: 1,
    });
  };

  return (
    <div className="w-72 bg-white border-r border-gray-200 overflow-y-auto shadow-sm">
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4 text-gray-800">Elements</h2>
        
        {/* Add Custom Field */}
        <div className="mb-4 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-100">
          <h3 className="font-semibold mb-2 flex items-center gap-2 text-gray-800 text-sm">
            <Plus size={16} className="text-blue-600" />
            Add Custom Field
          </h3>
          <input
            type="text"
            placeholder="Field Label"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <input
            type="text"
            placeholder="Field Value"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button
            onClick={addTextField}
            className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 active:bg-blue-800 flex items-center justify-center gap-2 font-medium shadow-sm transition-all text-sm"
          >
            <Type size={14} />
            Add Text Field
          </button>
        </div>

        {/* Predefined Fields */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2 text-gray-800 text-sm">Predefined Fields</h3>
          <div className="grid grid-cols-2 gap-2">
            {predefinedFields.map((field, index) => (
              <button
                key={index}
                onClick={() => addPredefinedField(field)}
                className="px-2 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-400 active:bg-blue-50 text-xs font-medium transition-all shadow-sm"
              >
                {field.label}
              </button>
            ))}
          </div>
        </div>

        {/* Other Elements */}
        <div className="mb-4 space-y-2">
          <button
            onClick={addImage}
            className="w-full bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 active:bg-green-800 flex items-center justify-center gap-2 font-medium shadow-sm transition-all text-sm"
          >
            <Image size={16} />
            Add Image
          </button>
          <button
            onClick={addQRCode}
            className="w-full bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 active:bg-purple-800 flex items-center justify-center gap-2 font-medium shadow-sm transition-all text-sm"
          >
            <QrCode size={16} />
            Add QR Code
          </button>
        </div>

        {/* Elements List */}
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2 text-gray-800 text-sm">
            <Layout size={16} className="text-gray-600" />
            Layers
          </h3>
          <div className="space-y-1.5">
            {elements.map((element) => (
              <div
                key={element.id}
                onClick={() => selectElement(element.id)}
                className={`p-2 rounded-lg cursor-pointer flex items-center justify-between transition-all ${
                  selectedElementId === element.id
                    ? 'bg-blue-100 border-2 border-blue-400 shadow-sm'
                    : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 flex-1">
                  {element.type === 'text' && <Type size={14} className="text-blue-600" />}
                  {element.type === 'image' && <Image size={14} className="text-green-600" />}
                  {element.type === 'qr' && <QrCode size={14} className="text-purple-600" />}
                  <span className="text-xs font-medium truncate">
                    {element.type === 'text' ? element.label : element.type.toUpperCase()}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateElement(element.id);
                    }}
                    className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                    title="Duplicate"
                  >
                    <Copy size={12} className="text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(element.id);
                    }}
                    className="p-1 hover:bg-red-100 text-red-600 rounded-md transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
