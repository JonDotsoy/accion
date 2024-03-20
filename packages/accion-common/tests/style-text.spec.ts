import { test, expect } from "bun:test";
import { styleText, Style } from "../src/style-text";

test("should style a style", () => {
    const demo = (styles: Style | Style[]) =>
        expect(styleText(styles as any, "text")).toMatchSnapshot(
            `text ${new Intl.ListFormat("en-us").format(Array.isArray(styles) ? styles : [styles])}`,
        );

    demo("underline");
    demo(["underline", "bold", "red"]);
    demo(["red"]);
});
