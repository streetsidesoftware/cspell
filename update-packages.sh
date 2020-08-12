
# Update all the dependencies in the packages and rebuild.

npx lerna exec "npm update -S && rm -rf node_modules package-lock.json"
npx lerna bootstrap
npm i && npm test
