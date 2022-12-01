import asSerialEvent, { SerialEvent } from 'config/SerialType';
import React, { useState, useEffect } from 'react';

const RawSerial = () => {
  const [data, setData] = useState<{ value: string; time: number }[]>([]);

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
