interface TestCase {
    ok(value: any, msg: string): void
    notOk(value: any, msg: string): void
    equal(actual: any, expected: any, msg: string): void
    notThrow(fn: Function, msg: string): void
}
type test = (msg: string, cb: (t: TestCase) => void) => void

export function GasTap(): test