import React from 'react';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import PropertyPanel from './components/PropertyPanel';
import TemplateSelector from './components/TemplateSelector';

const App = () => {
  return (
    <div className="h-screen flex flex-col">
      <Toolbar />
      <TemplateSelector />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <Canvas />
        <PropertyPanel />
      </div>
    </div>
  );
};

export default App;