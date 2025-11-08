import React, { useCallback, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import useCardStore from '../store/useCardStore';
import { fontOptions } from '../utils/constants';

const PropertyPanel = () => {
  const { selectedElementId, getSelectedElement, updateElement, canvas, setCanvasProperty } = useCardStore();
  const selectedElement = getSelectedElement();
  const imageInputRef = useRef(null);

  const fontFamilies = useMemo(() => fontOptions.families, []);
  const fontWeights = useMemo(() => fontOptions.weights.map(w => w.value), []);
  const alignments = useMemo(() => ['left', 'center', 'right'], []);

  // Convert px to mm (96 DPI: 1 inch = 96px = 25.4mm)
  const pxToMm = useCallback((px) => ((px * 25.4) / 96).toFixed(2), []);

  const handleInputChange = useCallback((field, value) => {
    updateElement(selectedElementId, { [field]: value });
  }, [selectedElementId, updateElement]);

  const handleNumberInputChange = useCallback((field, value, min = null) => {
    const numValue = parseInt(value) || (min ?? 0);
    updateElement(selectedElementId, { [field]: numValue });
  }, [selectedElementId, updateElement]);

  const handleCanvasPropertyChange = useCallback((property, value) => {
    setCanvasProperty(property, value);
  }, [setCanvasProperty]);

  const handleImageUpload = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      updateElement(selectedElementId, { src: e.target.result });
      toast.success('Image uploaded successfully!');
    };

    reader.onerror = () => {
      console.error('Failed to read image file');
      toast.error('Failed to load image');
    };

    reader.readAsDataURL(file);
    
    // Reset input value
    event.target.value = '';
  }, [selectedElementId, updateElement]);

  const handleAlignmentClick = useCallback((align) => {
    updateElement(selectedElementId, { align });
  }, [selectedElementId, updateElement]);

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
              <label className="block text-xs font-medium mb-1.5 text-gray-700">Zoom: {canvas.zoom}%</label>
              <input
                type="range"
                min="50"
                max="200"
                step="5"
                value={canvas.zoom}
                onChange={(e) => handleCanvasPropertyChange('zoom', parseInt(e.target.value))}
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
                onChange={(e) => handleCanvasPropertyChange('width', parseInt(e.target.value) || 323)}
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
                onChange={(e) => handleCanvasPropertyChange('height', parseInt(e.target.value) || 204)}
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
                onChange={(e) => handleCanvasPropertyChange('backgroundColor', e.target.value)}
                className="w-full h-10 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-blue-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">
                Background Opacity: {Math.round((canvas.backgroundOpacity || 1) * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={Math.round((canvas.backgroundOpacity || 1) * 100)}
                onChange={(e) => handleCanvasPropertyChange('backgroundOpacity', parseInt(e.target.value) / 100)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={canvas.showGrid}
                onChange={(e) => handleCanvasPropertyChange('showGrid', e.target.checked)}
                id="showGrid"
                className="cursor-pointer w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="showGrid" className="text-xs cursor-pointer font-medium text-gray-700">Show Grid</label>
            </div>

            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={canvas.snapToGrid}
                onChange={(e) => handleCanvasPropertyChange('snapToGrid', e.target.checked)}
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
                  onChange={(e) => handleCanvasPropertyChange('gridSize', parseInt(e.target.value))}
                  min="5"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Canvas Border Settings */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="font-semibold mb-3 text-gray-800 text-sm">Card Border Settings</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">Border Style</label>
              <select
                value={canvas.borderStyle || 'none'}
                onChange={(e) => handleCanvasPropertyChange('borderStyle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              >
                <option value="none">None</option>
                <option value="one">One Side</option>
                <option value="two">Two Sides</option>
                <option value="all">All Sides / Full</option>
              </select>
            </div>

            {/* Conditional: One Side */}
            {canvas.borderStyle === 'one' && (
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-700">Select Side</label>
                <select
                  value={canvas.borderSides || 'left'}
                  onChange={(e) => handleCanvasPropertyChange('borderSides', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>
            )}

            {/* Conditional: Two Sides */}
            {canvas.borderStyle === 'two' && (
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-700">Select Sides</label>
                <select
                  value={canvas.borderSides || 'vertical'}
                  onChange={(e) => handleCanvasPropertyChange('borderSides', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                >
                  <option value="vertical">Vertical (Left & Right)</option>
                  <option value="horizontal">Horizontal (Top & Bottom)</option>
                </select>
              </div>
            )}

            {/* Show border width and color only if border style is not 'none' */}
            {canvas.borderStyle && canvas.borderStyle !== 'none' && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-700">Border Width (px)</label>
                  <input
                    type="number"
                    value={canvas.borderWidth || 1}
                    onChange={(e) => handleCanvasPropertyChange('borderWidth', parseInt(e.target.value) || 1)}
                    min="1"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-700">Border Color</label>
                  <input
                    type="color"
                    value={canvas.borderColor || '#000000'}
                    onChange={(e) => handleCanvasPropertyChange('borderColor', e.target.value)}
                    className="w-full h-10 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-blue-400 transition-colors"
                  />
                </div>
              </>
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
            onChange={(e) => handleNumberInputChange('x', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-700">Position Y</label>
          <input
            type="number"
            value={Math.round(selectedElement.y)}
            onChange={(e) => handleNumberInputChange('y', e.target.value)}
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
                onChange={(e) => handleInputChange('label', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">Value</label>
              <input
                type="text"
                value={selectedElement.value}
                onChange={(e) => handleInputChange('value', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">Font Family</label>
              <select
                value={selectedElement.fontFamily}
                onChange={(e) => handleInputChange('fontFamily', e.target.value)}
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
                onChange={(e) => handleNumberInputChange('fontSize', e.target.value, 8)}
                min="8"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">Font Weight</label>
              <select
                value={selectedElement.fontWeight}
                onChange={(e) => handleInputChange('fontWeight', e.target.value)}
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
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="w-full h-10 rounded border border-gray-300 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">Alignment</label>
              <div className="flex gap-2">
                {alignments.map((align) => (
                  <button
                    key={align}
                    onClick={() => handleAlignmentClick(align)}
                    className={`flex-1 px-3 py-2 rounded border transition-colors ${
                      selectedElement.align === align
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                    aria-label={`Align ${align}`}
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
                onChange={(e) => {
                  const value = e.target.value;
                  handleInputChange('src', value);
                  // Validate URL format
                  if (value && !value.startsWith('data:') && !value.startsWith('http')) {
                    toast.error('Image URL should start with http:// or https://');
                  }
                }}
                placeholder="Enter image URL or upload"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Or upload an image below</p>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">Upload Image</label>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">Width</label>
              <input
                type="number"
                value={selectedElement.width}
                onChange={(e) => handleNumberInputChange('width', e.target.value, 10)}
                min="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">Height</label>
              <input
                type="number"
                value={selectedElement.height}
                onChange={(e) => handleNumberInputChange('height', e.target.value, 10)}
                min="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">Border Radius</label>
              <input
                type="number"
                value={selectedElement.borderRadius}
                onChange={(e) => handleNumberInputChange('borderRadius', e.target.value)}
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
                onChange={(e) => {
                  const value = e.target.value;
                  handleInputChange('data', value);
                  if (!value.trim()) {
                    toast.error('QR code data cannot be empty');
                  }
                }}
                placeholder="Enter URL or text for QR code"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Can be a URL, text, or any data</p>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">Size (px)</label>
              <input
                type="number"
                value={selectedElement.size}
                onChange={(e) => handleNumberInputChange('size', e.target.value, 50)}
                min="50"
                max="300"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Range: 50-300px</p>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-700">Z-Index (Layer Order)</label>
          <input
            type="number"
            value={selectedElement.zIndex}
            onChange={(e) => handleNumberInputChange('zIndex', e.target.value)}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
        </div>

        {/* Border Settings - Available for all element types */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-semibold mb-3 text-gray-800 text-sm">Border Settings</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-700">Border Style</label>
              <select
                value={selectedElement.borderStyle || 'none'}
                onChange={(e) => handleInputChange('borderStyle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              >
                <option value="none">None</option>
                <option value="one">One Side</option>
                <option value="two">Two Sides</option>
                <option value="all">All Sides / Full</option>
              </select>
            </div>

            {/* Conditional: One Side */}
            {selectedElement.borderStyle === 'one' && (
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-700">Select Side</label>
                <select
                  value={selectedElement.borderSides || 'left'}
                  onChange={(e) => handleInputChange('borderSides', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>
            )}

            {/* Conditional: Two Sides */}
            {selectedElement.borderStyle === 'two' && (
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-700">Select Sides</label>
                <select
                  value={selectedElement.borderSides || 'vertical'}
                  onChange={(e) => handleInputChange('borderSides', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                >
                  <option value="vertical">Vertical (Left & Right)</option>
                  <option value="horizontal">Horizontal (Top & Bottom)</option>
                </select>
              </div>
            )}

            {/* Show border width and color only if border style is not 'none' */}
            {selectedElement.borderStyle && selectedElement.borderStyle !== 'none' && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-700">Border Width (px)</label>
                  <input
                    type="number"
                    value={selectedElement.borderWidth || 1}
                    onChange={(e) => handleNumberInputChange('borderWidth', e.target.value, 1)}
                    min="1"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-700">Border Color</label>
                  <input
                    type="color"
                    value={selectedElement.borderColor || '#000000'}
                    onChange={(e) => handleInputChange('borderColor', e.target.value)}
                    className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyPanel;
