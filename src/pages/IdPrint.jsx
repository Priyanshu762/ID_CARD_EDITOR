import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Printer, Save, RefreshCw, UserPlus } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import Navbar from '../components/Navbar';
import { SkeletonLoader } from '../components/Skeleton';
import { useTemplates, useTemplateByName } from '../hooks/useTemplates';
import { useCreateUser, useUpdateUser, useUsers } from '../hooks/useUsers';
import { generatePrintHTML, pxToMm } from '../utils/printUtils';

// Sidebar component for user data input (print-focused, no editing)
const Sidebar = React.memo(({ templateData, userData, onInputChange, onImageUpload }) => {
  const textElements = useMemo(
    () => templateData.elements.filter(el => el.type === 'text'),
    [templateData.elements]
  );

  const imageElements = useMemo(
    () => templateData.elements.filter(el => el.type === 'image'),
    [templateData.elements]
  );

  const qrElements = useMemo(
    () => templateData.elements.filter(el => el.type === 'qr'),
    [templateData.elements]
  );

  return (
    <div className="w-72 bg-white border-r border-gray-200 overflow-y-auto shadow-sm">
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4 text-gray-800">User Information</h2>
        
        <div className="space-y-4">
          {textElements.map((element) => (
            <div key={element.id}>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">
                {element.label}
              </label>
              <input
                type="text"
                value={userData[element.label] || ''}
                onChange={(e) => onInputChange(element.label, e.target.value)}
                placeholder={element.value}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
              />
            </div>
          ))}

          {imageElements.map((element, index) => (
            <div key={element.id}>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">
                Photo {index + 1}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onImageUpload(element.id, e)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              {userData[element.id] && (
                <img
                  src={userData[element.id]}
                  alt="Preview"
                  className="mt-2 w-full h-32 object-cover rounded-lg border-2 border-gray-300"
                />
              )}
            </div>
          ))}

          {qrElements.map((element) => (
            <div key={element.id}>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">
                QR Code Data
              </label>
              <input
                type="text"
                value={userData[element.label] || element.data}
                onChange={(e) => onInputChange(element.label, e.target.value)}
                placeholder="Enter QR code data"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

Sidebar.displayName = 'Sidebar';

// Card preview component (memoized for performance)
const CardPreview = React.memo(({ canvasRef, templateData, renderElement }) => {
  const sortedElements = useMemo(
    () => [...templateData.elements].sort((a, b) => a.zIndex - b.zIndex),
    [templateData.elements]
  );

  const canvasStyle = useMemo(() => {
    // Convert hex color to rgba with opacity
    const hexToRgba = (hex, opacity) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    const backgroundColor = hexToRgba(
      templateData.canvas.backgroundColor || '#ffffff',
      templateData.canvas.backgroundOpacity !== undefined ? templateData.canvas.backgroundOpacity : 1
    );

    const baseStyle = {
      width: `${templateData.canvas.width}px`,
      height: `${templateData.canvas.height}px`,
      backgroundColor,
      position: 'relative',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      backgroundImage: templateData.canvas.backgroundImage ? `url(${templateData.canvas.backgroundImage})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };

    // Apply canvas border styles
    const getCanvasBorderStyle = () => {
      if (!templateData.canvas.borderStyle || templateData.canvas.borderStyle === 'none') {
        return { border: '1px solid rgba(0, 0, 0, 0.05)' };
      }

      const borderWidth = templateData.canvas.borderWidth || 1;
      const borderColor = templateData.canvas.borderColor || '#000000';
      const borderValue = `${borderWidth}px solid ${borderColor}`;

      switch (templateData.canvas.borderStyle) {
        case 'all':
          return { border: borderValue };
        
        case 'one': {
          const side = templateData.canvas.borderSides || 'left';
          return { [`border${side.charAt(0).toUpperCase()}${side.slice(1)}`]: borderValue };
        }
        
        case 'two': {
          const sides = templateData.canvas.borderSides || 'vertical';
          if (sides === 'vertical') {
            return {
              borderLeft: borderValue,
              borderRight: borderValue,
            };
          } else {
            return {
              borderTop: borderValue,
              borderBottom: borderValue,
            };
          }
        }
        
        default:
          return { border: '1px solid rgba(0, 0, 0, 0.05)' };
      }
    };

    return {
      ...baseStyle,
      ...getCanvasBorderStyle(),
    };
  }, [templateData.canvas]);

  return (
    <div
      ref={canvasRef}
      id="id-card-print-canvas"
      style={canvasStyle}
    >
      {sortedElements.map((element) => renderElement(element))}
    </div>
  );
});

CardPreview.displayName = 'CardPreview';

const IdPrint = () => {
  const canvasRef = useRef(null);
  const [selectedTemplateName, setSelectedTemplateName] = useState(null);
  const [templateData, setTemplateData] = useState(null);
  const [userData, setUserData] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  console.log("TemplateDAta",templateData);
  
  // Fetch templates list using React Query
  const { data: templatesData, isLoading: isLoadingTemplates, refetch: refetchTemplates } = useTemplates();
  
  // Fetch users list using React Query
  const { data: usersData, isLoading: isLoadingUsers, refetch: refetchUsers } = useUsers();

  const templates = templatesData || [];
  const users = useMemo(() => usersData?.data || [], [usersData]);

  // Fetch specific template details by name when selected - using useTemplateByName hook
  const { data: templateDetailData, isLoading: isTemplateLoading } = useTemplateByName(selectedTemplateName, {
    enabled: !!selectedTemplateName,
    onSuccess: (data) => {
      console.log('Successfully fetched template data:', data);
    },
  });

  // Create user mutation
  const createUserMutation = useCreateUser({
    onSuccess: (data) => {
      console.log('User saved successfully');
      toast.success('User data saved successfully!');
      refetchUsers(); // Refresh users list after creating
      
      // Auto-select the newly created user if ID is returned
      if (data?.data?._id) {
        setSelectedUserId(data.data._id);
      }
    },
    onError: (error) => {
      console.error('Error saving user:', error);
      toast.error('Failed to save user data');
    },
  });

  // Update user mutation
  const updateUserMutation = useUpdateUser({
    onSuccess: () => {
      console.log('User updated successfully');
      toast.success('User data updated successfully!');
      refetchUsers(); // Refresh users list after updating
    },
    onError: (error) => {
      console.error('Error updating user:', error);
      toast.error('Failed to update user data');
    },
  });

  // Load template data when fetched from backend via useTemplateByName hook
  useEffect(() => {
    console.log("Template");
    
    if ( templateDetailData) {
      const template = templateDetailData;
      
      // Set template data for rendering with default values for backward compatibility
      if (template.templateData) {
        const canvasData = {
          width: templateDetailData.templateData.canvas.width || 323,
          height: templateDetailData.templateData.canvas.height || 204,
          backgroundColor: templateDetailData.templateData.canvas.backgroundColor || '#ffffff',
          backgroundOpacity: templateDetailData.templateData.canvas.backgroundOpacity !== undefined 
            ? templateDetailData.templateData.canvas.backgroundOpacity 
            : 1,
          backgroundImage: templateDetailData.templateData.canvas.backgroundImage || null,
          borderStyle: templateDetailData.templateData.canvas.borderStyle || 'none',
          borderWidth: templateDetailData.templateData.canvas.borderWidth || 1,
          borderColor: templateDetailData.templateData.canvas.borderColor || '#000000',
          borderSides: templateDetailData.templateData.canvas.borderSides || '',
        };

        setTemplateData({
          canvas: canvasData,
          elements: templateDetailData.templateData.elements || [],
        });
        
        // Initialize userData based on template elements
        const initialUserData = {};
        (templateDetailData.templateData.elements || []).forEach(element => {
          if (element.type === 'text') {
            initialUserData[element.label] = element.value || '';
          } else if (element.type === 'image') {
            initialUserData[element.id] = null;
          } else if (element.type === 'qr') {
            initialUserData[element.label] = element.data || '';
          }
        });
        setUserData(initialUserData);
        
        toast.success(`Template "${template.name}" loaded successfully!`, { id: 'load-template' });
      }
    } else if (templateDetailData?.success === false) {
      toast.error('Failed to load template data', { id: 'load-template' });
    }
  }, [templateDetailData]);

  // Add print styles to maintain exact physical size using printUtils
  useEffect(() => {
    if (!templateData) return;

    const style = document.createElement('style');
    
    // Convert canvas size to mm for accurate printing
    const widthMm = pxToMm(templateData.canvas.width);
    const heightMm = pxToMm(templateData.canvas.height);
    
    style.innerHTML = `
      @page {
        size: A4;
        margin: 20mm;
      }
      
      @media print {
        body * {
          visibility: hidden;
        }
        
        #id-card-print-canvas,
        #id-card-print-canvas * {
          visibility: visible;
        }
        
        #id-card-print-canvas {
          position: absolute;
          left: 20mm !important;
          top: 20mm !important;
          /* Exact physical dimensions in mm for accurate printing */
          width: ${widthMm}mm !important;
          height: ${heightMm}mm !important;
          box-shadow: none !important;
          transform: none !important;
          transform-origin: top left !important;
          page-break-inside: avoid;
        }
        
        /* Ensure all child elements maintain their pixel-based positions and sizes */
        #id-card-print-canvas * {
          transform: none !important;
        }
        
        /* Hide scroll bars during print */
        html, body {
          overflow: visible !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [templateData]);

  const loadTemplate = useCallback((templateName) => {
    // Set selected template name - useTemplateByName hook will automatically fetch latest data from backend
    setSelectedTemplateName(templateName);
    toast.loading(`Loading template "${templateName}"...`, { id: 'load-template' });
  }, []);

  const handleInputChange = useCallback((label, value) => {
    setUserData(prev => ({
      ...prev,
      [label]: value
    }));
  }, []);

  const handleUserSelect = useCallback((userId) => {
    setSelectedUserId(userId);
    
    if (!userId) {
      // Clear user data if no user selected (default behavior)
      if (templateData) {
        const initialUserData = {};
        (templateData.elements || []).forEach(element => {
          if (element.type === 'text') {
            initialUserData[element.label] = element.value || '';
          } else if (element.type === 'image') {
            initialUserData[element.id] = null;
          } else if (element.type === 'qr') {
            initialUserData[element.label] = element.data || '';
          }
        });
        setUserData(initialUserData);
      }
      return;
    }

    // Load selected user's data
    const selectedUser = users.find(u => u._id === userId);
    if (selectedUser) {
      // Auto-select template if available
      if (selectedUser.templateName && selectedUser.templateName !== selectedTemplateName) {
        loadTemplate(selectedUser.templateName);
      }
      
      // Load user data
      if (selectedUser.userData) {
        setUserData(selectedUser.userData);
        toast.success(`Loaded user data for ${selectedUser.templateName || 'user'}`);
      }
    }
  }, [users, templateData, selectedTemplateName, loadTemplate]);

  const handleImageUpload = useCallback((elementId, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserData(prev => ({
          ...prev,
          [elementId]: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const saveUserToServer = useCallback(async () => {
    if (!selectedTemplateName || !templateDetailData) {
      toast.error('Please select a template first');
      return;
    }

    try {
      const template = templateDetailData;
      
      // Check if we're updating an existing user or creating a new one
      if (selectedUserId) {
        // Update existing user
        await updateUserMutation.mutateAsync({
          id: selectedUserId,
          data: {
            userData,
            templateId: template._id,
            templateName: template.name
          }
        });
      } else {
        // Create new user
        await createUserMutation.mutateAsync({
          userData,
          templateId: template._id,
          templateName: template.name
        });
      }
    } catch (error) {
      console.error('Error saving user:', error);
      // Error toast is already handled by the mutation
    }
  }, [selectedTemplateName, templateDetailData, userData, selectedUserId, createUserMutation, updateUserMutation]);

  const handlePrint = useCallback(async () => {
    if (!selectedTemplateName || !templateData) {
      toast.error('Please select a template first');
      return;
    }

    try {
      // Save user data before printing
      await saveUserToServer();

      // Capture the ID card canvas as an image
      const canvasElement = document.getElementById('id-card-print-canvas');
      if (!canvasElement) {
        toast.error('Canvas element not found');
        return;
      }

      toast.loading('Preparing print preview...');

      // Capture canvas with high quality
      const canvas = await html2canvas(canvasElement, {
        backgroundColor: templateData.canvas.backgroundColor,
        scale: 2, // Higher resolution for better print quality
        logging: false,
        useCORS: true, // Enable CORS for images
      });

      const imageDataUrl = canvas.toDataURL('image/png');

      // Generate print-optimized HTML using printUtils
      const printHTML = generatePrintHTML(
        imageDataUrl,
        {
          width: templateData.canvas.width,
          height: templateData.canvas.height
        },
        'landscape', // orientation
        1 // number of copies
      );

      // Open print preview in new window
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow popups to print');
        return;
      }

      printWindow.document.write(printHTML);
      printWindow.document.close();

      toast.dismiss();
      toast.success('Print preview opened');
    } catch (error) {
      console.error('Print error:', error);
      toast.dismiss();
      toast.error('Failed to prepare print preview');
    }
  }, [selectedTemplateName, templateData, saveUserToServer]);


  // Helper function to generate border styles (same as Canvas component)
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

  const renderElement = useCallback((element) => {
    const borderStyles = getBorderStyle(element);
    
    switch (element.type) {
      case 'text': {
        const textValue = userData[element.label] !== undefined ? userData[element.label] : element.value;
        return (
          <div
            key={element.id}
            style={{
              position: 'absolute',
              left: `${element.x}px`,
              top: `${element.y}px`,
              zIndex: element.zIndex,
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
                ...borderStyles,
              }}
            >
              {textValue}
            </div>
          </div>
        );
      }

      case 'image': {
        const imageSrc = userData[element.id] || element.src;
        return (
          <div
            key={element.id}
            style={{
              position: 'absolute',
              left: `${element.x}px`,
              top: `${element.y}px`,
              zIndex: element.zIndex,
            }}
          >
            {imageSrc ? (
              <img
                src={imageSrc}
                alt="ID"
                style={{
                  width: `${element.width}px`,
                  height: `${element.height}px`,
                  borderRadius: `${element.borderRadius}px`,
                  objectFit: 'cover',
                  display: 'block',
                  ...borderStyles,
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
                  ...borderStyles,
                }}
              >
                Upload Image
              </div>
            )}
          </div>
        );
      }

      case 'qr': {
        const qrData = userData[element.label] || element.data;
        return (
          <div
            key={element.id}
            style={{
              position: 'absolute',
              left: `${element.x}px`,
              top: `${element.y}px`,
              zIndex: element.zIndex,
            }}
          >
            <div style={{ display: 'inline-block', ...borderStyles }}>
              <QRCodeSVG value={qrData} size={element.size} style={{ display: 'block' }} />
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  }, [userData, getBorderStyle]);

  // Show loading screen for initial templates fetch
  if (isLoadingTemplates && templates.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Navbar />
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              🖨️ ID Card Printer
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={saveUserToServer}
              disabled={!selectedTemplateName || !templateData}
              className={`px-4 py-2.5 rounded-lg flex items-center gap-2 font-semibold transition-all shadow-md text-sm ${
                !selectedTemplateName || !templateData
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : selectedUserId
                  ? 'bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white'
                  : 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white'
              }`}
              title={selectedUserId ? "Update User Data" : "Save New User"}
            >
              <Save size={18} />
              {selectedUserId ? '✏️ Update User' : '💾 Save User'}
            </button>

            <button
              onClick={handlePrint}
              disabled={!selectedTemplateName || !templateData}
              className={`px-4 py-2.5 rounded-lg flex items-center gap-2 font-semibold transition-all shadow-md text-sm ${
                !selectedTemplateName || !templateData
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
              }`}
              title="Print ID Card"
            >
              <Printer size={18} />
              Print Card
            </button>
          </div>
        </div>
      </div>

      {/* Template Selector */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-4">
          {/* Template Selection */}
          <div className="flex items-center gap-3 flex-1">
            <label className="font-semibold text-gray-800 text-sm whitespace-nowrap">Select Template:</label>
            <select
              value={selectedTemplateName || ''}
              onChange={(e) => {
                const templateName = e.target.value;
                if (templateName) {
                  loadTemplate(templateName);
                } else {
                  // Reset if no template selected
                  setSelectedTemplateName(null);
                  setTemplateData(null);
                  setUserData({});
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              disabled={isLoadingTemplates || templates.length === 0}
            >
              <option value="">-- Select a template --</option>
              {templates.map((template) => (
                <option key={template._id} value={template.name}>
                  {template.name}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => refetchTemplates()}
              disabled={isLoadingTemplates}
              className="p-2 hover:bg-gray-200 rounded transition-all"
              title="Refresh templates"
            >
              <RefreshCw size={16} className={isLoadingTemplates ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-300"></div>

          {/* User Selection */}
          <div className="flex items-center gap-3 flex-1">
            <label className="font-semibold text-gray-800 text-sm flex items-center gap-2 whitespace-nowrap">
              <UserPlus size={16} />
              Load Existing User:
            </label>
            <select
              value={selectedUserId || ''}
              onChange={(e) => handleUserSelect(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
              disabled={isLoadingUsers}
            >
              <option value="">-- New User (Empty Form) --</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.templateName || 'User'} - {user.userData?.Name || user.userData?.['Employee ID'] || user._id}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => refetchUsers()}
              disabled={isLoadingUsers}
              className="p-2 hover:bg-gray-200 rounded transition-all"
              title="Refresh users"
            >
              <RefreshCw size={16} className={isLoadingUsers ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {templates.length === 0 && !isLoadingTemplates && (
          <p className="text-xs text-gray-500 mt-2">No templates available. Create templates in the Template Editor first.</p>
        )}
      </div>

      {/* Main Content Area */}
      {isTemplateLoading ? (
        // Show skeleton loader while template is loading
        <SkeletonLoader />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - User Input Form */}
          {selectedTemplateName && templateData && templateData.elements && templateData.elements.length > 0 && (
            <Sidebar
              templateData={templateData}
              userData={userData}
              onInputChange={handleInputChange}
              onImageUpload={handleImageUpload}
            />
          )}

          {/* Canvas - ID Card Preview */}
          <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6 overflow-auto">
            {!selectedTemplateName ? (
              <div className="text-center text-gray-500">
                <Printer size={64} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-semibold mb-2">No Template Selected</p>
                <p className="text-sm">Please select a template from above to get started</p>
              </div>
            ) : templateData && templateData.elements && templateData.elements.length > 0 ? (
              <CardPreview
                canvasRef={canvasRef}
                templateData={templateData}
                renderElement={renderElement}
              />
            ) : templateData ? (
              <div className="text-center text-gray-500">
                <Printer size={64} className="mx-auto mb-4 text-yellow-400" />
                <p className="text-lg font-semibold mb-2 text-yellow-600">Empty Template</p>
                <p className="text-sm">This template has no elements (text, image, or QR code).</p>
                <p className="text-sm mt-2">Please add elements to this template in the <strong>Template Editor</strong> first.</p>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <Printer size={64} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-semibold mb-2">Loading...</p>
                <p className="text-sm">Fetching template data...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IdPrint;
