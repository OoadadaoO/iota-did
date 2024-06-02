export type Response<T> = {
  data: T;
  error?: never;
};

export type ErrorResponse = {
  data?: never;
  error: {
    code: number;
    message: string;
  };
};
