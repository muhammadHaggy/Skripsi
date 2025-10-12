FROM node:21

WORKDIR /app

COPY package.json ./

COPY prisma ./prisma

RUN npm install

RUN npx prisma generate

COPY . .

EXPOSE 8080

CMD ["npm", "start"]