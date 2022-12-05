import React, { useState } from 'react';
import Dropdown from 'react-dropdown';
import { FaTrashAlt } from 'react-icons/fa';

type Controllers = {
  [key: string]: { value: string; isNumber: boolean; type: string };
};

const Inputs = () => {
  const [controllers, setControllers] = useState<Controllers>({});
  const [newController, setNewController] = useState<{
    title: string;
    isNumber: boolean;
    type: string;
  }>({ title: '', isNumber: false, type: '' });

  const options = ['text', 'range', 'button'];

  const handleAddController = () => {
    if (newController === undefined || newController.title.length !== 3) return;
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
    if (controllers[id].isNumber && Number.isNaN(Number(value))) return;
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
          value={newController?.title}
          onChange={(e) => {
            const { value } = e.target;
            if (value.length > 3) return;
            setNewController((prev) => {
              return { ...prev, title: value };
            });
          }}
        />
        <Dropdown
          options={options}
          value="choose a type.."
          onChange={(e) => {
            setNewController((prev) => {
              if (prev === undefined) return prev;
              return { ...prev, type: e.value, isNumber: e.value === 'range' };
            });
          }}
        />
        <button type="button" title="add" onClick={handleAddController}>
          Add
        </button>
      </div>
      <div className="controllers-container">
        {Object.keys(controllers).map((controllerKey) => {
          const controller = controllers[controllerKey];
          return (
            <div key={controllerKey} className="controller">
              <label htmlFor={controllerKey}>{controllerKey}</label>
              <input
                id={controllerKey}
                type={controller.type}
                value={controller.value}
                onChange={handleInputChange}
              />
              <button
                className="delete-button"
                type="button"
                title="delete"
                onClick={() => {
                  setControllers((prev) => {
                    const newControllers = { ...prev };
                    delete newControllers[controllerKey];
                    return newControllers;
                  });
                }}
              >
                <FaTrashAlt size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Inputs;
