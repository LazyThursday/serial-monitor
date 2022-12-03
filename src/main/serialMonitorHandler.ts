import { SerialPort, ReadlineParser } from 'serialport';
import { BrowserWindow, ipcMain } from 'electron';

const delimiter = '#';

function parseData(data: string) {
  if (data.includes(delimiter)) {
    const [title, value] = data.split(delimiter);
    return { title, value };
  }
  return { title: 'default', value: data };
}

export default function handleSerialPort(window: BrowserWindow) {
  ipcMain.on('scanSerial', async (event) => {
    const results = await SerialPort.list();
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
      const parserRef = parser.on('data', (data: string) => {
        const parsedData = parseData(data);
        window?.webContents.send('serialport', parsedData);
      });

      console.log('serialport opened');

      ipcMain.once('serialportClose', () => {
        serialport.removeAllListeners();
        parserRef.removeAllListeners();
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
