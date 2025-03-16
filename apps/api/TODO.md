TODO:

- Add endpoint to import Omnivore files
- Add endpoint to import from Chrome bookmarks (add folder name as label)
- Add endpoint to import from text file (one URL per line)
- Move routes to a routes folder
- Setup headers (like Accept, Content-Type, etc)
- Add versioning using headers
- Add schema validation (Zod) - <https://chat.qwen.ai/c/3a138e54-fc97-466a-89c3-e61e14cffcb3>
- Handle Controller errors (add decorator)
- Add response mapper (DTO to Model)
- Add Open API docs (Swagger)
- Add logging system/middleware
- Add endpoint to backup/export bookmarks
- Add tests
- Use AI to suggeest labels when adding a bookmark

DONE:

- Add Scrapper endpoint
- Add endpoint to delete multiple records at once
- Add endpoint to archieve bookmark
- Add endpoint to archieve multiple records at once
- Add endpoint to search by title, description (return list with the ones that matchs)
- Add endpoint to search/filter by label(s)
- Add endpoint to get all records (paginated)
- Handle redirect in scrapper (<https://marvinh.dev/blog/speeding-up-javascript-ecosystem>)
- Add endpoint to search/filter labels
