import { SearchResult } from "../../usecase/search/models/search-online-results.js"

export function mapSearchResult(result: SearchResult) {
    let resultString = result.message
    if (result.citations.length > 0) {
        const citationsString = 'Citations: ' + result.citations.map((citation) => citation.title + " - *" + citation.uri + "*").join("\n")
        resultString += "\n\n" + citationsString
    }
    if (result.searchQueries.length > 0) {
        const searchQueriesString = 'Search Queries: ' + result.searchQueries.map((query) => "* " + query + "*").join("\n")
        resultString += "\n\n" + searchQueriesString
    }
    return resultString
}