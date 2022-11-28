import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect, useRef, useMemo } from 'react';
import UtilityBar from './components/UtilityBar';
import 'react-dropdown/style.css';
import LineChartComponent from './components/LineChartComponent';
import './App.css';

type SerialEvent = {
  title: string;
  value: string;
  chartType: string;
};

function MainPage() {
  const [titles, setTitles] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.electron.ipcRenderer.on('serialport', (datum: SerialEvent) => {
      if (!isOpen) {
        setIsOpen(true);
      }
      const currentTitle = datum.title;
      setTitles((prev) => {
        if (prev.includes(currentTitle)) {
          return prev;
        }
        return [...prev, currentTitle];
      });
    });
  }, [isOpen, titles]);

  return (
    <div className="chartsGroup-container">
      <UtilityBar isOpen={isOpen} setIsOpen={setIsOpen} />
      {titles.map((title) => {
        return <LineChartComponent title={title} key={title} />;
      })}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
      </Routes>
    </Router>
  );
}
