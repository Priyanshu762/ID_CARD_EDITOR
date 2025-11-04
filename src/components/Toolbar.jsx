import React from 'react';
import { Download, Printer, RotateCw, Save, Upload, Trash2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import useCardStore from '../store/useCardStore';

const Toolbar = () => {
  const { toggleOrientation, canvas, exportData, importData, clearAllElements } = useCardStore();

  const exportAsPNG = async () => {
    const canvasElement = document.getElementById('id-card-canvas');
    if (!canvasElement) return;

    const canvas = await html2canvas(canvasElement, {
      backgroundColor: null,
      scale: 2,
    });

    const link = document.createElement('a');
    link.download = `id-card-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const exportAsJPG = async () => {
    const canvasElement = document.getElementById('id-card-canvas');
    if (!canvasElement) return;

    const canvas = await html2canvas(canvasElement, {
      backgroundColor: '#ffffff',
      scale: 2,
    });

    const link = document.createElement('a');
    link.download = `id-card-${Date.now()}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  const exportAsPDF = async () => {
    const canvasElement = document.getElementById('id-card-canvas');
    if (!canvasElement) return;

    const canvas = await html2canvas(canvasElement, {
      backgroundColor: '#ffffff',
      scale: 2,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: canvas.orientation === 'landscape' ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`id-card-${Date.now()}.pdf`);
  };

  const printCard = async () => {
    const canvasElement = document.getElementById('id-card-canvas');
    if (!canvasElement) return;

    const canvas = await html2canvas(canvasElement, {
      backgroundColor: '#ffffff',
      scale: 2,
    });

    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Print ID Card</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('@media print { @page { margin: 0; } body { margin: 0; padding: 0; } }');
    printWindow.document.write('body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }');
    printWindow.document.write('img { display: block; }');
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(`<img src="${canvas.toDataURL()}" style="width: auto; height: auto;" />`);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const saveProject = () => {
    const data = exportData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = `id-card-project-${Date.now()}.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const loadProject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            importData(data);
          } catch {
            alert('Invalid project file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">🪪 ID Card Editor</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleOrientation}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg flex items-center gap-1.5 font-medium transition-all shadow-sm text-sm"
            title="Toggle Orientation"
          >
            <RotateCw size={16} />
            {canvas.orientation === 'landscape' ? 'Landscape' : 'Portrait'}
          </button>

          <div className="w-px h-6 bg-gray-300" />

          <button
            onClick={saveProject}
            className="px-3 py-2 bg-blue-100 hover:bg-blue-200 active:bg-blue-300 text-blue-700 rounded-lg flex items-center gap-1.5 font-medium transition-all shadow-sm text-sm"
            title="Save Project"
          >
            <Save size={16} />
            Save
          </button>

          <button
            onClick={loadProject}
            className="px-3 py-2 bg-green-100 hover:bg-green-200 active:bg-green-300 text-green-700 rounded-lg flex items-center gap-1.5 font-medium transition-all shadow-sm text-sm"
            title="Load Project"
          >
            <Upload size={16} />
            Load
          </button>

          <button
            onClick={() => {
              if (confirm('Clear all elements?')) {
                clearAllElements();
              }
            }}
            className="px-3 py-2 bg-red-100 hover:bg-red-200 active:bg-red-300 text-red-700 rounded-lg flex items-center gap-1.5 font-medium transition-all shadow-sm text-sm"
            title="Clear All"
          >
            <Trash2 size={16} />
            Clear
          </button>

          <div className="w-px h-6 bg-gray-300" />

          <div className="relative group">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg flex items-center gap-1.5 font-medium shadow-md transition-all text-sm">
              <Download size={16} />
              Export
            </button>
            <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
              <button
                onClick={exportAsPNG}
                className="w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors font-medium text-sm text-gray-700"
              >
                Export as PNG
              </button>
              <button
                onClick={exportAsJPG}
                className="w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors font-medium text-sm text-gray-700"
              >
                Export as JPG
              </button>
              <button
                onClick={exportAsPDF}
                className="w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors font-medium text-sm text-gray-700"
              >
                Export as PDF
              </button>
            </div>
          </div>

          <button
            onClick={printCard}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-lg flex items-center gap-1.5 font-medium shadow-md transition-all text-sm"
          >
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
