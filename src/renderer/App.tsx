import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';

const Hello = () => {
  useEffect(() => {
    function printSerial(_event: any, data: string) {
      console.log(data);
    }

    window.electron.ipcRenderer.on('serialport', (data) => {
      console.log(data);
    });
  }, []);

  return (
    <div>
      <h1>Hello</h1>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
