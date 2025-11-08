import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import useCardStore from '../store/useCardStore';
import DraggableElement from './DraggableElement';

const Canvas = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const { canvas, elements, selectedElementId, selectElement, moveElement, deselectElement, setCanvasProperty } = useCardStore();

  // Zoom with Ctrl + Mouse Wheel
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -5 : 5;
        const newZoom = Math.min(Math.max(canvas.zoom + delta, 50), 200);
        setCanvasProperty('zoom', newZoom);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [canvas.zoom, setCanvasProperty]);

  const handleDrag = useCallback((elementId, e, data) => {
    moveElement(elementId, data.x, data.y);
  }, [moveElement]);

  const handleElementSelect = useCallback((elementId) => {
    selectElement(elementId);
  }, [selectElement]);

  // Helper function to generate border styles based on element border properties
  const getBorderStyle = useCallback((element) => {
    if (!element.borderStyle || element.borderStyle === 'none') {
      return {};
    }

    const borderWidth = element.borderWidth || 1;
    const borderColor = element.borderColor || '#000000';
    const borderValue = `${borderWidth}px solid ${borderColor}`;

    switch (element.borderStyle) {
      case 'all':
        return { border: borderValue };
      
      case 'one': {
        const side = element.borderSides || 'left';
        return { [`border${side.charAt(0).toUpperCase()}${side.slice(1)}`]: borderValue };
      }
      
      case 'two': {
        const sides = element.borderSides || 'vertical';
        if (sides === 'vertical') {
          return {
            borderLeft: borderValue,
            borderRight: borderValue,
          };
        } else { // horizontal
          return {
            borderTop: borderValue,
            borderBottom: borderValue,
          };
        }
      }
      
      default:
        return {};
    }
  }, []);

  // Helper function to generate canvas border styles
  const getCanvasBorderStyle = useCallback(() => {
    if (!canvas.borderStyle || canvas.borderStyle === 'none') {
      return { border: '1px solid rgba(0, 0, 0, 0.05)' }; // Default subtle border
    }

    const borderWidth = canvas.borderWidth || 1;
    const borderColor = canvas.borderColor || '#000000';
    const borderValue = `${borderWidth}px solid ${borderColor}`;

    switch (canvas.borderStyle) {
      case 'all':
        return { border: borderValue };
      
      case 'one': {
        const side = canvas.borderSides || 'left';
        return { [`border${side.charAt(0).toUpperCase()}${side.slice(1)}`]: borderValue };
      }
      
      case 'two': {
        const sides = canvas.borderSides || 'vertical';
        if (sides === 'vertical') {
          return {
            borderLeft: borderValue,
            borderRight: borderValue,
          };
        } else { // horizontal
          return {
            borderTop: borderValue,
            borderBottom: borderValue,
          };
        }
      }
      
      default:
        return { border: '1px solid rgba(0, 0, 0, 0.05)' };
    }
  }, [canvas.borderStyle, canvas.borderWidth, canvas.borderColor, canvas.borderSides]);

  const renderTextElement = useCallback((element, isSelected) => (
    <DraggableElement
      key={element.id}
      position={{ x: element.x, y: element.y }}
      onDrag={(e, data) => handleDrag(element.id, e, data)}
      onSelect={() => handleElementSelect(element.id)}
    >
      <div
        style={{
          border: isSelected ? '2px dashed #3b82f6' : '2px dashed transparent',
          padding: '4px',
        }}
      >
        <div
          style={{
            fontSize: `${element.fontSize}px`,
            fontFamily: element.fontFamily,
            fontWeight: element.fontWeight,
            color: element.color,
            textAlign: element.align,
            whiteSpace: 'nowrap',
            userSelect: 'none',
            pointerEvents: 'none',
            ...getBorderStyle(element),
          }}
        >
          {element.value}
        </div>
      </div>
    </DraggableElement>
  ), [handleDrag, handleElementSelect, getBorderStyle]);

  const renderImageElement = useCallback((element, isSelected) => (
    <DraggableElement
      key={element.id}
      position={{ x: element.x, y: element.y }}
      onDrag={(e, data) => handleDrag(element.id, e, data)}
      onSelect={() => handleElementSelect(element.id)}
    >
      <div
        style={{
          border: isSelected ? '2px dashed #3b82f6' : '2px dashed transparent',
        }}
      >
        {element.src ? (
          <img
            src={element.src}
            alt="ID Card"
            style={{
              width: `${element.width}px`,
              height: `${element.height}px`,
              borderRadius: `${element.borderRadius}px`,
              objectFit: 'cover',
              display: 'block',
              pointerEvents: 'none',
              ...getBorderStyle(element),
            }}
          />
        ) : (
          <div
            style={{
              width: `${element.width}px`,
              height: `${element.height}px`,
              borderRadius: `${element.borderRadius}px`,
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#999',
              pointerEvents: 'none',
              ...getBorderStyle(element),
            }}
          >
            Upload Image
          </div>
        )}
      </div>
    </DraggableElement>
  ), [handleDrag, handleElementSelect, getBorderStyle]);

  const renderQRElement = useCallback((element, isSelected) => (
    <DraggableElement
      key={element.id}
      position={{ x: element.x, y: element.y }}
      onDrag={(e, data) => handleDrag(element.id, e, data)}
      onSelect={() => handleElementSelect(element.id)}
    >
      <div
        style={{
          border: isSelected ? '2px dashed #3b82f6' : '2px dashed transparent',
          padding: '4px',
        }}
      >
        <div style={getBorderStyle(element)}>
          <QRCodeSVG value={element.data} size={element.size} style={{ pointerEvents: 'none', display: 'block' }} />
        </div>
      </div>
    </DraggableElement>
  ), [handleDrag, handleElementSelect, getBorderStyle]);

  const renderElement = useCallback((element) => {
    const isSelected = selectedElementId === element.id;
    
    switch (element.type) {
      case 'text':
        return renderTextElement(element, isSelected);
      case 'image':
        return renderImageElement(element, isSelected);
      case 'qr':
        return renderQRElement(element, isSelected);
      default:
        console.warn(`Unknown element type: ${element.type}`);
        return null;
    }
  }, [selectedElementId, renderTextElement, renderImageElement, renderQRElement]);

  const zoomScale = useMemo(() => canvas.zoom / 100, [canvas.zoom]);

  const handleCanvasClick = useCallback((e) => {
    // Only deselect if clicking directly on the canvas, not on elements
    if (e.target.id === 'id-card-canvas') {
      deselectElement();
    }
  }, [deselectElement]);

  const canvasStyle = useMemo(() => {
    // Convert hex color to rgba with opacity
    const hexToRgba = (hex, opacity) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    const backgroundColor = hexToRgba(
      canvas.backgroundColor || '#ffffff',
      canvas.backgroundOpacity !== undefined ? canvas.backgroundOpacity : 1
    );

    const baseStyle = {
      width: `${canvas.width}px`,
      height: `${canvas.height}px`,
      backgroundColor,
      position: 'relative',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      transform: `scale(${zoomScale})`,
      transformOrigin: 'center center',
      transition: 'transform 0.1s ease-out',
    };

    // Apply canvas border styles
    const canvasBorderStyle = getCanvasBorderStyle();
    Object.assign(baseStyle, canvasBorderStyle);

    // Build background image string
    let backgroundImage = 'none';
    let backgroundSize = 'auto';
    
    if (canvas.showGrid && canvas.backgroundImage) {
      backgroundImage = `linear-gradient(to right, #e0e0e0 1px, transparent 1px),
                        linear-gradient(to bottom, #e0e0e0 1px, transparent 1px),
                        url(${canvas.backgroundImage})`;
      backgroundSize = `${canvas.gridSize}px ${canvas.gridSize}px, ${canvas.gridSize}px ${canvas.gridSize}px, cover`;
    } else if (canvas.showGrid) {
      backgroundImage = `linear-gradient(to right, #e0e0e0 1px, transparent 1px),
                        linear-gradient(to bottom, #e0e0e0 1px, transparent 1px)`;
      backgroundSize = `${canvas.gridSize}px ${canvas.gridSize}px, ${canvas.gridSize}px ${canvas.gridSize}px`;
    } else if (canvas.backgroundImage) {
      backgroundImage = `url(${canvas.backgroundImage})`;
      backgroundSize = 'cover';
    }

    return {
      ...baseStyle,
      backgroundImage,
      backgroundSize,
      backgroundPosition: 'center',
    };
  }, [canvas, zoomScale, getCanvasBorderStyle]);

  const sortedElements = useMemo(() => 
    [...elements].sort((a, b) => a.zIndex - b.zIndex),
    [elements]
  );

  return (
    <div 
      ref={containerRef}
      className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6 overflow-auto"
    >
      <div
        ref={canvasRef}
        id="id-card-canvas"
        onClick={handleCanvasClick}
        style={canvasStyle}
      >
        {sortedElements.map((element) => renderElement(element))}
      </div>
    </div>
  );
};

export default Canvas;
