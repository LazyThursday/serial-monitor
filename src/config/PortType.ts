export type ComPortInfo = {
  friendlyName?: string;
  locationId?: string;
  manufacturer?: string;
  path: string;
  pnpId?: string;
  productId?: string;
  serialNumber?: string;
  vendorId?: string;
};

function asComPortInfoArray(data: unknown): ComPortInfo[] {
  if (!Array.isArray(data)) throw new Error('Expected array');
  return data.map((datum) => {
    if (typeof datum === 'object' && datum !== null) {
      const {
        friendlyName,
        locationId,
        manufacturer,
        path,
        pnpId,
        productId,
        serialNumber,
        vendorId,
      } = datum as ComPortInfo;
      if (
        (typeof path === 'string' && typeof friendlyName === 'string') ||
        typeof locationId === 'string' ||
        typeof manufacturer === 'string' ||
        typeof pnpId === 'string' ||
        typeof productId === 'string' ||
        typeof serialNumber === 'string' ||
        typeof vendorId === 'string'
      ) {
        return {
          friendlyName,
          locationId,
          manufacturer,
          path,
          pnpId,
          productId,
          serialNumber,
          vendorId,
        };
      }
    }
    throw new Error("Data doesn't match the expected type");
  });
}

export default asComPortInfoArray;
