export interface ApiError {
  message: string
  code?: string
  statusCode: number
  details?: Record<string, string[]>
}

export interface ApiSuccessResponse<T> {
  data: T
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
