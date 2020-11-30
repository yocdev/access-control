export type AccessPassResults = {
  [accessPassKey: string]: boolean
}

export abstract class CheckResultHandler<Request, Response> {
  abstract handle(
    request: Request,
    response: Response,
    accessPassResults: AccessPassResults
  ): Promise<boolean>
}
