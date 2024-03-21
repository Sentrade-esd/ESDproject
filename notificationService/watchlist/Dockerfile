# # app1/Dockerfile
# FROM node:14

# WORKDIR /usr/src/app
# COPY package*.json ./
# RUN npm install
# COPY . .

# EXPOSE 8080
# CMD ["npm", "start"]


# ---- Base Node ----
FROM node:alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./

# ---- Dependencies ----
FROM base AS dependencies
RUN npm install
# copy production node_modules aside
RUN cp -R node_modules prod_node_modules
# install ALL node_modules, including 'devDependencies'
RUN npm install

# ---- Test ----
# run linters, setup and tests
FROM dependencies AS test
COPY . .
# Here you can run your tests, for example:
# RUN  npm run test

# ---- Develop ----
FROM dependencies AS develop
COPY . .
CMD ["npm", "start"]

# ---- Release ----
FROM base AS release
# copy production node_modules
COPY --from=dependencies /usr/src/app/prod_node_modules ./node_modules
# copy app sources
COPY . .
# expose port and define CMD
EXPOSE 3000
CMD ["npm", "start"]