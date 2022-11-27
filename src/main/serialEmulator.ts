import { SerialPort, ReadlineParser } from 'serialport';
import { MockBinding } from '@serialport/binding-mock';
import { SerialPortStream } from '@serialport/stream';
import { BrowserWindow } from 'electron';
import ChartType from '../config/ChartType';

const delimiter = '#';

function emulateData(range: number, title: string, chartType: string) {
  return `${title}${delimiter}${(Math.random() * range).toFixed(
    2
  )}${delimiter}${chartType}\n`;
}

function parseData(data: string) {
  if (data.includes(delimiter)) {
    const [title, value, chartType] = data.split(delimiter);
    return { title, value, chartType };
  }
  return { title: 'default', value: data, chartType: ChartType.Raw };
}

function emulateSerial(window: BrowserWindow, portName: string) {
  MockBinding.createPort(portName, { echo: true, record: true });

  const mockPort = new SerialPortStream({
    binding: MockBinding,
    path: portName,
    baudRate: 14400,
  });

  const parser = new ReadlineParser();
  mockPort.pipe(parser);
  parser.on('data', (data: string) => {
    window?.webContents.send('serialport', parseData(data));
  });

  mockPort.on('open', () => {
    setInterval(() => {
      mockPort.port?.emitData(emulateData(100, 'Random', ChartType.Line));
    }, 100);
    setInterval(() => {
      mockPort.port?.emitData(emulateData(1000, 'OtherRandom', ChartType.Line));
    }, 100);
  });
}

export default emulateSerial;
