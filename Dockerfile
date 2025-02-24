FROM node:20-alpine

WORKDIR /bot

COPY package.json package-lock.json ./  

RUN npm ci --omit=dev

COPY . .

CMD ["npm", "start"]