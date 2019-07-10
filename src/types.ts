export type BusEvent<T extends object = any> = {
  type: string;
  payload: T;
  meta?: any;
};

export type EventFrom<T extends (...args: any) => BusEvent> = ReturnType<T>;
