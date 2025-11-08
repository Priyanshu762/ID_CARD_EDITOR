import React, { useEffect, useCallback, use } from 'react';
import { useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import Navbar from '../components/Navbar';
import Toolbar from '../components/Toolbar';
import Sidebar from '../components/Sidebar';
import Canvas from '../components/Canvas';
import PropertyPanel from '../components/PropertyPanel';
import { useTemplateByName, useUpdateTemplate } from '../hooks/useTemplates';
import useCardStore from '../store/useCardStore';
import toast from 'react-hot-toast';

const TemplateEditor = () => {
  const { name } = useParams();
  const { importData, canvas, elements } = useCardStore();
  
  // Fetch template if name is provided (not 'new')
  const { data: templateData, isLoading } = useTemplateByName(name, {
    onSuccess: (data) => {
      console.log('Successfully fetched template data:', data);
    },
    enabled: name !== 'new' && !!name,
  });
// useEffect(() => {
//   if (templateData) {
//     importData({
//       canvas: templateData.templateData.canvas,
//       elements: templateData.templateData.elements,
//     });
//   }
// }, [templateData, importData]);
  // Update template mutation
  const updateTemplateMutation = useUpdateTemplate({
    onSuccess: () => {
      
      toast.success('Template saved successfully!');
    },
    onError: () => {
      toast.error('Failed to save template');
    },
  });

  // Simple save function
  const saveTemplate = useCallback(async () => {
    // For new templates, user must provide a name first via SaveTemplateModal
    if (name === 'new') {
      toast.error('Please save the template with a name first');
      return;
    }

    // Validate canvas has elements
    if (elements.length === 0) {
      toast.error('Cannot save empty template. Add at least one element.');
      return;
    }

    // Generate thumbnail
    const canvasElement = document.getElementById('id-card-canvas');
    let thumbnail = null;

    if (canvasElement) {
      try {
        const capturedCanvas = await html2canvas(canvasElement, {
          backgroundColor: canvas.backgroundColor,
          scale: 0.5,
        });
        thumbnail = capturedCanvas.toDataURL('image/jpeg', 0.7);
      } catch (error) {
        console.error('Failed to generate thumbnail:', error);
      }
    }

    // Prepare template data
    const payload = {
      name: decodeURIComponent(name), // Use name from URL
      thumbnail,
      templateData: {
        canvas: {
          width: canvas.width,
          height: canvas.height,
          backgroundColor: canvas.backgroundColor,
          backgroundOpacity: canvas.backgroundOpacity,
          backgroundImage: canvas.backgroundImage,
          borderStyle: canvas.borderStyle,
          borderWidth: canvas.borderWidth,
          borderColor: canvas.borderColor,
          borderSides: canvas.borderSides,
        },
        elements: elements.map(el => ({
          ...el,
          ref: undefined,
        })),
      },
    };

    console.log('=== SAVING TEMPLATE ===');
    console.log('Canvas state from store:', canvas);
    console.log('Template data being sent:', JSON.stringify(payload, null, 2));

    // Save using findOneAndUpdate (backend will create if not exists)
    updateTemplateMutation.mutate({ name: decodeURIComponent(name), data: payload });
  }, [name, canvas, elements, updateTemplateMutation]);

  // Load template data when fetched
  useEffect(() => {
    if (name === 'new') {
      console.log('Loading NEW template');
      // Clear canvas for new template with default values
      importData({
        canvas: { 
          width: 323, 
          height: 204, 
          backgroundColor: '#ffffff',
          backgroundOpacity: 1,
          backgroundImage: null,
          borderStyle: 'none',
          borderWidth: 1,
          borderColor: '#000000',
          borderSides: '',
        },
        elements: []
      });
    } else if (templateData) {
      // Load existing template
      const template = templateData;
      
      if (templateData.templateData) {
        // Merge with default values for backward compatibility
        const canvasData = {
          width: templateData.templateData.canvas.width || 323,
          height: templateData.templateData.canvas.height || 204,
          backgroundColor: templateData.templateData.canvas.backgroundColor || '#ffffff',
          backgroundOpacity: templateData.templateData.canvas.backgroundOpacity !== undefined 
            ? templateData.templateData.canvas.backgroundOpacity 
            : 1,
          backgroundImage: templateData.templateData.canvas.backgroundImage || null,
          borderStyle: templateData.templateData.canvas.borderStyle || 'none',
          borderWidth: templateData.templateData.canvas.borderWidth || 1,
          borderColor: templateData.templateData.canvas.borderColor || '#000000',
          borderSides: templateData.templateData.canvas.borderSides || '',
          // Keep other canvas properties
          showGrid: templateData.templateData.canvas.showGrid !== undefined 
            ? templateData.templateData.canvas.showGrid 
            : false,
          snapToGrid: templateData.templateData.canvas.snapToGrid !== undefined 
            ? templateData.templateData.canvas.snapToGrid 
            : false,
          gridSize: templateData.templateData.canvas.gridSize || 10,
          zoom: templateData.templateData.canvas.zoom || 100,
        };


        const dataToImport = {
          canvas: canvasData,
          elements: templateData.templateData.elements || [],
        };
        importData(dataToImport);
        
        
        toast.success(`Template "${template.name}" loaded for editing`);
      }
    }
  }, [name, templateData, importData]);

  if (isLoading && name !== 'new') {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Navbar />
      <Toolbar 
        templateName={name !== 'new' ? decodeURIComponent(name) : 'New Template'}
        onSave={saveTemplate}
        isNewTemplate={name === 'new'}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <Canvas />
        <PropertyPanel />
      </div>
    </div>
  );
};

export default TemplateEditor;
