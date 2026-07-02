import { HealthController } from "./health.controller";

describe("HealthController", () => {
    let controller: HealthController;

    beforeEach(() => {
        controller = new HealthController();
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
