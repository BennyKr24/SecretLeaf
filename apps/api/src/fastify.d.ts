import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      sub?: string;
      username: string;
      role: "CONSUMER" | "PROVIDER";
    };
    user: {
      sub: string;
      username: string;
      role: "CONSUMER" | "PROVIDER";
    };
  }
}
