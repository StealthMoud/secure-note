declare module 'axios' {
    export interface AxiosResponse<T = any> {
        data: T; // The 'data' field will hold our response payload
    }
}