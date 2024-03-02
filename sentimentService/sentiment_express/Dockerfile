# ---- Base Node ----
FROM node:alpine AS base
# install node
RUN apk add --no-cache nodejs npm

WORKDIR /app
COPY package*.json ./
COPY db_client.js ./

# ---- Dependencies ----
FROM base AS dependencies
# install node packages
RUN npm set progress=false && npm config set depth 0
RUN npm install --only=production 
# copy production node_modules aside
RUN cp -R node_modules prod_node_modules
# install ALL node_modules, including 'devDependencies'
RUN npm install

# ---- Test ----
# run linters, setup and tests
FROM dependencies AS test
COPY . .
RUN  npm run test

# ---- Release ----
FROM base AS release
# copy production node_modules
COPY --from=dependencies /app/prod_node_modules ./node_modules
# copy app sources
COPY . .
# expose port and define CMD
EXPOSE 5001
CMD npm run start