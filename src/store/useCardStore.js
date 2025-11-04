import { create } from 'zustand';

const useCardStore = create((set, get) => ({
  // Canvas settings
  // Standard ID card size: 85.60 mm x 53.98 mm (converted to pixels at 96 DPI)
  // 85.60 mm = 323px, 53.98 mm = 204px
  canvas: {
    width: 323, // 85.60 mm in landscape
    height: 204, // 53.98 mm in landscape
    orientation: 'landscape', // 'landscape' or 'portrait'
    showGrid: false,
    snapToGrid: false,
    gridSize: 10,
    backgroundColor: '#ffffff',
    backgroundImage: null,
    zoom: 100, // Zoom percentage (50-200%)
  },

  // Elements on the card (text fields, images, QR codes)
  elements: [
    {
      id: 'name-1',
      type: 'text',
      label: 'Name',
      value: 'John Doe',
      x: 150,
      y: 80,
      fontSize: 24,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      color: '#000000',
      align: 'left',
      zIndex: 1,
    },
    {
      id: 'id-1',
      type: 'text',
      label: 'Employee ID',
      value: 'EMP-12345',
      x: 150,
      y: 120,
      fontSize: 16,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      color: '#333333',
      align: 'left',
      zIndex: 1,
    },
  ],

  // Selected element ID
  selectedElementId: null,

  // Templates
  templates: [
    {
      id: 'template-1',
      name: 'Corporate Blue',
      preview: '/templates/corporate-blue.png',
      backgroundImage: '/templates/corporate-blue.png',
      orientation: 'landscape',
    },
    {
      id: 'template-2',
      name: 'Modern Gradient',
      preview: '/templates/modern-gradient.png',
      backgroundImage: '/templates/modern-gradient.png',
      orientation: 'landscape',
    },
  ],

  // Actions
  setCanvasProperty: (property, value) => set((state) => ({
    canvas: { ...state.canvas, [property]: value }
  })),

  toggleOrientation: () => set((state) => {
    const isLandscape = state.canvas.orientation === 'landscape';
    return {
      canvas: {
        ...state.canvas,
        orientation: isLandscape ? 'portrait' : 'landscape',
        width: state.canvas.height,
        height: state.canvas.width,
      }
    };
  }),

  addElement: (element) => set((state) => ({
    elements: [...state.elements, { ...element, id: `${element.type}-${Date.now()}` }]
  })),

  updateElement: (id, updates) => set((state) => ({
    elements: state.elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    )
  })),

  deleteElement: (id) => set((state) => ({
    elements: state.elements.filter(el => el.id !== id),
    selectedElementId: state.selectedElementId === id ? null : state.selectedElementId
  })),

  selectElement: (id) => set({ selectedElementId: id }),

  deselectElement: () => set({ selectedElementId: null }),

  getSelectedElement: () => {
    const state = get();
    return state.elements.find(el => el.id === state.selectedElementId);
  },

  duplicateElement: (id) => set((state) => {
    const element = state.elements.find(el => el.id === id);
    if (!element) return state;
    
    const newElement = {
      ...element,
      id: `${element.type}-${Date.now()}`,
      x: element.x + 10,
      y: element.y + 10,
    };
    
    return { elements: [...state.elements, newElement] };
  }),

  moveElement: (id, x, y) => {
    const state = get();
    const { snapToGrid, gridSize } = state.canvas;
    
    let finalX = x;
    let finalY = y;
    
    if (snapToGrid) {
      finalX = Math.round(x / gridSize) * gridSize;
      finalY = Math.round(y / gridSize) * gridSize;
    }
    
    set((state) => ({
      elements: state.elements.map(el => 
        el.id === id ? { ...el, x: finalX, y: finalY } : el
      )
    }));
  },

  setTemplate: (template) => set((state) => ({
    canvas: {
      ...state.canvas,
      backgroundImage: template.backgroundImage,
      orientation: template.orientation,
    }
  })),

  clearAllElements: () => set({ elements: [], selectedElementId: null }),

  exportData: () => {
    const state = get();
    return {
      canvas: state.canvas,
      elements: state.elements,
    };
  },

  importData: (data) => set({
    canvas: data.canvas || get().canvas,
    elements: data.elements || [],
    selectedElementId: null,
  }),
}));

export default useCardStore;
