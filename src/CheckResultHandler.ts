export type AccessPassResults = {
  [accessPassKey: string]: boolean
}

export interface CheckResultHandler<Request, Response> {
  isAsync: boolean

  handle(
    request: Request,
    response: Response,
    accessPassResults: AccessPassResults
  ): Promise<boolean> | boolean
}
