import React, { useRef, useState, useEffect } from 'react';

const DraggableElement = ({ children, position, onDrag, bounds = 'parent', disabled = false, onSelect }) => {
  const elementRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState(position);

  useEffect(() => {
    setCurrentPos(position);
  }, [position]);

  const handleMouseDown = (e) => {
    if (disabled) return;
    
    e.stopPropagation(); // Prevent canvas deselect
    if (onSelect) onSelect();
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - currentPos.x,
      y: e.clientY - currentPos.y,
    });
  };

  const handleClick = (e) => {
    e.stopPropagation(); // Prevent canvas deselect when clicking element
    if (onSelect) onSelect();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

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
      if (isDragging) {
        setIsDragging(false);
        if (onDrag) {
          onDrag(null, { x: currentPos.x, y: currentPos.y });
        }
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, currentPos, onDrag, bounds]);

  return (
    <div
      ref={elementRef}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      style={{
        position: 'absolute',
        left: `${currentPos.x}px`,
        top: `${currentPos.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        transition: isDragging ? 'none' : 'all 0.1s ease-out',
      }}
    >
      {children}
    </div>
  );
};

export default DraggableElement;
