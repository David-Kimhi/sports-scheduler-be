// Augments express.Request with fields added by middleware
declare namespace Express {
  interface Request {
    /** Parsed + validated query/body from the `validate()` middleware */
    validated?: Record<string, any>;
    /** Request ID attached by the requestLogger middleware */
    requestId?: string;
  }
}
