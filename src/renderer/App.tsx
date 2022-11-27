import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import LineChartComponent from './components/LineChartComponent';
import './App.css';

type SerialEvent = {
  title: string;
  value: string;
  chartType: string;
};

function MainPage() {
  const [titles, setTitles] = useState<string[]>([]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.electron.ipcRenderer.on('serialport', (datum: SerialEvent) => {
      const currentTitle = datum.title;
      setTitles((prev) => {
        if (prev.includes(currentTitle)) {
          return prev;
        }
        return [...prev, currentTitle];
      });
    });
  }, [titles]);

  return (
    <div>
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
