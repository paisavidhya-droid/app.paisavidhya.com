FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Copy keys if you keep them in repo (better: mount as volume / env vars)
# ENV variables for BSE credentials should be set via docker-compose

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
