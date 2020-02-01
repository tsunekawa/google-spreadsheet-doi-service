import { Crossref } from "../crossref"

function UnitTestDoiFunctions(): void {
    
    let test = new GasTap()

    let doiList = [
        {
            input: "https://doi.org/10.7191/jeslib.2014.1060",
            doiName: "10.7191/jeslib.2014.1060",
            url: "https://doi.org/10.7191/jeslib.2014.1060"
        }
    ]

    test('extractIdentifier', function (t){
        let extractIdentifier = Crossref.extractIdentifier

        doiList.forEach( (doi: {input:string, doiName:string, url:string}) => {
            t.equal(extractIdentifier(doi.input), doi.doiName, "DOI Name of " + doi.input + " is " + doi.doiName)
        })
    })

    test.end()
}