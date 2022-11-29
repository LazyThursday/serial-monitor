import React, { useState, useEffect } from 'react';

type SerialEvent = {
  title: string;
  value: string;
  chartType: string;
};

const RawSerial = () => {
  const [data, setData] = useState<{ value: string; time: number }[]>([]);

  useEffect(() => {
    const removeListener = window.electron.ipcRenderer.on(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      'serialport',
      (datum: SerialEvent) => {
        if (datum.title === 'default') {
          setData((prev) => [
            ...prev,
            { value: datum.value, time: Date.now() },
          ]);
        }
      }
    );

    return () => {
      if (removeListener) removeListener();
    };
  }, []);
  return (
    <div className="rawSerialWrapper">
      <h2>Default Serial</h2>
      <div className="rawSerial">
        {data.map((datum) => (
          <p key={datum.time}>{datum.value}</p>
        ))}
      </div>
    </div>
  );
};

export default RawSerial;
