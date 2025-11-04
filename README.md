# 🪪 Advanced ID Card Editor & Printer

A powerful, interactive ID Card Generator built with **React + Vite + Tailwind CSS** featuring drag-and-drop functionality, customizable fields, and multiple export options.

## ✨ Features

### 🎨 Dynamic & Customizable Fields
- ✅ Add/remove predefined fields (Name, Employee ID, Department, etc.)
- ✅ Create custom fields with editable labels and values
- ✅ Full typography control:
  - Font family selection (Arial, Times New Roman, Georgia, etc.)
  - Font size, weight, and color customization
  - Text alignment (left, center, right)
- ✅ Drag-and-drop positioning
- ✅ Manual X/Y coordinate input
- ✅ Layer ordering (z-index control)

### 📸 Image & QR Code Support
- ✅ Upload profile photos with drag-and-drop
- ✅ Generate QR codes from custom data
- ✅ Adjustable image size and border radius
- ✅ Full positioning control for both images and QR codes

### 🎭 Template System
- ✅ Built-in ID card templates
- ✅ Custom background upload
- ✅ Portrait and Landscape orientation toggle
- ✅ Customizable canvas size

### 🛠️ Canvas Builder
- ✅ Live preview with drag-and-drop
- ✅ Grid lines with snap-to-grid option
- ✅ Element duplication
- ✅ Layer management
- ✅ Background color customization

### 💾 Export & Print Options
- ✅ Export as PNG (high quality)
- ✅ Export as JPG
- ✅ Export as PDF
- ✅ Print directly from browser
- ✅ Save/Load project files
- ✅ Batch-ready design

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

## 📖 Usage Guide

### Adding Elements

#### Text Fields
1. **Predefined Fields**: Click any predefined field button (Name, Employee ID, etc.)
2. **Custom Fields**: 
   - Enter label and value in the "Add Custom Field" section
   - Click "Add Text Field"

#### Images
1. Click "Add Image" button
2. Select the image element from the Layers panel
3. Upload image via the Property Panel or enter a URL

#### QR Codes
1. Click "Add QR Code" button
2. Select the QR element
3. Edit the data/URL in the Property Panel

### Customizing Elements

1. **Select** an element by clicking it on the canvas or in the Layers panel
2. **Edit properties** in the right Property Panel:
   - Position (X/Y coordinates)
   - Text properties (font, size, weight, color, alignment)
   - Image properties (size, border radius)
   - QR code size and data
   - Layer order (z-index)

### Positioning Elements

- **Drag and Drop**: Click and drag elements on the canvas
- **Manual Input**: Enter precise X/Y coordinates in Property Panel
- **Grid Snapping**: Enable "Snap to Grid" in Canvas Settings for aligned positioning

### Canvas Settings

- **Background Color**: Choose a solid background color
- **Background Image**: Upload a custom template background
- **Show Grid**: Toggle grid lines for easier alignment
- **Snap to Grid**: Enable automatic grid snapping
- **Orientation**: Switch between Landscape and Portrait

### Exporting

#### Export as Image
1. Click the "Export" dropdown in the toolbar
2. Choose PNG or JPG format
3. Image will download automatically

#### Export as PDF
1. Click "Export" → "Export as PDF"
2. PDF will be generated and downloaded

#### Print
1. Click the "Print" button
2. Browser print dialog will open
3. Configure print settings and print

### Project Management

#### Save Project
1. Click "Save" in the toolbar
2. JSON file will download with all your design data

#### Load Project
1. Click "Load" in the toolbar
2. Select a previously saved JSON file
3. Your design will be restored

## 🎯 Keyboard Shortcuts

- **Click element**: Select
- **Click canvas**: Deselect
- **Drag element**: Move position

## 🏗️ Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── Canvas.jsx          # Main canvas with drag-drop
│   │   ├── Sidebar.jsx         # Left panel for adding elements
│   │   ├── PropertyPanel.jsx   # Right panel for editing
│   │   ├── Toolbar.jsx         # Top toolbar with actions
│   │   └── TemplateSelector.jsx # Template selection
│   ├── store/
│   │   └── useCardStore.js     # Zustand state management
│   ├── App.jsx                 # Main app component
│   ├── main.jsx               # App entry point
│   └── index.css              # Global styles
├── package.json
└── vite.config.js
```

## 🔧 Tech Stack

- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **react-draggable** - Drag and drop functionality
- **qrcode.react** - QR code generation
- **html2canvas** - Canvas to image conversion
- **jsPDF** - PDF generation
- **lucide-react** - Icons

## 🎨 Customization Tips

### Creating Professional ID Cards

1. **Start with a template**: Upload a background image
2. **Add essential fields**: Name, ID, Photo, Department
3. **Use consistent fonts**: Stick to 2-3 font families
4. **Align elements**: Use grid snapping for perfect alignment
5. **Add QR code**: Include employee data or company URL
6. **Test print**: Always preview before mass printing

### Color Schemes

- **Corporate**: Blue (#0066CC), White (#FFFFFF), Dark Gray (#333333)
- **Modern**: Purple (#7C3AED), Teal (#14B8A6), Black (#000000)
- **Professional**: Navy (#1E3A8A), Gold (#F59E0B), White (#FFFFFF)

## 🐛 Troubleshooting

### Elements not dragging
- Make sure the element is selected (blue dashed border)
- Check if grid snapping is interfering with movement

### Export not working
- Ensure all images are loaded
- Try a different export format
- Check browser console for errors

### Images not displaying
- Verify image URL is accessible
- Try uploading image as base64
- Check file format (JPG, PNG supported)

## 📝 Future Enhancements

- [ ] Batch export for multiple employees
- [ ] Database integration
- [ ] More built-in templates
- [ ] Advanced image editing (crop, rotate, filters)
- [ ] Custom shapes and borders
- [ ] Undo/Redo functionality
- [ ] Keyboard shortcuts
- [ ] Collaborative editing

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

Built with ❤️ using React + Vite + Tailwind CSS
