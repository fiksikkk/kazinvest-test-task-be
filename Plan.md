# Implementation Plan

## Goal

Build a web application that:

- shows a text input field;
- sends the entered text to the backend;
- has the backend send the text to an AI API;
- shows the model response on the frontend;
- in the extended version, supports voice input through a microphone button.

## Technologies

### Backend

- TypeScript
- Node.js
- NestJS
- Groq API

### Frontend

- TypeScript
- React
- Vite
- Tailwind CSS or regular CSS modules

## Backend: NestJS + TypeScript

### 1. Project Initialization

- Create a NestJS application.
- Configure TypeScript.
- Install required dependencies:
  - `@nestjs/config`
  - `class-validator`
  - `class-transformer`
  - optionally `@nestjs/throttler`

### 2. Environment Configuration

Create `.env`:

```env
PORT=3000
GROQ_API_KEY=...
GROQ_MODEL=llama-3.3-70b-versatile
FRONTEND_ORIGIN=http://localhost:5173
```

Requirements:

- validate the presence of `GROQ_API_KEY`;
- never expose the Groq API key to the frontend;
- use `GROQ_MODEL` from configuration;
- use `FRONTEND_ORIGIN` for CORS.

### 3. Backend Structure

```txt
src/
  app.module.ts
  main.ts
  config/
    env.validation.ts
  chat/
    chat.module.ts
    chat.controller.ts
    chat.service.ts
    dto/
      chat-request.dto.ts
      chat-response.dto.ts
```

### 4. API Contract

Endpoint:

```txt
POST /chat
```

Request:

```json
{
  "message": "Hello, tell me about NestJS"
}
```

Response:

```json
{
  "answer": "..."
}
```

### 5. DTO and Validation

For `ChatRequestDto`:

- `message` is required;
- type: string;
- minimum length: 1 character after `trim()`;
- maximum length: for example 4000 characters.

Enable a global `ValidationPipe` in `main.ts`.

### 6. AI API Integration

Create a `ChatService` that:

- sends user text to the AI provider;
- uses the model from `GROQ_MODEL`;
- returns the model’s text response.

Example logic:

```ts
const answer = await aiService.generateText(message);
return answer;
```

### 7. Error Handling

Handle:

- validation errors: `400 Bad Request`;
- missing API key or invalid configuration: startup failure or `500`;
- upstream AI API errors: `502 Bad Gateway`;
- AI API rate limits: `429` or `503`;
- network errors: a safe client message and a technical server log.

Internal upstream error details or stack traces must never be returned to the client.

### 8. CORS

Configure CORS:

- allow the origin from `FRONTEND_ORIGIN`;
- do not use `origin: '*'` for production scenarios.

### 9. Additional Protection

- Limit JSON body size.
- Add rate limiting to `/chat`, for example 10-20 requests per minute.
- Keep the model system instruction in config or a dedicated constant.

### 10. Backend Testing

Add:

- a unit test for `ChatService`;
- an e2e test for `POST /chat`;
- a successful request test;
- an empty `message` test;
- an overlong `message` test;
- an external API error test.

### 11. Backend Documentation

Document in `README.md`:

- dependency installation;
- an example `.env`;
- how to run the backend;
- a sample `curl` request.

## Frontend: React + TypeScript

### 1. Project Initialization

- Create a React app with Vite.
- Configure TypeScript.
- Add Tailwind CSS or use regular CSS modules.

### 2. Environment Configuration

Create `.env`:

```env
VITE_API_URL=http://localhost:3000
```

All AI API requests must go through the backend only.

### 3. Frontend Structure

```txt
src/
  main.tsx
  App.tsx
  api/
    chatApi.ts
  components/
    ChatForm.tsx
    MessageBox.tsx
    VoiceInputButton.tsx
    LoadingIndicator.tsx
    ErrorMessage.tsx
  hooks/
    useSpeechRecognition.ts
```

### 4. Main Screen

The page should contain:

- a text input field;
- a submit button;
- a microphone button for voice input;
- a model response block;
- a loading indicator;
- an error display block.

### 5. Text Submission Logic

Create `chatApi.sendMessage(message)` that:

- sends `POST /chat`;
- sends `{ message }`;
- handles unsuccessful HTTP responses;
- handles network errors;
- returns `answer`.

Optionally add `AbortController` to cancel long requests.

### 6. UI State

Main state:

- `input`;
- `answer`;
- `isLoading`;
- `error`;
- `isListening`;
- `isSpeechSupported`.

### 7. Form Behavior

- Do not allow empty submissions.
- Disable the submit button while loading.
- Show a loader while the request is pending.
- Keep the input text after a successful response so the user can edit it.
- Show errors in clear, user-friendly language.

### 8. Voice Input

Use the Web Speech API:

- `window.SpeechRecognition`;
- `window.webkitSpeechRecognition`.

Requirements:

- detect browser support;
- if unsupported, hide the button or show it disabled;
- set `isListening` on recording start;
- place recognized text into the input field;
- show an error like `Speech recognition failed`;
- recognition language: `en-US`.

### 9. UX Details

- Pressing Enter submits the form.
- If a `textarea` is used, `Shift + Enter` inserts a new line.
- The microphone button should visually show active recording state.
- The model response should appear in a separate block below the form.
- The interface should feel minimal and intuitive.

### 10. Frontend Testing

Add:

- a unit test for `chatApi`;
- a component test for the form;
- a disabled-state test for empty input;
- a loading indicator test;
- a response rendering test;
- an error rendering test;
- a mocked Web Speech API for voice input tests.

### 11. Frontend Documentation

Document in `README.md`:

- dependency installation;
- how to run the frontend;
- `VITE_API_URL` setup;
- browser limitations of the Web Speech API.

## Implementation Order

1. Create the NestJS backend.
2. Configure `.env`, CORS, and the validation pipe.
3. Implement `ChatModule`, `ChatController`, and `ChatService`.
4. Verify `POST /chat` with curl or Postman.
5. Create the React frontend.
6. Implement the text submission form.
7. Connect the frontend to the backend.
8. Add loading and error states.
9. Add voice input through the Web Speech API.
10. Write basic tests.
11. Document project setup in `README.md`.

## Minimal MVP

### Backend

- `POST /chat`;
- AI API integration;
- input validation;
- error handling.

### Frontend

- text input field;
- submit button;
- loading indicator;
- response block;
- error block.

### Extended Version

- microphone button;
- speech recognition via Web Speech API;
- inserting recognized text into the input field.

## What Not to Overcomplicate at the Start

- Do not add authentication.
- Do not store chat history in a database.
- Do not implement streaming responses in the first version.
- Do not upload audio to the backend if voice input uses the Web Speech API in the frontend.
