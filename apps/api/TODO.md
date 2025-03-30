TODO:

- Repositories should return DTO, services should convert to Models

<https://claude.ai/chat/112379ce-136c-409b-8489-689273b3e77e>

A simple REST API:

GET: items/{id} - Returns a description of the item with the given id
PUT: items/{id} - Updates or Creates the item with the given id
DELETE: items/{id} - Deletes the item with the given id
Top-resource API:

GET: items?filter - Returns all item ids matching the filter
POST: items - Creates one or more items as described by the JSON payload
PATCH: items - Creates/Updates/Delete one or more items as described by the JSON payload

POST /bookmarks/batch-delete
PATCH /bookmarks/?delete - Delete
PATCH /bookmarks/ - Create/Update

- Review all Models/DTOs
- Add schema validation (Zod) - <https://chat.qwen.ai/c/3a138e54-fc97-466a-89c3-e61e14cffcb3>
- Add response mapper (DTO to Model)

- Add user to bookmarks and labels

- Review scrapper. Maybe use pupeeter or playwright (for pages like Temu and Twitter )
  - <https://brightdata.com/blog/how-tos/web-scraping-puppeteer>
  - <https://scrapfly.io/blog/web-scraping-with-puppeteer-and-nodejs/>
  - <https://www.zenrows.com/blog/puppeteer-web-scraping#prerequisites>

- Handle DB errors in Repository (decorator ?)
- Handle routes errors (add decorator)
- Review dependency injection (services and repositories)

- Investigate and add etag if it worth it
- Add notFound handler
- Setup headers (like Accept, Content-Type, etc)
- Add versioning using headers
- Add Open API docs (Swagger) (<https://github.com/honojs/middleware/issues/735>)
- Add logging system/middleware
- Add endpoint to backup/export bookmarks
- Add tests
- Use AI to suggeest labels when adding a bookmark

INVESTIGATE:

- URLs not scrapping correctly:
  - <https://x.com/midudev/status/1807775893135278345?s=09&t=RI5qICHzTKjUht1zGVeR1g> (380_400.json)

- Improvements: <https://medium.com/@mohantaankit2002/building-a-nest-js-api-that-can-handle-millions-of-requests-without-crashing-6212add27122>
- Biome: <https://blog.stackademic.com/biome-a-faster-unified-alternative-to-eslint-and-prettier-7767ed2637bd>
- Stream <https://kumneger.dev/blog/server-sent-events-explained> <https://yanael.io/articles/hono-sse/>

DONE:

- Create nested routes (<https://github.com/honojs/examples/blob/main/basic/src/index.ts>)
- Move routes to a routes files (<https://hono.dev/docs/guides/best-practices#building-a-larger-application>)
- Check if Firefox/Safari/Edge bookmarks are exported are similar to Chrome bookmarks
- Add endpoint to import from text file (one URL per line)
- Add random color for label when importing and creating labels from URL or importing
- Add endpoint to import from Chrome bookmarks (add folder name as label)
- Add endpoint to import Omnivore files
- Add Scrapper endpoint
- Add endpoint to delete multiple records at once
- Add endpoint to archieve bookmark
- Add endpoint to archieve multiple records at once
- Add endpoint to search by title, description (return list with the ones that matchs)
- Add endpoint to search/filter by label(s)
- Add endpoint to get all records (paginated)
- Handle redirect in scrapper (<https://marvinh.dev/blog/speeding-up-javascript-ecosystem>)
- Add endpoint to search/filter labels
