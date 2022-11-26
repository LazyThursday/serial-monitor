import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import './App.css';

type MyData = { time: number; value: number };
type UserPref = {
  min: number | null;
  max: number | null;
  range: number | null;
};

const Hello = () => {
  const [data, setData] = useState<MyData[]>([]);
  const [pref, setPref] = useState<UserPref>({
    min: null,
    max: null,
    range: 100,
  });

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.electron.ipcRenderer.on('serialport', (datum: string) => {
      setData((prev) => {
        const newData = parseFloat(datum);
        const newTime = Date.now();
        const newDataPoint = { time: newTime, value: newData };
        return [...prev, newDataPoint];
      });
    });
  }, []);

  function updatePref(newValue: number, prefToChange: string) {
    if (isNaN(newValue)) {
      newValue = null;
    }
    setPref((prev) => {
      return { ...prev, [prefToChange]: newValue };
    });
  }

  const chartData = useMemo(() => {
    const newArr = data.map((datum) => {
      const newTime = (Date.now() - datum.time) / 1000;

      return { time: newTime.toFixed(1), value: datum.value };
    });
    if (newArr.length > (pref.range ?? 100)) {
      return newArr.slice(
        newArr.length - (pref.range ?? 100),
        newArr.length - 1
      );
    }

    return newArr;
  }, [data, pref.range]);

  const domain = useMemo(() => {
    const onlyData = chartData.map((datum) => datum.value);
    const min = pref.min ? pref.min : Math.min(...onlyData);
    const max =
      pref.max && !(pref.max <= min) ? pref.max : Math.max(...onlyData);
    return { min, max };
  }, [chartData, pref.max, pref.min]);

  return (
    <div className="chart-container">
      <label htmlFor="min">
        min:
        <input
          placeholder="min"
          id="min"
          onChange={(e) =>
            updatePref(parseFloat(e.target.value), e.target.placeholder)
          }
        />
      </label>
      <label htmlFor="max">
        max:
        <input
          placeholder="max"
          id="max"
          onChange={(e) =>
            updatePref(parseFloat(e.target.value), e.target.placeholder)
          }
        />
      </label>
      <label htmlFor="range">
        range:
        <input
          placeholder="range"
          id="range"
          value={isNaN(pref.range) ? '' : pref.range}
          onChange={(e) =>
            updatePref(parseFloat(e.target.value), e.target.placeholder)
          }
        />
      </label>
      <LineChart width={1000} height={300} data={chartData}>
        <Line type="monotone" dataKey="value" stroke="#c2d5ff" />
        {/* <CartesianGrid stroke="#ccc" /> */}
        <XAxis dataKey="time" />
        <YAxis domain={[domain.min, domain.max]} />
      </LineChart>
      <h2>{data.length}</h2>
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
