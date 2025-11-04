import React from 'react';
import useCardStore from '../store/useCardStore';
import { fontOptions } from '../utils/constants';

const PropertyPanel = () => {
  const { selectedElementId, getSelectedElement, updateElement, canvas, setCanvasProperty } = useCardStore();
  const selectedElement = getSelectedElement();

  const fontFamilies = fontOptions.families;
  const fontWeights = fontOptions.weights.map(w => w.value);
  const alignments = ['left', 'center', 'right'];

  // Convert px to mm (96 DPI: 1 inch = 96px = 25.4mm)
  const pxToMm = (px) => ((px * 25.4) / 96).toFixed(2);

  if (!selectedElement) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 p-4 overflow-y-auto shadow-sm">
        <div className="text-center text-gray-400 mt-4 mb-4">
          <p className="text-xs">Select an element to edit properties</p>
        </div>
        
        {/* Canvas Settings */}
        <div className="mt-4">
          <h3 className="font-semibold mb-3 text-gray-800 text-sm">Canvas Settings</h3>
          
          <div className="space-y-3">
            {/* Real-time Size Display */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-blue-800 mb-1">Current Size:</p>
              <p className="text-sm font-bold text-blue-900">
                {canvas.width}px × {canvas.height}px
              </p>
              <p className="text-xs text-blue-700">
                ({pxToMm(canvas.width)} mm × {pxToMm(canvas.height)} mm)
              </p>
            </div>

            {/* Zoom Control */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-gray-700">Zoom: {canvas.zoom}%</label>
                <span className="text-xs text-gray-500">Ctrl + Scroll</span>
              </div>
              <input
                type="range"
                min="50"
                max="200"
                step="5"
                value={canvas.zoom}
                onChange={(e) => setCanvasProperty('zoom', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>50%</span>
                <span>200%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">Width (px)</label>
              <input
                type="number"
                value={canvas.width}
                onChange={(e) => setCanvasProperty('width', parseInt(e.target.value) || 323)}
                min="100"
                max="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
              <p className="text-xs text-gray-500 mt-0.5">≈ {pxToMm(canvas.width)} mm</p>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">Height (px)</label>
              <input
                type="number"
                value={canvas.height}
                onChange={(e) => setCanvasProperty('height', parseInt(e.target.value) || 204)}
                min="100"
                max="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
              <p className="text-xs text-gray-500 mt-0.5">≈ {pxToMm(canvas.height)} mm</p>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">Background Color</label>
              <input
                type="color"
                value={canvas.backgroundColor}
                onChange={(e) => setCanvasProperty('backgroundColor', e.target.value)}
                className="w-full h-10 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-blue-400 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={canvas.showGrid}
                onChange={(e) => setCanvasProperty('showGrid', e.target.checked)}
                id="showGrid"
                className="cursor-pointer w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="showGrid" className="text-xs cursor-pointer font-medium text-gray-700">Show Grid</label>
            </div>

            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={canvas.snapToGrid}
                onChange={(e) => setCanvasProperty('snapToGrid', e.target.checked)}
                id="snapToGrid"
                className="cursor-pointer w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="snapToGrid" className="text-xs cursor-pointer font-medium text-gray-700">Snap to Grid</label>
            </div>

            {canvas.snapToGrid && (
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-700">Grid Size</label>
                <input
                  type="number"
                  value={canvas.gridSize}
                  onChange={(e) => setCanvasProperty('gridSize', parseInt(e.target.value))}
                  min="5"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-white border-l border-gray-200 p-4 overflow-y-auto shadow-sm">
      <h3 className="font-semibold mb-3 text-gray-800 text-sm">Properties</h3>

      <div className="space-y-3">
        {/* Common Properties */}
        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-700">Position X</label>
          <input
            type="number"
            value={Math.round(selectedElement.x)}
            onChange={(e) => updateElement(selectedElementId, { x: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-700">Position Y</label>
          <input
            type="number"
            value={Math.round(selectedElement.y)}
            onChange={(e) => updateElement(selectedElementId, { y: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
        </div>

        {/* Text Properties */}
        {selectedElement.type === 'text' && (
          <>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">Label</label>
              <input
                type="text"
                value={selectedElement.label}
                onChange={(e) => updateElement(selectedElementId, { label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">Value</label>
              <input
                type="text"
                value={selectedElement.value}
                onChange={(e) => updateElement(selectedElementId, { value: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">Font Family</label>
              <select
                value={selectedElement.fontFamily}
                onChange={(e) => updateElement(selectedElementId, { fontFamily: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              >
                {fontFamilies.map((font) => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">Font Size</label>
              <input
                type="number"
                value={selectedElement.fontSize}
                onChange={(e) => updateElement(selectedElementId, { fontSize: parseInt(e.target.value) })}
                min="8"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">Font Weight</label>
              <select
                value={selectedElement.fontWeight}
                onChange={(e) => updateElement(selectedElementId, { fontWeight: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              >
                {fontWeights.map((weight) => (
                  <option key={weight} value={weight}>{weight}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">Text Color</label>
              <input
                type="color"
                value={selectedElement.color}
                onChange={(e) => updateElement(selectedElementId, { color: e.target.value })}
                className="w-full h-10 rounded border border-gray-300 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">Alignment</label>
              <div className="flex gap-2">
                {alignments.map((align) => (
                  <button
                    key={align}
                    onClick={() => updateElement(selectedElementId, { align })}
                    className={`flex-1 px-3 py-2 rounded border ${
                      selectedElement.align === align
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Image Properties */}
        {selectedElement.type === 'image' && (
          <>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">Image URL</label>
              <input
                type="text"
                value={selectedElement.src || ''}
                onChange={(e) => updateElement(selectedElementId, { src: e.target.value })}
                placeholder="Enter image URL or upload"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      updateElement(selectedElementId, { src: event.target.result });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">Width</label>
              <input
                type="number"
                value={selectedElement.width}
                onChange={(e) => updateElement(selectedElementId, { width: parseInt(e.target.value) })}
                min="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">Height</label>
              <input
                type="number"
                value={selectedElement.height}
                onChange={(e) => updateElement(selectedElementId, { height: parseInt(e.target.value) })}
                min="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">Border Radius</label>
              <input
                type="number"
                value={selectedElement.borderRadius}
                onChange={(e) => updateElement(selectedElementId, { borderRadius: parseInt(e.target.value) })}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>
          </>
        )}

        {/* QR Code Properties */}
        {selectedElement.type === 'qr' && (
          <>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">QR Data</label>
              <textarea
                value={selectedElement.data}
                onChange={(e) => updateElement(selectedElementId, { data: e.target.value })}
                placeholder="Enter URL or text"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">Size</label>
              <input
                type="number"
                value={selectedElement.size}
                onChange={(e) => updateElement(selectedElementId, { size: parseInt(e.target.value) })}
                min="50"
                max="300"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-700">Z-Index (Layer Order)</label>
          <input
            type="number"
            value={selectedElement.zIndex}
            onChange={(e) => updateElement(selectedElementId, { zIndex: parseInt(e.target.value) })}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default PropertyPanel;
