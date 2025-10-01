import { Client, isFullDatabase  } from "@notionhq/client"
import { config } from "dotenv"
import _ from "lodash"


config()

const pageId = process.env.NOTION_PAGE_ID
const apiKey = process.env.NOTION_API_KEY

const notion = new Client({ auth: apiKey })

/*
---------------------------------------------------------------------------
*/

/**
 * Resources:
 * - Create a database endpoint (notion.databases.create(): https://developers.notion.com/reference/create-a-database)
 * - Create a page endpoint (notion.pages.create(): https://developers.notion.com/reference/post-page)
 * - Working with databases guide: https://developers.notion.com/docs/working-with-databases
 * Query a database: https://developers.notion.com/reference/post-database-query
 * Filter database entries: https://developers.notion.com/reference/post-database-query-filter
 */


async function sorteioLivros(ids: number[], sorteios: number) {
  console.log("Sorteando livros...")
  const numeros = _.sampleSize(ids, sorteios);
  return numeros 
}
// async function queryDataSource2(dataSourceId) {
//   console.log("Querying database...")
//   // This query will filter database entries and return pages that have a "Last ordered"
//   // property that is more recent than 2022-12-31. Use multiple filters with the AND/OR
//   // options: https://developers.notion.com/reference/post-database-query-filter.
//   const booksNotRead = await notion.dataSources.query({
//     data_source_id: dataSourceId,
//     filter: {
//       property: "ID",
//       unique_id: {
//         equals: 2,
//       },
//     },
//   })
//   console.log(JSON.stringify(booksNotRead, null, 2))

// }
// function filterByID(obj, num) {
//   if ("properties" in obj) {
//     if( obj.properties['ID']['unique_id']['number'] in num) {
//       console.log("Achei o livro: ", JSON.stringify(obj, null, 2))
//       return obj
//     }
//   }
// }

async function queryLivrosNaoLidos(dataSourceId) {
  console.log("Querying database...")
  // This query will filter database entries and return pages that have a "Last ordered"
  // property that is more recent than 2022-12-31. Use multiple filters with the AND/OR
  // options: https://developers.notion.com/reference/post-database-query-filter.
  
  //Print filtered results
  
  try {
    await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        property: "Read Status",
        status: {
          equals: "Not started",
        },
      },
    }).then(async (res) => {

      const qtdadeLivros = res.results.reduce((qtdadeLivros, page) => {
      if ("properties" in page) {
        qtdadeLivros.push(page.properties['ID']['unique_id']['number'])        
      }
      return qtdadeLivros;
    }, []);

        
      console.log(`Quantidade de livros não lidos: ${res.results.length}`)
      const numeros =  await sorteioLivros(qtdadeLivros, 5)
      console.log("Números sorteados: ", numeros)


      const ids = res.results.reduce((ids, thing) => {
      if ("properties" in thing) {
        if(numeros.includes(thing.properties['ID']['unique_id']['number'])){
          ids.push(
            { "ID": thing.properties['ID']['unique_id']['number'],
              "Nome": thing.properties['Name']['title'][0]['text']['content'],
              "Pages": thing.properties['Pages']['number'],
             "Author": thing.properties['Author']['select']['name']
          })
        }
      }
      return ids;
    }, []);

      // return res.results.map(page => {
      //   if ("properties" in page) {
      //     return page.properties
      //   }
      // })
      console.log("Livros", ids)
      })


  } catch (error) {
    throw new Error(`Error querying database: ${error.message}`)
  } 
  
  
 
}



//  console.log("Achei o livro: ", JSON.stringify(res.results.map(page => page.properties['Name']['title'][0]['plain_text']), null, 2))
//         const qtdadeLivros =  res.results.length
//         console.log(`Quantidade de livros não lidos: ${qtdadeLivros}`)
 
//         const numerosSorteados = await sorteioLivros(qtdadeLivros)
//         console.log("Números sorteados: ", numerosSorteados)
//         const sorteados = await res.results.filter((page) => filterByID(page, numerosSorteados))
//         console.log("Livros sorteados: ", sorteados)
async function main() {
  // Create a new database
  const livrosdb = await notion.databases.retrieve({
    database_id: pageId,
    auth: apiKey,
  })

  if (!isFullDatabase(livrosdb)) {
    console.error(`No read permissions on database: ${livrosdb.id}`)
    return
  }

  // Print the new database's URL. Visit the URL in your browser to see the pages that get created in the next step.
  console.log(livrosdb.id)

  const dataSourceId = livrosdb.data_sources[0].id
  // If there is no ID (if there's an error), return.
  if (!dataSourceId) return

  // console.log("Adding new pages...")
  // for (let i = 0; i < propertiesForNewPages.length; i++) {
  //   // Add a few new pages to the database that was just created
  //   await addNotionPageToDataSource(dataSourceId, propertiesForNewPages[i])
  // }

  // After adding pages, query the database entries (pages)
 await queryLivrosNaoLidos(dataSourceId)
}

main()
