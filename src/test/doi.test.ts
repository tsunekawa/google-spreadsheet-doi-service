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
  let doi = "https://doi.org/10.7191/jeslib.2014.1060"

  test("DOI#new", (t) => {
    t.notThrow(() => {
      new DOI("10.7191", "jeslib.2014.1060")
    }, "DOI can create an instance")
  })

  test("DOI#parse", (t) => {
    let parsed = DOI.parse(doi)
    t.equal(parsed.prefix, "10.7191", "prefix of " + doi + " is 10.7191")
    t.equal(parsed.suffix, "jeslib.2014.1060", "suffix of " + doi + " is jeslib.2014.1060")
  })

  test("DOI#toString", (t) => {
    let parsed = DOI.parse(doi)

    t.equal(parsed.toString(), "10.7191/jeslib.2014.1060", "DOI Name of " + doi + " is 10.7191/jeslib.2014.1060")
  })

  test("DOI#toURI", (t) => {
    let parsed = new DOI("10.7191", "jeslib.2014.1060")
    t.equal(parsed.toURI(), doi, "DOI URI of " + doi + "is " + doi)
  })

}
