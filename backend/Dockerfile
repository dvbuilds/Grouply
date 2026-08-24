FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 5000

# Lets `docker ps` / compose show real container health, and gives
# deployment tooling something to poll instead of guessing from logs.
# Uses Node's built-in http module so no extra package (e.g. curl) is
# needed in the alpine image.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["npm", "start"]
