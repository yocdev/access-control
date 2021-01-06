export declare type AccessPassResults = {
    [accessPassKey: string]: boolean;
};
export declare abstract class CheckResultHandler<Request, Response> {
    protected isAsync: boolean;
    setAsync(isAsync: boolean): void;
    abstract handle(request: Request, response: Response, accessPassResults: AccessPassResults): Promise<boolean> | boolean;
}
