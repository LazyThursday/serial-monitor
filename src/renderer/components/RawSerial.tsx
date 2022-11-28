import React, { useState, useEffect } from 'react';

const RawSerial = () => {
  const [data, setData] = useState<{ value: string; time: number }[]>([]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.electron.ipcRenderer.on('serialport', (datum: SerialEvent) => {
      if (datum.title === 'default') {
        setData((prev) => [...prev, { value: datum.value, time: Date.now() }]);
      }
    });

    return () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.electron.ipcRenderer.removeListener('serialport');
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
