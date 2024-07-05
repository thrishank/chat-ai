## Setup

```
git clone https://github.com/thrishank/chat-ai/

cd chat-ai

npm install

```

create a .env file and update your [Google API key](https://aistudio.google.com/app/apikey)

```
cp .env.example .env
```

To start the application locally

```
npx prisma migrate dev

npx prisma generate

npm run dev

```
