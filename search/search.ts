import * as Fuse from "fuse.js";

interface Drug {
    id: number;
    tradename: string;
    activeingredient: string;
    price: string;
    company: string;
    group: string;
    pamphlet: string;
    dosage: string;
    composition: string;
}

let drugs: Drug[] = [];

//main worker messanger
onmessage = function (e) {
    //get drugs and store it in worker object so can increase performance
    if (e.data.drugs && e.data.drugs.length) {
        drugs = e.data.drugs
    }

    //get term and search exactly with that term according to searchBy key
    if (e.data.key && e.data.term && e.data.type === "exact") {
        let workerResult = doSearch(drugs, e.data.key, e.data.term)
        postMessage(workerResult);
    }

    //get term and search approximatly with that term according to searchBy key
    if (e.data.term && e.data.term && e.data.type === "approximate") {
        let workerResult = doApproximate(drugs, e.data.key, e.data.term)
        postMessage(workerResult);
    }
}

//approxiamting function
const doApproximate = (drugs: Drug[], key: any, term: string) => {
    const options: Fuse.FuseOptions<Drug> = {
        shouldSort: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: [key]
    };
    const fuse = new Fuse(drugs, options);
    return fuse.search(term)
}

//exact search function
function doSearch(drugs: Drug[], key: any, term: string) {
    return drugs.filter((drug:any) => {
        switch (key) {
            //this case search with price exactly like input
            case "price":
                return Number(drug.price) === Number(term);
            case key:
                return (
                    drug[key]
                        .toLowerCase()
                        .indexOf(term.toLowerCase()) > -1
                );
            default:
                return (
                    drug["tradename"].toLowerCase().indexOf(term.toLowerCase()) >
                    -1
                );
        }
    })
}