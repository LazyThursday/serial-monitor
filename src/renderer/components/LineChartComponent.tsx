import asSerialEvent, { SerialEvent } from 'config/SerialType';
import { useEffect, useState, useMemo, FC } from 'react';
import { LineChart, Line, XAxis, YAxis } from 'recharts';

type UserPref = {
  min: number | null;
  max: number | null;
  range: number | null;
};
interface Props {
  title: string;
}

const LineChartComponent: FC<Props> = ({ title }) => {
  const [data, setData] = useState<{ value: number; time: number }[]>([]);
  const [pref, setPref] = useState<UserPref>({
    min: null,
    max: null,
    range: 100,
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
    const onlyData: number[] = chartData.map((datum) => datum.value);
    const min = pref.min !== null ? pref.min : Math.min(...onlyData);
    const max =
      pref.max !== null && !(pref.max <= min)
        ? pref.max
        : Math.max(...onlyData);
    return { min, max };
  }, [chartData, pref.max, pref.min]);

  return (
    <div className="chart-container">
      <h1>{title}</h1>
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

export default LineChartComponent;
