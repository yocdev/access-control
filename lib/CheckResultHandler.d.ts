export declare type AccessPassResults = {
    [accessPassKey: string]: boolean;
};
export declare abstract class CheckResultHandler<Request, Response> {
    abstract handle(request: Request, response: Response, accessPassResults: AccessPassResults): Promise<boolean>;
}
