export function createSuccessResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify({
    success: true,
    data,
    timestamp: new Date().toISOString()
  }), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function createErrorResponse(message: string, status = 500, details?: any): Response {
  return new Response(JSON.stringify({
    success: false,
    error: {
      message,
      details,
      timestamp: new Date().toISOString()
    }
  }), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}