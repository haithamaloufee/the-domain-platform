import type { ApiProblem } from "@the-domain/types";

export class ApiError extends Error {
  public constructor(
    message: string,
    public readonly status: number,
    public readonly problem?: ApiProblem,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
