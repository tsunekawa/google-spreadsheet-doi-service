interface TestCase {
    ok(value: any, msg: string): void
    notOk(value: any, msg: string): void
    equal(actual: any, expected: any, msg: string): void
    notThrow(fn: Function, msg: string): void
}

declare interface TestInterface {
    (msg: string, cb: (t: TestCase) => void): void
    finish(): void
    end(): void
    totalFailed(): number
    totalSucceed(): number
    totalSkipped(): number
}

export declare function GasTap(): TestInterface