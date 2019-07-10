export type WithId<T> = T & { id: string };

export type Task = {
  label: string;
};

export type List = {
  label: string;
  items: string[]; // taskId
};
