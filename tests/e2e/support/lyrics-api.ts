export type JsonResponse = Record<string, unknown> | boolean;

export type FulfillResponse = {
  fulfill: {
    status: number;
    contentType: string;
    body: string;
  };
};

export type ApiResponse = JsonResponse | FulfillResponse;

export function okJson<T extends JsonResponse>(value: T): T {
  return value;
}

export function errorJson(status: number, body: Record<string, unknown>): FulfillResponse {
  return {
    fulfill: {
      status,
      contentType: 'application/json',
      body: JSON.stringify(body)
    }
  };
}
