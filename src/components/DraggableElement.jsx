import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';

const DraggableElement = ({ children, position, onDrag, bounds = 'parent', disabled = false, onSelect }) => {
  const elementRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState(position);

  useEffect(() => {
    setCurrentPos(position);
  }, [position]);

  const handleMouseDown = useCallback((e) => {
    if (disabled) return;
    
    e.stopPropagation(); // Prevent canvas deselect
    onSelect?.();
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - currentPos.x,
      y: e.clientY - currentPos.y,
    });
  }, [disabled, onSelect, currentPos]);

  const handleClick = useCallback((e) => {
    e.stopPropagation(); // Prevent canvas deselect when clicking element
    onSelect?.();
  }, [onSelect]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      let newX = e.clientX - dragStart.x;
      let newY = e.clientY - dragStart.y;

      // Apply bounds if parent
      if (bounds === 'parent' && elementRef.current) {
        const parent = elementRef.current.parentElement;
        if (parent) {
          const parentRect = parent.getBoundingClientRect();
          const elementRect = elementRef.current.getBoundingClientRect();
          
          newX = Math.max(0, Math.min(newX, parentRect.width - elementRect.width));
          newY = Math.max(0, Math.min(newY, parentRect.height - elementRect.height));
        }
      }

      setCurrentPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onDrag?.(null, { x: currentPos.x, y: currentPos.y });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, currentPos, onDrag, bounds]);

  const elementStyle = useMemo(() => ({
    position: 'absolute',
    left: `${currentPos.x}px`,
    top: `${currentPos.y}px`,
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    transition: isDragging ? 'none' : 'all 0.1s ease-out',
  }), [currentPos, isDragging]);

  return (
    <div
      ref={elementRef}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      style={elementStyle}
      role="button"
      tabIndex={0}
      aria-label="Draggable element"
    >
      {children}
    </div>
  );
};

export default DraggableElement;
