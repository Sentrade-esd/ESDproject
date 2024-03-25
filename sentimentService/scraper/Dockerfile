# ---- Base Node ----
FROM node:18-buster-slim AS base
WORKDIR /app
COPY package*.json ./

# ---- Dependencies ----

# FROM base AS dependencies
# RUN apk --no-cache add ca-certificates wget  \
#     && wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub \
#     && wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.34-r0/glibc-2.34-r0.apk \
#     && apk add --force-overwrite glibc-2.34-r0.apk

# RUN npm set progress=false && npm config set depth 0
# RUN npm install --only=production 
# RUN cp -R node_modules prod_node_modules
# RUN npm install


# -----------------
# RUN apt-get update \
#     && apt-get install -y wget gnupg ca-certificates \
#     && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
#     && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list' \
#     && apt-get update \
#     && apt-get install -y google-chrome-stable \
#     && rm -rf /var/lib/apt/lists/*
  
# RUN npm set progress=false && npm config set depth 0
# RUN npm install --only=production 
# RUN cp -R node_modules prod_node_modules
# RUN npm install




# -----------------

FROM base AS dependencies
# RUN apk add --no-cache chromium
# RUN apt-get update && apt-get install gnupg wget -y && \
#     wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
#     sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
#     apt-get update && \
#     apt-get install chrome -y --no-install-recommends && \
#     rm -rf /var/lib/apt/lists/*
# RUN apt-get update && apt-get install -y chromium libnss3
# RUN npx puppeteer browsers install chrome
# RUN apt-get update && apt-get install -y libnss3
RUN npm set progress=false && npm config set depth 0
RUN npm install --only=production 
RUN cp -R node_modules prod_node_modules
RUN npm install

# ENV PUPPETEER_CACHE_FOLDER=/tmp/userData

# -----------------

# FROM base AS dependencies
# RUN apk add --no-cache \
#     ca-certificates \
#     curl \
#     wget \
#     g++ \
#     gcc \
#     libx11-dev \
#     libxkbfile-dev \
#     make \
#     nss \
#     freetype \
#     freetype-dev \
#     harfbuzz \
#     ca-certificates \
#     ttf-freefont \
#     chromium

# # Tell Puppeteer to skip installing Chrome because we're going to be running
# # "puppeteer-core" which doesn't include a bundled version of Chromium.
# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true 
# ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# RUN npm set progress=false && npm config set depth 0
# RUN npm install --only=production 
# RUN cp -R node_modules prod_node_modules
# RUN npm install

# ---- Copy Files/Build ----
FROM dependencies AS build
WORKDIR /app
COPY . /app

# ---- Release ----
FROM base AS release
COPY --from=dependencies /app/prod_node_modules ./node_modules
COPY --from=build /app . 
EXPOSE 5000
CMD ["node", "app.js"]