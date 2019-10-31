/// <reference path="./lib/_index.ts" />

request.get<string>('hello', (result: string | null) => console.log(result));
