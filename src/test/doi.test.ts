import { GasTap } from "../lib/gas-tab-lib"
import { Crossref } from "../crossref";

function unitTestDOIClass() {
  let test = GasTap()
  const Doi = Crossref.Doi
  let doi = "https://doi.org/10.7191/jeslib.2014.1060"

  test("DOI#new", (t) => {
    t.notThrow(() => {
      new Doi("10.7191", "jeslib.2014.1060")
    }, "DOI can create an instance")
  })

  test("DOI#parse", (t) => {
    let parsed = DOI.parse(doi)
    t.equal(parsed.prefix, "10.7191", "prefix of " + doi + " is 10.7191")
    t.equal(parsed.suffix, "jeslib.2014.1060", "suffix of " + doi + " is jeslib.2014.1060")
  })

  test("DOI#equal", (t) => {
    let doi_a = new DOI("10.7191", "jeslib.2014.1060")
    let doi_b = new DOI("10.7191", "jeslib.2014.1060")
    let doi_c = new DOI("10.7191", "JESLIB.2014.1060")
    let doi_d = new DOI("10.7191", "jeslib.２０１４.1060")

    t.ok(doi_a.equal(doi_b), "When two DOI instances have same prefix and suffix, equeal method always return true")
    t.ok(doi_b.equal(doi_a), "When two DOI instances have same prefix and suffix, equeal method always return true")
    t.ok(doi_a.equal(doi_c), "DOI name is not case-sensitive")
    t.ok(doi_c.equal(doi_a), "DOI name is not case-sensitive")
    t.notOk(doi_a.equal(doi_d), "Half-width and Full-width characters in DOI Names should be distinguished")
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
