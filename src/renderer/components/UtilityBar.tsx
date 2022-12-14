import React, { useState, useMemo, FC, useEffect } from 'react';
import Dropdown from 'react-dropdown';
import { VscDebugStop, VscDebugStart } from 'react-icons/vsc';
import asComPortInfoArray, { ComPortInfo } from '../../config/PortType';

interface Props {
  isOpen: boolean;
  setIsOpen: (value: React.SetStateAction<boolean>) => void;
}

const UtilityBar: FC<Props> = ({ isOpen, setIsOpen }) => {
  const [ports, setPorts] = useState<ComPortInfo[]>([]);
  const [selectedPort, setSelectedPort] = useState<string | null>(null);

  const options = useMemo(() => {
    return ports.map((port) => {
      return {
        value: port.path,
        label: port.path,
      };
    });
  }, [ports]);

  function handlePortScan() {
    if (!window?.electron?.ipcRenderer) return;
    setSelectedPort(null);
    window.electron.ipcRenderer.once('scanSerial', (unknownArg: unknown) => {
      let arg: ComPortInfo[];
      try {
        arg = asComPortInfoArray(unknownArg);
      } catch (error) {
        console.log(error);
        return;
      }
      setPorts(arg);
    });
    window.electron.ipcRenderer.sendMessage('scanSerial', ['scan']);
  }

  useEffect(() => {
    handlePortScan();
  }, []);

  function handlePortStart() {
    if (selectedPort == null) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.electron.ipcRenderer.sendMessage('serialportOpen', {
      comPort: selectedPort,
      baudRate: 9600,
    });
  }

  function handlePortStop() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.electron.ipcRenderer.sendMessage('serialportClose');
    setTimeout(() => {
      setIsOpen(false);
    }, 500);
  }

  function handlePortChange(value: string) {
    setSelectedPort(value);
  }

  return (
    <div className="utilityBar">
      <button type="button" onClick={handlePortScan}>
        Scan
      </button>
      <Dropdown
        className="dropdown"
        options={options}
        onChange={(e) => handlePortChange(e.value)}
        value={selectedPort ?? 'Select a port'}
        placeholder="Select an option"
      />
      {isOpen ? (
        <button type="button" title="stop" onClick={handlePortStop}>
          <VscDebugStop />
        </button>
      ) : (
        <button type="button" title="start" onClick={handlePortStart}>
          <VscDebugStart />
        </button>
      )}
    </div>
  );
};

export default UtilityBar;
