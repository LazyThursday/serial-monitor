import React, { useState, useEffect } from 'react';
import { RxCross2 } from 'react-icons/rx';
import asSerialEvent, { SerialEvent } from '../../config/SerialType';

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
    <div className="chart-container rawSerialWrapper">
      <div className="heading">
        <h1>Default Serial</h1>
        <button
          type="button"
          title="clear all"
          onClick={() => {
            setData([]);
          }}
        >
          Clear all
        </button>
      </div>
      <div className="rawSerial">
        {data.map((datum) => (
          <p key={datum.time}>{datum.value}</p>
        ))}
      </div>
    </div>
  );
};

export default RawSerial;
