import React, { useState } from 'react';

const Inputs = () => {
  const [example, setExample] = useState<number>(0);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    if (Number.isNaN(Number(value))) return;
    setExample(Number(value));

    window.electron.ipcRenderer.sendMessage('sendSerial', {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      title: 'exp',
      value: Number(value),
    });
  };
  return (
    <div className="chart-container">
      <label htmlFor="example">
        exp:
        <input
          type="text"
          title="example"
          id="example"
          value={example ?? ''}
          onChange={handleInputChange}
        />
      </label>
      <label htmlFor="example">
        exp:
        <input
          type="range"
          title="example-2"
          id="example-2"
          value={example ?? ''}
          onChange={handleInputChange}
        />
      </label>
    </div>
  );
};

export default Inputs;
