import { useEffect, useState, FC } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import asSerialEvent, { SerialEvent } from '../../config/SerialType';

type UserPref = {
  min: number | null;
  max: number | null;
  range: number | null;
  smooting: number | null;
};

type Datum = { value: number; time: number };
interface Props {
  title: string;
  isOpen: boolean;
}

const LineChartComponent: FC<Props> = ({ title, isOpen }) => {
  const [data, setData] = useState<Datum[]>([]);
  const [pref, setPref] = useState<UserPref>({
    min: null,
    max: null,
    range: 100,
    smooting: null,
  });

  useEffect(() => {
    const removeListener = window?.electron?.ipcRenderer?.on(
      'serialport',
      (unknownDatum: unknown) => {
        let datum: SerialEvent;
        try {
          datum = asSerialEvent(unknownDatum);
        } catch (error) {
          console.log(error);
          return;
        }
        if (datum.title === title) {
          setData((prev) => [
            ...prev,
            { value: Number(datum.value), time: Date.now() },
          ]);
        }
      }
    );

    return () => {
      if (removeListener) removeListener();
    };
  }, [title]);

  // Half solution for corrupt titles.
  if (data.length === 0) {
    return <div />;
  }

  function updatePref(newValue: number, prefToChange: string) {
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(newValue)) {
      setPref((prev) => {
        return { ...prev, [prefToChange]: null };
      });
      return;
    }
    setPref((prev) => {
      return { ...prev, [prefToChange]: newValue };
    });
  }

  function smoothing(arr: Datum[], smoothingFactor: number): Datum[] {
    const newData: Datum[] = [];
    for (
      let i = 0;
      i < arr.length - smoothingFactor - 1;
      i += smoothingFactor
    ) {
      const length =
        arr.length - i > smoothingFactor ? smoothingFactor : arr.length - i;
      const avg =
        arr
          .slice(i, i + length)
          .map((datum) => datum.value)
          .reduce((a, b) => a + b) /
          length +
        1;
      newData.push({ value: avg, time: arr[i].time });
    }
    return newData;
  }

  function handleDataToShow(): Datum[] {
    let newArr: Datum[] = data.map((datum) => {
      const newTime = (Date.now() - datum.time) / 1000;

      return { value: datum.value, time: Number(newTime.toFixed(1)) };
    });
    if (newArr.length > (pref.range ?? 100)) {
      newArr = newArr.slice(
        newArr.length - (pref.range ?? 100),
        newArr.length - 1
      );
    }
    if (!pref.smooting) return newArr;
    const smoothedData = smoothing(newArr, pref.smooting);

    return smoothedData;
  }

  const chartData = handleDataToShow();

  const onlyData: number[] = chartData.map((datum) => datum.value);
  const min = pref.min !== null ? pref.min : Math.floor(Math.min(...onlyData));
  const max =
    pref.max !== null && !(pref.max <= min)
      ? pref.max
      : Math.ceil(Math.max(...onlyData));

  const domain = { min, max };

  return (
    <div className="chart-container">
      <h1 className="title">{title}</h1>
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
          onChange={(e) =>
            updatePref(parseFloat(e.target.value), e.target.placeholder)
          }
        />
      </label>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart width={1000} height={300} data={chartData}>
          <Line type="monotone" dataKey="value" stroke="#02a499" />
          <XAxis dataKey="time" />
          <YAxis domain={[domain.min, domain.max]} />
          {!isOpen ? <Tooltip /> : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;
