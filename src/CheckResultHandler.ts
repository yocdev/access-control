export type AccessPassResults = {
  [accessPassKey: string]: boolean
}

export abstract class CheckResultHandler<Request, Response> {
  protected isAsync = false

  setAsync(isAsync: boolean): void {
    this.isAsync = isAsync
  }

  abstract handle(
    request: Request,
    response: Response,
    accessPassResults: AccessPassResults
  ): Promise<boolean> | boolean
}
