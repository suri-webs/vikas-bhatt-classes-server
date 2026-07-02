import { EnquiryController } from "./enquiry.controller";

describe("EnquiryController", () => {
    let controller: EnquiryController;

    beforeEach(() => {
        controller = new EnquiryController();
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
