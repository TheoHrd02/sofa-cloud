import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
    it("garde la dernière classe Tailwind en conflit (tailwind-merge)", () => {
        expect(cn("p-2", "p-4")).toBe("p-4");
    });

    it("ignore les valeurs fausses", () => {
        expect(cn("text-sm", false, undefined, "font-bold")).toBe("text-sm font-bold");
    });
});
