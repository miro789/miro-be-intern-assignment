export interface ApiResponse<T> {
    data: T[];
    pagination: {
        limit: number;
        offset: number;
        total: number;
    };
    message?: string;
    statusCode: number;
}

export function createApiResponse<T>(
    items: T[],
    limit: number,
    offset: number,
    total: number,
    message?: string,
    statusCode: number = 200
): ApiResponse<T> {
    return {
        data: items,
        pagination: {
            limit,
            offset,
            total
        },
        message,
        statusCode
    };
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    limit: number;
    offset: number;
    message?: string;
}
