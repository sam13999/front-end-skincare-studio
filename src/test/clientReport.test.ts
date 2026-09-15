import { describe, expect, it } from "vitest";
import { clientReportUrl } from "@/lib/api";

describe("client report endpoints", () => {
  it("uses the backend client artifact route and encodes the session id", () => {
    expect(clientReportUrl("session/with spaces", "pdf")).toBe(
      "https://skincoach-backend-production.up.railway.app/v1/session/session%2Fwith%20spaces/client/pdf",
    );
  });

  it("does not construct an admin download URL", () => {
    const url = clientReportUrl("0123456789abcdef0123456789abcdef", "html");
    expect(url).toContain("/client/html");
    expect(url).not.toContain("admin");
    expect(url).not.toContain("token");
  });
});
