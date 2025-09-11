export class SuccessResponse extends Response {
  constructor(data: any, status = 200) {
    super(JSON.stringify({
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
}

export class ErrorResponse extends Response {
  constructor(message: string, status = 500, details?: any) {
    super(JSON.stringify({
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
}