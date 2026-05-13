# Pip — Discord bot for Inventory Full.
# Fly.io builds this if buildpacks fail. Simple, single-stage.

FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev

# Install dev deps for the build step, then prune.
COPY tsconfig.json ./
COPY src ./src
COPY data ./data
RUN npm install --include=dev && npm run build && npm prune --omit=dev

CMD ["node", "dist/index.js"]
