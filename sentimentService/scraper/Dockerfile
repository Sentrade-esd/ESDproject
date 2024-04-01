# ---- Base Node ----
FROM node:18-slim AS base
WORKDIR /app
COPY package*.json ./

# ---- Dependencies ----
FROM base AS dependencies
RUN npm set progress=false && npm config set depth 0
RUN npm install --only=production 
RUN cp -R node_modules prod_node_modules
RUN npm install


# ---- Copy Files/Build ----
FROM dependencies AS build
WORKDIR /app
COPY . /app

# # ---  chromium dependencies ----
# FROM base AS chromium
# RUN apt-get update && apt-get install -y chromium libatomic1


# ---- Release ----
FROM base AS release
RUN apt-get update 
RUN apt-get install -y libatomic1
RUN apt-get install -y chromium

COPY --from=dependencies /app/prod_node_modules ./node_modules
COPY --from=build /app . 
EXPOSE 5000
CMD ["node", "app.js"]