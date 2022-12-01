import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect, useRef, useMemo } from 'react';
import UtilityBar from './components/UtilityBar';
import 'react-dropdown/style.css';
import LineChartComponent from './components/LineChartComponent';
import RawSerial from './components/RawSerial';
import './App.css';

type SerialEvent = {
  title: string;
  value: string;
};

function MainPage() {
  const [titles, setTitles] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const removeListener = window.electron.ipcRenderer.on(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      'serialport',
      (datum: SerialEvent) => {
        if (!isOpen) {
          setIsOpen(true);
        }
        const currentTitle = datum.title;

        // TODO: check outside of useState.
        setTitles((prev) => {
          if (currentTitle === 'default' || prev.includes(currentTitle)) {
            return prev;
          }
          return [...prev, currentTitle];
        });
      }
    );

    return () => {
      if (removeListener) removeListener();
    };
  }, [isOpen, titles]);

  return (
    <div className="chartsGroup-container">
      <UtilityBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <RawSerial />
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
