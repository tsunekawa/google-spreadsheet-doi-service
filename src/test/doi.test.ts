import { Crossref } from "../crossref";

declare interface TestCase {
  ok(value: any, msg: string): void
  notOk(value: any, msg: string): void
  equal(actual: any, expected: any, msg: string): void
  notThrow(fn: Function, msg: string): void
}
type test = (msg: string, cb: (t: TestCase) => void) => void
declare function GasTap(): test

function unitTestDOIClass() {
  let test = GasTap()
  const DOI = Crossref.DOI

  test("DOI#parse", (t) => {
    t.notThrow(() => {
      new DOI("10.7191", "jeslib.2014.1060")
    }, "DOI can create an instance")

    let doi = "https://doi.org/10.7191/jeslib.2014.1060"
    let parsed = DOI.parse(doi)
    t.equal(parsed.prefix, "10.7191", "prefix of " + doi + " is 10.7191")
    t.equal(parsed.suffix, "jeslib.2014.1060", "suffix of " + doi + " is jeslib.2014.1060")
    t.equal(parsed.toString(), "10.7191/jeslib.2014.1060", "DOI Name of " + doi + " is 10.7191/jeslib.2014.1060")
  })

}
