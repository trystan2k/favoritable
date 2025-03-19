TODO:

- Move routes to a routes files (<https://hono.dev/docs/guides/best-practices#building-a-larger-application>)
- Handle routes errors (add decorator)
- Investigate and add etag if it worth it
- Add notFound handler
- Setup headers (like Accept, Content-Type, etc)
- Add versioning using headers
- Add schema validation (Zod) - <https://chat.qwen.ai/c/3a138e54-fc97-466a-89c3-e61e14cffcb3>
- Add response mapper (DTO to Model)
- Add Open API docs (Swagger) (<https://github.com/honojs/middleware/issues/735>)
- Add logging system/middleware
- Add endpoint to backup/export bookmarks
- Add tests
- Use AI to suggeest labels when adding a bookmark

INVESTIGATE:

- Create nested routes (<https://github.com/honojs/examples/blob/main/basic/src/index.ts>)
- Stream <https://kumneger.dev/blog/server-sent-events-explained> <https://yanael.io/articles/hono-sse/>

DONE:

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
