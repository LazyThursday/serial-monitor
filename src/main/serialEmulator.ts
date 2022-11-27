import { SerialPort, ReadlineParser } from 'serialport';
import { MockBinding } from '@serialport/binding-mock';
import { SerialPortStream } from '@serialport/stream';
import { BrowserWindow } from 'electron';
import ChartType from 'config/ChartType';

const delimiter = '#';

function emulateData(range: number, title: string, chartType: string) {}

function emulateSerial(window: BrowserWindow, portName: string) {
  MockBinding.createPort(portName, { echo: true, record: true });

  const mockPort = new SerialPortStream({
    binding: MockBinding,
    path: portName,
    baudRate: 14400,
  });

  const parser = new ReadlineParser();
  mockPort.pipe(parser);
  parser.on('data', (data) => {
    window?.webContents.send('serialport', data);
  });

  mockPort.on('open', () => {
    setInterval(() => {
      const randomNumber = Math.floor(Math.random() * 100);
      mockPort.port?.emitData(`${randomNumber}\n`);
    }, 10);
  });
}

export default emulateSerial;