declare module "@paypal/checkout-server-sdk" {
  namespace core {
    class SandboxEnvironment {
      constructor(clientId: string, clientSecret: string);
    }
    class LiveEnvironment {
      constructor(clientId: string, clientSecret: string);
    }
    class PayPalHttpClient {
      constructor(env: SandboxEnvironment | LiveEnvironment);
      execute<T>(request: unknown): Promise<{ result: T }>;
    }
  }

  namespace orders {
    class OrdersCreateRequest {
      prefer(value: string): void;
      requestBody(body: Record<string, unknown>): void;
    }
    class OrdersCaptureRequest {
      constructor(orderId: string);
      requestBody(body: Record<string, unknown>): void;
    }
  }
}
