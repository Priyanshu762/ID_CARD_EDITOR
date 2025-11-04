import React from 'react';
import useCardStore from '../store/useCardStore';

const TemplateSelector = () => {
  const { templates, setTemplate, setCanvasProperty } = useCardStore();

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCanvasProperty('backgroundImage', event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-4 py-2.5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-sm">Templates</h3>
        
        <div className="flex items-center gap-2">
          <label className="px-3 py-1.5 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 active:bg-purple-800 font-medium shadow-sm transition-all text-xs">
            Upload Background
            <input
              type="file"
              accept="image/*"
              onChange={handleBackgroundUpload}
              className="hidden"
            />
          </label>
          
          <button
            onClick={() => setCanvasProperty('backgroundImage', null)}
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 rounded-lg font-medium shadow-sm transition-all text-xs"
          >
            Remove Background
          </button>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-4 gap-2">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => setTemplate(template)}
            className="cursor-pointer border-2 border-gray-300 rounded-xl overflow-hidden hover:border-blue-500 hover:shadow-md active:scale-95 transition-all"
          >
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-3">
              <span className="text-xs text-gray-600 font-medium text-center">{template.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
