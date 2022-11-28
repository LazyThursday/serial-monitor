import { SerialPort, ReadlineParser } from 'serialport';
import { BrowserWindow, ipcMain } from 'electron';
import ChartType from '../config/ChartType';

const delimiter = '#';

function parseData(data: string) {
  if (data.includes(delimiter)) {
    const [title, value, chartType] = data.split(delimiter);
    return { title, value, chartType };
  }
  return { title: 'default', value: data, chartType: ChartType.Raw };
}

export default function handleSerialPort(window: BrowserWindow) {
  ipcMain.on('scanSerial', async (event, arg) => {
    const results = await SerialPort.list();
    console.log(results);
    event.reply('scanSerial', results);
  });

  ipcMain.on(
    'serialportOpen',
    async (event, arg: { comPort: string; baudRate: number }) => {
      const serialport = new SerialPort({
        path: arg.comPort,
        baudRate: arg.baudRate,
      });

      const parser = new ReadlineParser();
      serialport.pipe(parser);
      parser.on('data', (data: string) => {
        window?.webContents.send('serialport', parseData(data));
      });

      console.log('serialport opened');

      ipcMain.once('serialportClose', (_event, _args) => {
        serialport.removeAllListeners();
        try {
          serialport.close();
        } catch (error) {
          console.log(error);
        }
        console.log('serialport closed');
      });
    }
  );
}
