import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import asSerialEvent, { SerialEvent } from '../config/SerialType';
import UtilityBar from './components/UtilityBar';
import 'react-dropdown/style.css';
import LineChartComponent from './components/LineChartComponent';
import RawSerial from './components/RawSerial';
import Inputs from './components/Inputs';
import './App.css';

function MainPage() {
  const [titles, setTitles] = useState<string[]>([]);
  const [blockedTitles, setBlockedTitles] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const blockedTitlesRef = useRef(blockedTitles);

  useEffect(() => {
    const removeListener = window?.electron?.ipcRenderer?.on(
      'serialport',
      // TODO: add the type
      (unknownDatum: unknown) => {
        let datum: SerialEvent;
        try {
          datum = asSerialEvent(unknownDatum);
        } catch (error) {
          console.log(error);
          return;
        }
        if (!isOpen) {
          setIsOpen(true);
        }
        const currentTitle = datum.title;

        // TODO: check outside of useState.
        setTitles((prev) => {
          if (
            currentTitle === 'default' ||
            prev.includes(currentTitle) ||
            blockedTitlesRef.current.includes(currentTitle)
          ) {
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

  function removeTitle(title: string) {
    setBlockedTitles((prev) => [...prev, title]);
    blockedTitlesRef.current = [...blockedTitlesRef.current, title];
    setTitles((prev) => prev.filter((t) => t !== title));
  }

  return (
    <div>
      <UtilityBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="chartsGroup-container">
        <RawSerial />
        <Inputs />
        {titles.map((title) => {
          return (
            <LineChartComponent title={title} isOpen={isOpen} key={title} />
          );
        })}
      </div>
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
