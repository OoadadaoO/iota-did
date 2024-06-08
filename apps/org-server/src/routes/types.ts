import type express from "express";

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

export type TypedResponse<T> = Omit<express.Response, "json" | "status"> & {
  json(data: T): TypedResponse<T>;
} & { status(code: number): TypedResponse<T> };
