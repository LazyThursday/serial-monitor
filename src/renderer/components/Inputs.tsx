import React, { useState } from 'react';
import Dropdown from 'react-dropdown';

type Controllers = {
  [key: string]: { value: string; isNumber: boolean; type: string };
};

const Inputs = () => {
  const [controllers, setControllers] = useState<Controllers>({});
  const [newController, setNewController] = useState<{
    title: string;
    isNumber: boolean;
    type: string;
  }>();

  const options = ['input', 'range', 'button'];

  const handleAddController = () => {
    if (newController === undefined) return;
    setControllers((prev: Controllers) => {
      return {
        ...prev,
        [newController.title]: {
          value: newController.isNumber ? '0' : '',
          isNumber: newController.isNumber,
          type: newController.type,
        },
      };
    });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    if (controllers.id.isNumber && Number.isNaN(Number(value))) return;
    setControllers((prev: Controllers) => {
      return {
        ...prev,
        [id]: { ...prev[id], value },
      };
    });

    window.electron.ipcRenderer.sendMessage('sendSerial', {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      title: id,
      value,
    });
  };
  return (
    <div className="chart-container inputs-container">
      <div className="add-container">
        <input
          title="New Title"
          name="title"
          onChange={(e) => {
            const { name, value } = e.target;
            setNewController((prev) => {
              if (prev === undefined) return prev;
              return { ...prev, [name]: value };
            });
          }}
        />
        <Dropdown
          options={options}
          value="input"
          onChange={(e) => {
            setNewController((prev) => {
              if (prev === undefined) return prev;
              return { ...prev, type: e.value };
            });
          }}
        />
        <button type="button" title="add" onClick={handleAddController}>
          Add
        </button>
      </div>
      {Object.keys(controllers).map((controllerKey) => {
        const controller = controllers[controllerKey];
        return (
          <div key={controllerKey}>
            <label htmlFor={controllerKey}>{controllerKey}</label>
            <input
              id={controllerKey}
              type={controller.type}
              value={controller.value}
              onChange={handleInputChange}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Inputs;
