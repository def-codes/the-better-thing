export const STATUS = {
  OK: { status: 200, message: "OK" },
  BAD_REQUEST: { status: 400, message: "Bad request" },
  UNAUTHORIZED: { status: 403, message: "Not authorized" },
  NOT_FOUND: { status: 404, message: "Not found" },
  METHOD_NOT_ALLOWED: { status: 406, message: "Method not allowed" },
  INTERNAL_SERVER_ERROR: { status: 500, message: "Internal server error" },
};
