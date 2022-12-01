export type SerialEvent = {
  title: string;
  value: string;
};

function asSerialEvent(datum: unknown): SerialEvent {
  if (typeof datum === 'object' && datum !== null) {
    const { title, value } = datum as SerialEvent;
    if (typeof title === 'string' && typeof value === 'string') {
      return { title, value };
    }
  }
  throw new Error("Data doesn't match the expected type");
}

export default asSerialEvent;
