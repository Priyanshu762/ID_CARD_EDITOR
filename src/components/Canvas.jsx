import React, { useRef, useEffect } from 'react';
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

  const handleDrag = (elementId, e, data) => {
    moveElement(elementId, data.x, data.y);
  };

  const renderElement = (element) => {
    const isSelected = selectedElementId === element.id;
    
    switch (element.type) {
      case 'text':
        return (
          <DraggableElement
            key={element.id}
            position={{ x: element.x, y: element.y }}
            onDrag={(e, data) => handleDrag(element.id, e, data)}
            onSelect={() => selectElement(element.id)}
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
                }}
              >
                {element.value}
              </div>
            </div>
          </DraggableElement>
        );

      case 'image':
        return (
          <DraggableElement
            key={element.id}
            position={{ x: element.x, y: element.y }}
            onDrag={(e, data) => handleDrag(element.id, e, data)}
            onSelect={() => selectElement(element.id)}
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
                  }}
                >
                  Upload Image
                </div>
              )}
            </div>
          </DraggableElement>
        );

      case 'qr':
        return (
          <DraggableElement
            key={element.id}
            position={{ x: element.x, y: element.y }}
            onDrag={(e, data) => handleDrag(element.id, e, data)}
            onSelect={() => selectElement(element.id)}
          >
            <div
              style={{
                border: isSelected ? '2px dashed #3b82f6' : '2px dashed transparent',
                padding: '4px',
              }}
            >
              <QRCodeSVG value={element.data} size={element.size} style={{ pointerEvents: 'none' }} />
            </div>
          </DraggableElement>
        );

      default:
        return null;
    }
  };

  const zoomScale = canvas.zoom / 100;

  const handleCanvasClick = (e) => {
    // Only deselect if clicking directly on the canvas, not on elements
    if (e.target.id === 'id-card-canvas') {
      deselectElement();
    }
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6 overflow-auto"
    >
      <div
        ref={canvasRef}
        id="id-card-canvas"
        onClick={handleCanvasClick}
        style={{
          width: `${canvas.width}px`,
          height: `${canvas.height}px`,
          backgroundColor: canvas.backgroundColor,
          position: 'relative',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          transform: `scale(${zoomScale})`,
          transformOrigin: 'center center',
          transition: 'transform 0.1s ease-out',
          backgroundImage: canvas.showGrid
            ? `linear-gradient(to right, #e0e0e0 1px, transparent 1px),
               linear-gradient(to bottom, #e0e0e0 1px, transparent 1px)
               ${canvas.backgroundImage ? `, url(${canvas.backgroundImage})` : ''}`
            : canvas.backgroundImage ? `url(${canvas.backgroundImage})` : 'none',
          backgroundSize: canvas.showGrid
            ? `${canvas.gridSize}px ${canvas.gridSize}px, ${canvas.gridSize}px ${canvas.gridSize}px${canvas.backgroundImage ? ', cover' : ''}`
            : 'cover',
          backgroundPosition: 'center',
        }}
      >
        {elements
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((element) => renderElement(element))}
      </div>
    </div>
  );
};

export default Canvas;
