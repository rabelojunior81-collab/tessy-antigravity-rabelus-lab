---
title: Gemini-JS-SDK-Core
url: https://googleapis.github.io/js-genai/release_docs/index.html
updated: 2026-01-21T03:02:38.203Z
method: Puppeteer Deep Scrape
---

@google/genaidocument.documentElement.dataset.theme = localStorage.getItem("tsd-theme") || "os";document.body.style.display="none";setTimeout(() => app?app.showPage():document.body.style.removeProperty("display"),500)

*   Preparing search index...
*   The search index is not available

[@google/genai](index.html)

[](#)

@google/genai
=============

Google Gen AI SDK for TypeScript and JavaScript[](#google-gen-ai-sdk-for-typescript-and-javascript)
===================================================================================================

[![NPM Downloads](https://img.shields.io/npm/dw/%40google%2Fgenai)](https://www.npmjs.com/package/@google/genai) [![Node Current](https://img.shields.io/node/v/%40google%2Fgenai)](https://www.npmjs.com/package/@google/genai)

* * *

**Documentation:** [https://googleapis.github.io/js-genai/](https://googleapis.github.io/js-genai/)

* * *

The Google Gen AI JavaScript SDK is designed for TypeScript and JavaScript developers to build applications powered by Gemini. The SDK supports both the [Gemini Developer API](https://ai.google.dev/gemini-api/docs) and [Vertex AI](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/overview).

The Google Gen AI SDK is designed to work with Gemini 2.0+ features.

Caution

**API Key Security:** Avoid exposing API keys in client-side code. Use server-side implementations in production environments.

Code Generation[](#code-generation)
-----------------------------------

Generative models are often unaware of recent API and SDK updates and may suggest outdated or legacy code.

We recommend using our Code Generation instructions [`codegen_instructions.md`](https://raw.githubusercontent.com/googleapis/js-genai/refs/heads/main/codegen_instructions.md) when generating Google Gen AI SDK code to guide your model towards using the more recent SDK features. Copy and paste the instructions into your development environment to provide the model with the necessary context.

Prerequisites[](#prerequisites)
-------------------------------

1.  Node.js version 20 or later

### The following are required for Vertex AI users (excluding Vertex AI Studio)[](#the-following-are-required-for-vertex-ai-users-excluding-vertex-ai-studio)

1.  [Select](https://console.cloud.google.com/project) or [create](https://cloud.google.com/resource-manager/docs/creating-managing-projects#creating_a_project) a Google Cloud project.
    
2.  [Enable billing for your project](https://cloud.google.com/billing/docs/how-to/modify-project).
    
3.  [Enable the Vertex AI API](https://console.cloud.google.com/flows/enableapi?apiid=aiplatform.googleapis.com).
    
4.  [Configure authentication](https://cloud.google.com/docs/authentication) for your project.
    
    *   [Install the gcloud CLI](https://cloud.google.com/sdk/docs/install).
    *   [Initialize the gcloud CLI](https://cloud.google.com/sdk/docs/initializing).
    *   Create local authentication credentials for your user account:
    
        gcloud auth application-default login
        
    

A list of accepted authentication options are listed in [GoogleAuthOptions](https://github.com/googleapis/google-auth-library-nodejs/blob/3ae120d0a45c95e36c59c9ac8286483938781f30/src/auth/googleauth.ts#L87) interface of google-auth-library-node.js GitHub repo.

Installation[](#installation)
-----------------------------

To install the SDK, run the following command:

    npm install @google/genai
    

Quickstart[](#quickstart)
-------------------------

The simplest way to get started is to use an API key from [Google AI Studio](https://aistudio.google.com/apikey):

    import {GoogleGenAI} from '@google/genai';const GEMINI_API_KEY = process.env.GEMINI_API_KEY;const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});async function main() {  const response = await ai.models.generateContent({    model: 'gemini-2.5-flash',    contents: 'Why is the sky blue?',  });  console.log(response.text);}main();
    

Initialization[](#initialization)
---------------------------------

The Google Gen AI SDK provides support for both the [Google AI Studio](https://ai.google.dev/gemini-api/docs) and [Vertex AI](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/overview) implementations of the Gemini API.

### Gemini Developer API[](#gemini-developer-api)

For server-side applications, initialize using an API key, which can be acquired from [Google AI Studio](https://aistudio.google.com/apikey):

    import { GoogleGenAI } from '@google/genai';const ai = new GoogleGenAI({apiKey: 'GEMINI_API_KEY'});
    

#### Browser[](#browser)

Caution

**API Key Security:** Avoid exposing API keys in client-side code. Use server-side implementations in production environments.

In the browser the initialization code is identical:

    import { GoogleGenAI } from '@google/genai';const ai = new GoogleGenAI({apiKey: 'GEMINI_API_KEY'});
    

### Vertex AI[](#vertex-ai)

Sample code for VertexAI initialization:

    import { GoogleGenAI } from '@google/genai';const ai = new GoogleGenAI({    vertexai: true,    project: 'your_project',    location: 'your_location',});
    

### (Optional) (NodeJS only) Using environment variables:[](#optional-nodejs-only-using-environment-variables)

For NodeJS environments, you can create a client by configuring the necessary environment variables. Configuration setup instructions depends on whether you're using the Gemini Developer API or the Gemini API in Vertex AI.

**Gemini Developer API:** Set `GOOGLE_API_KEY` as shown below:

    export GOOGLE_API_KEY='your-api-key'
    

**Gemini API on Vertex AI:** Set `GOOGLE_GENAI_USE_VERTEXAI`, `GOOGLE_CLOUD_PROJECT` and `GOOGLE_CLOUD_LOCATION`, as shown below:

    export GOOGLE_GENAI_USE_VERTEXAI=trueexport GOOGLE_CLOUD_PROJECT='your-project-id'export GOOGLE_CLOUD_LOCATION='us-central1'
    

    import {GoogleGenAI} from '@google/genai';const ai = new GoogleGenAI();
    

API Selection[](#api-selection)
-------------------------------

By default, the SDK uses the beta API endpoints provided by Google to support preview features in the APIs. The stable API endpoints can be selected by setting the API version to `v1`.

To set the API version use `apiVersion`. For example, to set the API version to `v1` for Vertex AI:

    const ai = new GoogleGenAI({    vertexai: true,    project: 'your_project',    location: 'your_location',    apiVersion: 'v1'});
    

To set the API version to `v1alpha` for the Gemini Developer API:

    const ai = new GoogleGenAI({    apiKey: 'GEMINI_API_KEY',    apiVersion: 'v1alpha'});
    

GoogleGenAI overview[](#googlegenai-overview)
---------------------------------------------

All API features are accessed through an instance of the `GoogleGenAI` classes. The submodules bundle together related API methods:

*   [`ai.models`](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html): Use `models` to query models (`generateContent`, `generateImages`, ...), or examine their metadata.
*   [`ai.caches`](https://googleapis.github.io/js-genai/release_docs/classes/caches.Caches.html): Create and manage `caches` to reduce costs when repeatedly using the same large prompt prefix.
*   [`ai.chats`](https://googleapis.github.io/js-genai/release_docs/classes/chats.Chats.html): Create local stateful `chat` objects to simplify multi turn interactions.
*   [`ai.files`](https://googleapis.github.io/js-genai/release_docs/classes/files.Files.html): Upload `files` to the API and reference them in your prompts. This reduces bandwidth if you use a file many times, and handles files too large to fit inline with your prompt.
*   [`ai.live`](https://googleapis.github.io/js-genai/release_docs/classes/live.Live.html): Start a `live` session for real time interaction, allows text + audio + video input, and text or audio output.

Samples[](#samples)
-------------------

More samples can be found in the [github samples directory](https://github.com/googleapis/js-genai/tree/main/sdk-samples).

### Streaming[](#streaming)

For quicker, more responsive API interactions use the `generateContentStream` method which yields chunks as they're generated:

    import {GoogleGenAI} from '@google/genai';const GEMINI_API_KEY = process.env.GEMINI_API_KEY;const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});async function main() {  const response = await ai.models.generateContentStream({    model: 'gemini-2.5-flash',    contents: 'Write a 100-word poem.',  });  for await (const chunk of response) {    console.log(chunk.text);  }}main();
    

### Function Calling[](#function-calling)

To let Gemini to interact with external systems, you can provide `functionDeclaration` objects as `tools`. To use these tools it's a 4 step

1.  **Declare the function name, description, and parametersJsonSchema**
2.  **Call `generateContent` with function calling enabled**
3.  **Use the returned `FunctionCall` parameters to call your actual function**
4.  **Send the result back to the model (with history, easier in `ai.chat`) as a `FunctionResponse`**

    import {GoogleGenAI, FunctionCallingConfigMode, FunctionDeclaration, Type} from '@google/genai';const GEMINI_API_KEY = process.env.GEMINI_API_KEY;async function main() {  const controlLightDeclaration: FunctionDeclaration = {    name: 'controlLight',    parametersJsonSchema: {      type: 'object',      properties:{        brightness: {          type:'number',        },        colorTemperature: {          type:'string',        },      },      required: ['brightness', 'colorTemperature'],    },  };  const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});  const response = await ai.models.generateContent({    model: 'gemini-2.5-flash',    contents: 'Dim the lights so the room feels cozy and warm.',    config: {      toolConfig: {        functionCallingConfig: {          // Force it to call any function          mode: FunctionCallingConfigMode.ANY,          allowedFunctionNames: ['controlLight'],        }      },      tools: [{functionDeclarations: [controlLightDeclaration]}]    }  });  console.log(response.functionCalls);}main();
    

#### Model Context Protocol (MCP) support (experimental)[](#model-context-protocol-mcp-support-experimental)

Built-in [MCP](https://modelcontextprotocol.io/introduction) support is an experimental feature. You can pass a local MCP server as a tool directly.

    import { GoogleGenAI, FunctionCallingConfigMode , mcpToTool} from '@google/genai';import { Client } from "@modelcontextprotocol/sdk/client/index.js";import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";// Create server parameters for stdio connectionconst serverParams = new StdioClientTransport({  command: "npx", // Executable  args: ["-y", "@philschmid/weather-mcp"] // MCP Server});const client = new Client(  {    name: "example-client",    version: "1.0.0"  });// Configure the clientconst ai = new GoogleGenAI({});// Initialize the connection between client and serverawait client.connect(serverParams);// Send request to the model with MCP toolsconst response = await ai.models.generateContent({  model: "gemini-2.5-flash",  contents: `What is the weather in London in ${new Date().toLocaleDateString()}?`,  config: {    tools: [mcpToTool(client)],  // uses the session, will automatically call the tool using automatic function calling  },});console.log(response.text);// Close the connectionawait client.close();
    

### Generate Content[](#generate-content)

#### How to structure `contents` argument for `generateContent`[](#how-to-structure-contents-argument-for-generatecontent)

The SDK allows you to specify the following types in the `contents` parameter:

#### Content[](#content)

*   `Content`: The SDK will wrap the singular `Content` instance in an array which contains only the given content instance
*   `Content[]`: No transformation happens

#### Part[](#part)

Parts will be aggregated on a singular Content, with role 'user'.

*   `Part | string`: The SDK will wrap the `string` or `Part` in a `Content` instance with role 'user'.
*   `Part[] | string[]`: The SDK will wrap the full provided list into a single `Content` with role 'user'.

**_NOTE:_** This doesn't apply to `FunctionCall` and `FunctionResponse` parts, if you are specifying those, you need to explicitly provide the full `Content[]` structure making it explicit which Parts are 'spoken' by the model, or the user. The SDK will throw an exception if you try this.

Error Handling[](#error-handling)
---------------------------------

To handle errors raised by the API, the SDK provides this [ApiError](https://github.com/googleapis/js-genai/blob/main/src/errors.ts) class.

    import {GoogleGenAI} from '@google/genai';const GEMINI_API_KEY = process.env.GEMINI_API_KEY;const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});async function main() {  await ai.models.generateContent({    model: 'non-existent-model',    contents: 'Write a 100-word poem.',  }).catch((e) => {    console.error('error name: ', e.name);    console.error('error message: ', e.message);    console.error('error status: ', e.status);  });}main();
    

Interactions (Preview)[](#interactions-preview)
-----------------------------------------------

> **Warning:** The Interactions API is in **Beta**. This is a preview of an experimental feature. Features and schemas are subject to **breaking changes**.

The Interactions API is a unified interface for interacting with Gemini models and agents. It simplifies state management, tool orchestration, and long-running tasks.

See the [documentation site](https://ai.google.dev/gemini-api/docs/interactions) for more details.

### Basic Interaction[](#basic-interaction)

    const interaction = await ai.interactions.create({    model: 'gemini-2.5-flash',    input: 'Hello, how are you?',});console.debug(interaction);
    

### Stateful Conversation[](#stateful-conversation)

The Interactions API supports server-side state management. You can continue a conversation by referencing the `previous_interaction_id`.

    // 1. First turnconst interaction1 = await ai.interactions.create({    model: 'gemini-2.5-flash',    input: 'Hi, my name is Amir.',});console.debug(interaction1);// 2. Second turn (passing previous_interaction_id)const interaction2 = await ai.interactions.create({  model: 'gemini-2.5-flash',  input: 'What is my name?',  previous_interaction_id: interaction1.id,});console.debug(interaction2);
    

### Agents (Deep Research)[](#agents-deep-research)

You can use specialized agents like `deep-research-pro-preview-12-2025` for complex tasks.

    function sleep(ms: number): Promise<void> {  return new Promise(resolve => setTimeout(resolve, ms));}// 1. Start the Deep Research Agentconst initialInteraction = await ai.interactions.create({  input:      'Research the history of the Google TPUs with a focus on 2025 and 2026.',  agent: 'deep-research-pro-preview-12-2025',  background: true,});console.log(`Research started. Interaction ID: ${initialInteraction.id}`);// 2. Poll for resultswhile (true) {  const interaction = await ai.interactions.get(initialInteraction.id);  console.log(`Status: ${interaction.status}`);  if (interaction.status === 'completed') {    console.debug('\nFinal Report:\n', interaction.outputs);    break;  } else if (['failed', 'cancelled'].includes(interaction.status)) {    console.log(`Failed with status: ${interaction.status}`);    break;  }  await sleep(10000);  // Sleep for 10 seconds}
    

### Multimodal Input[](#multimodal-input)

You can provide multimodal data (text, images, audio, etc.) in the input list.

    import base64// Assuming you have a base64 string// const base64Image = ...;const interaction = await ai.interactions.create({  model: 'gemini-2.5-flash',  input: [    { type: 'text', text: 'Describe the image.' },    { type: 'image', data: base64Image, mime_type: 'image/png' },  ],});console.debug(interaction);
    

### Function Calling[](#function-calling-1)

You can define custom functions for the model to use. The Interactions API handles the tool selection, and you provide the execution result back to the model.

    // 1. Define the toolconst getWeather = (location: string) => {  /* Gets the weather for a given location. */  return `The weather in ${location} is sunny.`;};// 2. Send the request with toolslet interaction = await ai.interactions.create({  model: 'gemini-2.5-flash',  input: 'What is the weather in Mountain View, CA?',  tools: [    {      type: 'function',      name: 'get_weather',      description: 'Gets the weather for a given location.',      parameters: {        type: 'object',        properties: {          location: {            type: 'string',            description: 'The city and state, e.g. San Francisco, CA',          },        },        required: ['location'],      },    },  ],});// 3. Handle the tool callfor (const output of interaction.outputs!) {  if (output.type === 'function_call') {    console.log(        `Tool Call: ${output.name}(${JSON.stringify(output.arguments)})`);    // Execute your actual function here    // Note: ensure arguments match your function signature    const result = getWeather(JSON.stringify(output.arguments.location));    // Send result back to the model    interaction = await ai.interactions.create({      model: 'gemini-2.5-flash',      previous_interaction_id: interaction.id,      input: [        {          type: 'function_result',          name: output.name,          call_id: output.id,          result: result,        },      ],    });    console.debug(`Response: ${JSON.stringify(interaction)}`);  }}
    

### Built-in Tools[](#built-in-tools)

You can also use Google's built-in tools, such as **Google Search** or **Code Execution**.

#### Grounding with Google Search[](#grounding-with-google-search)

    const interaction = await ai.interactions.create({  model: 'gemini-2.5-flash',  input: 'Who won the last Super Bowl',  tools: [{ type: 'google_search' }],});console.debug(interaction);
    

#### Code Execution[](#code-execution)

    const interaction = await ai.interactions.create({  model: 'gemini-2.5-flash',  input: 'Calculate the 50th Fibonacci number.',  tools: [{ type: 'code_execution' }],});console.debug(interaction);
    

### Multimodal Output[](#multimodal-output)

The Interactions API can generate multimodal outputs, such as images. You must specify the `response_modalities`.

    import * as fs from 'fs';const interaction = await ai.interactions.create({  model: 'gemini-3-pro-image-preview',  input: 'Generate an image of a futuristic city.',  response_modalities: ['image'],});for (const output of interaction.outputs!) {  if (output.type === 'image') {    console.log(`Generated image with mime_type: ${output.mime_type}`);    // Save the image    fs.writeFileSync(        'generated_city.png', Buffer.from(output.data!, 'base64'));  }}
    

How is this different from the other Google AI SDKs[](#how-is-this-different-from-the-other-google-ai-sdks)
-----------------------------------------------------------------------------------------------------------

This SDK (`@google/genai`) is Google Deepmind’s "vanilla" SDK for its generative AI offerings, and is where Google Deepmind adds new AI features.

Models hosted either on the [Vertex AI platform](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/overview) or the [Gemini Developer platform](https://ai.google.dev/gemini-api/docs) are accessible through this SDK.

Other SDKs may be offering additional AI frameworks on top of this SDK, or may be targeting specific project environments (like Firebase).

The `@google/generative_language` and `@google-cloud/vertexai` SDKs are previous iterations of this SDK and are no longer receiving new Gemini 2.0+ features.

### Settings

ThemeOSLightDark

### On This Page

[Google Gen AI SDK for TypeScript and JavaScript](#google-gen-ai-sdk-for-typescript-and-javascript)

*   [Code Generation](#code-generation)
*   [Prerequisites](#prerequisites)
*   *   [The following are required for Vertex AI users (excluding Vertex AI Studio)](#the-following-are-required-for-vertex-ai-users-excluding-vertex-ai-studio)
*   [Installation](#installation)
*   [Quickstart](#quickstart)
*   [Initialization](#initialization)
*   *   [Gemini Developer API](#gemini-developer-api)
    *   *   [Browser](#browser)
    *   [Vertex AI](#vertex-ai)
    *   [(Optional) (NodeJS only) Using environment variables:](#optional-nodejs-only-using-environment-variables)
*   [API Selection](#api-selection)
*   [GoogleGenAI overview](#googlegenai-overview)
*   [Samples](#samples)
*   *   [Streaming](#streaming)
    *   [Function Calling](#function-calling)
    *   *   [Model Context Protocol (MCP) support (experimental)](#model-context-protocol-mcp-support-experimental)
    *   [Generate Content](#generate-content)
    *   *   [How to structure contents argument for generateContent](#how-to-structure-contents-argument-for-generatecontent)
        *   [Content](#content)
        *   [Part](#part)
*   [Error Handling](#error-handling)
*   [Interactions (Preview)](#interactions-preview)
*   *   [Basic Interaction](#basic-interaction)
    *   [Stateful Conversation](#stateful-conversation)
    *   [Agents (Deep Research)](#agents-deep-research)
    *   [Multimodal Input](#multimodal-input)
    *   [Function Calling](#function-calling-1)
    *   [Built-in Tools](#built-in-tools)
    *   *   [Grounding with Google Search](#grounding-with-google-search)
        *   [Code Execution](#code-execution)
    *   [Multimodal Output](#multimodal-output)
*   [How is this different from the other Google AI SDKs](#how-is-this-different-from-the-other-google-ai-sdks)

[@google/genai](modules.html)

*   [batches](./modules/batches.html)
    
    *   [Batches](./classes/batches.Batches.html)
    
*   [caches](./modules/caches.html)
    
    *   [Caches](./classes/caches.Caches.html)
    
*   [chats](./modules/chats.html)
    
    *   [Chat](./classes/chats.Chat.html)
    *   [Chats](./classes/chats.Chats.html)
    
*   [client](./modules/client.html)
    
    *   [GoogleGenAI](./classes/client.GoogleGenAI.html)
    *   [GoogleGenAIOptions](./interfaces/client.GoogleGenAIOptions.html)
    
*   [cross/sentencepiece/sentencepiece\_model.pb](./modules/cross_sentencepiece_sentencepiece_model.pb.html)
    
    *   [sentencepiece](./modules/cross_sentencepiece_sentencepiece_model.pb.sentencepiece.html)
        
        *   [ModelProto](./modules/cross_sentencepiece_sentencepiece_model.pb.sentencepiece.ModelProto.html)
            
            *   [SentencePiece](./modules/cross_sentencepiece_sentencepiece_model.pb.sentencepiece.ModelProto.SentencePiece.html)
                
                *   [Type](./enums/cross_sentencepiece_sentencepiece_model.pb.sentencepiece.ModelProto.SentencePiece.Type.html)
                
            *   [SentencePiece](./classes/cross_sentencepiece_sentencepiece_model.pb.sentencepiece.ModelProto.SentencePiece-1.html)
            *   [ISentencePiece](./interfaces/cross_sentencepiece_sentencepiece_model.pb.sentencepiece.ModelProto.ISentencePiece.html)
            
        *   [SelfTestData](./modules/cross_sentencepiece_sentencepiece_model.pb.sentencepiece.SelfTestData.html)
            
            *   [Sample](./classes/cross_sentencepiece_sentencepiece_model.pb.sentencepiece.SelfTestData.Sample.html)
            *   [ISample](./interfaces/cross_sentencepiece_sentencepiece_model.pb.sentencepiece.SelfTestData.ISample.html)
            
        *   [TrainerSpec](./modules/cross_sentencepiece_sentencepiece_model.pb.sentencepiece.TrainerSpec.html)
            
            *   [ModelType](./enums/cross_sentencepiece_sentencepiece_model.pb.sentencepiece.TrainerSpec.ModelType.html)
            
        *   [ModelProto](./classes/cross_sentencepiece_sentencepiece_model.pb.sentencepiece.ModelProto-1.html)
        *   [NormalizerSpec](./classes/cross_sentencepiece_sentencepiece_model.pb.sentencepiece.NormalizerSpec.html)
        *   [SelfTestData](./classes/cross_sentencepiece_sentencepiece_model.pb.sentencepiece.SelfTestData-1.html)
        *   [TrainerSpec](./classes/cross_sentencepiece_sentencepiece_model.pb.sentencepiece.TrainerSpec-1.html)
        *   [IModelProto](./interfaces/cross_sentencepiece_sentencepiece_model.pb.sentencepiece.IModelProto.html)
        *   [INormalizerSpec](./interfaces/cross_sentencepiece_sentencepiece_model.pb.sentencepiece.INormalizerSpec.html)
        *   [ISelfTestData](./interfaces/cross_sentencepiece_sentencepiece_model.pb.sentencepiece.ISelfTestData.html)
        *   [ITrainerSpec](./interfaces/cross_sentencepiece_sentencepiece_model.pb.sentencepiece.ITrainerSpec.html)
        
    
*   [documents](./modules/documents.html)
    
    *   [Documents](./classes/documents.Documents.html)
    
*   [errors](./modules/errors.html)
    
    *   [ApiError](./classes/errors.ApiError.html)
    *   [ApiErrorInfo](./interfaces/errors.ApiErrorInfo.html)
    
*   [files](./modules/files.html)
    
    *   [Files](./classes/files.Files.html)
    
*   [filesearchstores](./modules/filesearchstores.html)
    
    *   [FileSearchStores](./classes/filesearchstores.FileSearchStores.html)
    
*   [interactions](./modules/interactions.html)
    
    *   [APIConnectionError](./modules/interactions.html#apiconnectionerror)
    *   [APIConnectionTimeoutError](./modules/interactions.html#apiconnectiontimeouterror)
    *   [APIError](./modules/interactions.html#apierror)
    *   [APIPromise](./modules/interactions.html#apipromise)
    *   [APIUserAbortError](./modules/interactions.html#apiuseraborterror)
    *   [AuthenticationError](./modules/interactions.html#authenticationerror)
    *   [BadRequestError](./modules/interactions.html#badrequesterror)
    *   [BaseGeminiNextGenAPIClient](./modules/interactions.html#basegemininextgenapiclient)
    *   [BlobLikePart](./modules/interactions.html#bloblikepart)
    *   [ClientOptions](./modules/interactions.html#clientoptions)
    *   [ConflictError](./modules/interactions.html#conflicterror)
    *   [default](./modules/interactions.html#default)
    *   [GeminiNextGenAPIClient](./modules/interactions.html#gemininextgenapiclient)
    *   [GeminiNextGenAPIClientError](./modules/interactions.html#gemininextgenapiclienterror)
    *   [InternalServerError](./modules/interactions.html#internalservererror)
    *   [NotFoundError](./modules/interactions.html#notfounderror)
    *   [PermissionDeniedError](./modules/interactions.html#permissiondeniederror)
    *   [RateLimitError](./modules/interactions.html#ratelimiterror)
    *   [toFile](./modules/interactions.html#tofile)
    *   [UnprocessableEntityError](./modules/interactions.html#unprocessableentityerror)
    *   [Uploadable](./modules/interactions.html#uploadable)
    *   [api-promise](./modules/interactions_api-promise.html)
        
        *   [APIPromise](./modules/interactions_api-promise.html#apipromise)
        
    *   [client](./modules/interactions_client.html)
        
        *   [GeminiNextGenAPIClient](./modules/interactions_client.GeminiNextGenAPIClient.html)
            
            *   [Interactions](./modules/interactions_client.GeminiNextGenAPIClient.Interactions.html)
                
                *   [ContentDelta](./modules/interactions_client.GeminiNextGenAPIClient.Interactions.ContentDelta.html)
                    
                    *   [FileSearchResultDelta](./modules/interactions_client.GeminiNextGenAPIClient.Interactions.ContentDelta.FileSearchResultDelta.html)
                        
                        *   [Result](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ContentDelta.FileSearchResultDelta.Result.html)
                        
                    *   [FunctionResultDelta](./modules/interactions_client.GeminiNextGenAPIClient.Interactions.ContentDelta.FunctionResultDelta.html)
                        
                        *   [Items](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ContentDelta.FunctionResultDelta.Items.html)
                        
                    *   [MCPServerToolResultDelta](./modules/interactions_client.GeminiNextGenAPIClient.Interactions.ContentDelta.MCPServerToolResultDelta.html)
                        
                        *   [Items](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ContentDelta.MCPServerToolResultDelta.Items.html)
                        
                    *   [AudioDelta](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ContentDelta.AudioDelta.html)
                    *   [CodeExecutionCallDelta](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ContentDelta.CodeExecutionCallDelta.html)
                    *   [CodeExecutionResultDelta](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ContentDelta.CodeExecutionResultDelta.html)
                    *   [DocumentDelta](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ContentDelta.DocumentDelta.html)
                    *   [FileSearchCallDelta](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ContentDelta.FileSearchCallDelta.html)
                    *   [FileSearchResultDelta](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ContentDelta.FileSearchResultDelta-1.html)
                    *   [FunctionCallDelta](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ContentDelta.FunctionCallDelta.html)
                    *   [FunctionResultDelta](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ContentDelta.FunctionResultDelta-1.html)
                    *   [GoogleSearchCallDelta](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ContentDelta.GoogleSearchCallDelta.html)
                    *   [GoogleSearchResultDelta](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ContentDelta.GoogleSearchResultDelta.html)
                    *   [ImageDelta](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ContentDelta.ImageDelta.html)
                    *   [MCPServerToolCallDelta](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ContentDelta.MCPServerToolCallDelta.html)
                    *   [MCPServerToolResultDelta](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ContentDelta.MCPServerToolResultDelta-1.html)
                    *   [TextDelta](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ContentDelta.TextDelta.html)
                    *   [ThoughtSignatureDelta](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ContentDelta.ThoughtSignatureDelta.html)
                    *   [ThoughtSummaryDelta](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ContentDelta.ThoughtSummaryDelta.html)
                    *   [URLContextCallDelta](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ContentDelta.URLContextCallDelta.html)
                    *   [URLContextResultDelta](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ContentDelta.URLContextResultDelta.html)
                    *   [VideoDelta](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ContentDelta.VideoDelta.html)
                    
                *   [ErrorEvent](./modules/interactions_client.GeminiNextGenAPIClient.Interactions.ErrorEvent.html)
                    
                    *   [Error](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ErrorEvent.Error.html)
                    
                *   [FileSearchResultContent](./modules/interactions_client.GeminiNextGenAPIClient.Interactions.FileSearchResultContent.html)
                    
                    *   [Result](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.FileSearchResultContent.Result.html)
                    
                *   [FunctionResultContent](./modules/interactions_client.GeminiNextGenAPIClient.Interactions.FunctionResultContent.html)
                    
                    *   [Items](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.FunctionResultContent.Items.html)
                    
                *   [InteractionGetParams](./modules/interactions_client.GeminiNextGenAPIClient.Interactions.InteractionGetParams.html)
                    
                    *   [InteractionGetParamsNonStreaming](./types/interactions_client.GeminiNextGenAPIClient.Interactions.InteractionGetParams.InteractionGetParamsNonStreaming.html)
                    *   [InteractionGetParamsStreaming](./types/interactions_client.GeminiNextGenAPIClient.Interactions.InteractionGetParams.InteractionGetParamsStreaming.html)
                    
                *   [MCPServerToolResultContent](./modules/interactions_client.GeminiNextGenAPIClient.Interactions.MCPServerToolResultContent.html)
                    
                    *   [Items](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.MCPServerToolResultContent.Items.html)
                    
                *   [Tool](./modules/interactions_client.GeminiNextGenAPIClient.Interactions.Tool.html)
                    
                    *   [CodeExecution](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.Tool.CodeExecution.html)
                    *   [ComputerUse](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.Tool.ComputerUse.html)
                    *   [FileSearch](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.Tool.FileSearch.html)
                    *   [GoogleSearch](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.Tool.GoogleSearch.html)
                    *   [MCPServer](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.Tool.MCPServer.html)
                    *   [URLContext](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.Tool.URLContext.html)
                    
                *   [Usage](./modules/interactions_client.GeminiNextGenAPIClient.Interactions.Usage.html)
                    
                    *   [CachedTokensByModality](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.Usage.CachedTokensByModality.html)
                    *   [InputTokensByModality](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.Usage.InputTokensByModality.html)
                    *   [OutputTokensByModality](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.Usage.OutputTokensByModality.html)
                    *   [ToolUseTokensByModality](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.Usage.ToolUseTokensByModality.html)
                    
                *   [AllowedTools](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.AllowedTools.html)
                *   [Annotation](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.Annotation.html)
                *   [AudioContent](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.AudioContent.html)
                *   [CodeExecutionCallArguments](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.CodeExecutionCallArguments.html)
                *   [CodeExecutionCallContent](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.CodeExecutionCallContent.html)
                *   [CodeExecutionResultContent](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.CodeExecutionResultContent.html)
                *   [ContentDelta](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ContentDelta-1.html)
                *   [ContentStart](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ContentStart.html)
                *   [ContentStop](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ContentStop.html)
                *   [CreateAgentInteractionParamsNonStreaming](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.CreateAgentInteractionParamsNonStreaming.html)
                *   [CreateAgentInteractionParamsStreaming](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.CreateAgentInteractionParamsStreaming.html)
                *   [CreateModelInteractionParamsNonStreaming](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.CreateModelInteractionParamsNonStreaming.html)
                *   [CreateModelInteractionParamsStreaming](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.CreateModelInteractionParamsStreaming.html)
                *   [DeepResearchAgentConfig](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.DeepResearchAgentConfig.html)
                *   [DocumentContent](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.DocumentContent.html)
                *   [DynamicAgentConfig](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.DynamicAgentConfig.html)
                *   [ErrorEvent](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ErrorEvent-1.html)
                *   [FileSearchCallContent](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.FileSearchCallContent.html)
                *   [FileSearchResultContent](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.FileSearchResultContent-1.html)
                *   [Function](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.Function.html)
                *   [FunctionCallContent](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.FunctionCallContent.html)
                *   [FunctionResultContent](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.FunctionResultContent-1.html)
                *   [GenerationConfig](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.GenerationConfig.html)
                *   [GoogleSearchCallArguments](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.GoogleSearchCallArguments.html)
                *   [GoogleSearchCallContent](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.GoogleSearchCallContent.html)
                *   [GoogleSearchResult](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.GoogleSearchResult.html)
                *   [GoogleSearchResultContent](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.GoogleSearchResultContent.html)
                *   [ImageConfig](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ImageConfig.html)
                *   [ImageContent](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ImageContent.html)
                *   [Interaction](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.Interaction.html)
                *   [InteractionCancelParams](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.InteractionCancelParams.html)
                *   [InteractionDeleteParams](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.InteractionDeleteParams.html)
                *   [InteractionEvent](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.InteractionEvent.html)
                *   [InteractionGetParamsNonStreaming](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.InteractionGetParamsNonStreaming.html)
                *   [InteractionGetParamsStreaming](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.InteractionGetParamsStreaming.html)
                *   [InteractionStatusUpdate](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.InteractionStatusUpdate.html)
                *   [MCPServerToolCallContent](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.MCPServerToolCallContent.html)
                *   [MCPServerToolResultContent](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.MCPServerToolResultContent-1.html)
                *   [SpeechConfig](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.SpeechConfig.html)
                *   [TextContent](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.TextContent.html)
                *   [ThoughtContent](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ThoughtContent.html)
                *   [ToolChoiceConfig](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.ToolChoiceConfig.html)
                *   [Turn](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.Turn.html)
                *   [URLContextCallArguments](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.URLContextCallArguments.html)
                *   [URLContextCallContent](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.URLContextCallContent.html)
                *   [URLContextResult](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.URLContextResult.html)
                *   [URLContextResultContent](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.URLContextResultContent.html)
                *   [Usage](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.Usage-1.html)
                *   [VideoContent](./interfaces/interactions_client.GeminiNextGenAPIClient.Interactions.VideoContent.html)
                *   [AudioMimeType](./types/interactions_client.GeminiNextGenAPIClient.Interactions.AudioMimeType.html)
                *   [Content](./types/interactions_client.GeminiNextGenAPIClient.Interactions.Content.html)
                *   [DocumentMimeType](./types/interactions_client.GeminiNextGenAPIClient.Interactions.DocumentMimeType.html)
                *   [ImageMimeType](./types/interactions_client.GeminiNextGenAPIClient.Interactions.ImageMimeType.html)
                *   [InteractionCreateParams](./types/interactions_client.GeminiNextGenAPIClient.Interactions.InteractionCreateParams.html)
                *   [InteractionDeleteResponse](./types/interactions_client.GeminiNextGenAPIClient.Interactions.InteractionDeleteResponse.html)
                *   [InteractionGetParams](./types/interactions_client.GeminiNextGenAPIClient.Interactions.InteractionGetParams-1.html)
                *   [InteractionSSEEvent](./types/interactions_client.GeminiNextGenAPIClient.Interactions.InteractionSSEEvent.html)
                *   [Model](./types/interactions_client.GeminiNextGenAPIClient.Interactions.Model.html)
                *   [ThinkingLevel](./types/interactions_client.GeminiNextGenAPIClient.Interactions.ThinkingLevel.html)
                *   [Tool](./types/interactions_client.GeminiNextGenAPIClient.Interactions.Tool-1.html)
                *   [ToolChoice](./types/interactions_client.GeminiNextGenAPIClient.Interactions.ToolChoice.html)
                *   [ToolChoiceType](./types/interactions_client.GeminiNextGenAPIClient.Interactions.ToolChoiceType.html)
                *   [VideoMimeType](./types/interactions_client.GeminiNextGenAPIClient.Interactions.VideoMimeType.html)
                
            *   [Interactions](./classes/interactions_client.GeminiNextGenAPIClient.Interactions-1.html)
            *   [RequestOptions](./types/interactions_client.GeminiNextGenAPIClient.RequestOptions.html)
            *   [AllowedTools](./modules/interactions_client.GeminiNextGenAPIClient.html#allowedtools)
            *   [Annotation](./modules/interactions_client.GeminiNextGenAPIClient.html#annotation)
            *   [AudioContent](./modules/interactions_client.GeminiNextGenAPIClient.html#audiocontent)
            *   [AudioMimeType](./modules/interactions_client.GeminiNextGenAPIClient.html#audiomimetype)
            *   [CodeExecutionCallArguments](./modules/interactions_client.GeminiNextGenAPIClient.html#codeexecutioncallarguments)
            *   [CodeExecutionCallContent](./modules/interactions_client.GeminiNextGenAPIClient.html#codeexecutioncallcontent)
            *   [CodeExecutionResultContent](./modules/interactions_client.GeminiNextGenAPIClient.html#codeexecutionresultcontent)
            *   [Content](./modules/interactions_client.GeminiNextGenAPIClient.html#content)
            *   [ContentDelta](./modules/interactions_client.GeminiNextGenAPIClient.html#contentdelta)
            *   [ContentStart](./modules/interactions_client.GeminiNextGenAPIClient.html#contentstart)
            *   [ContentStop](./modules/interactions_client.GeminiNextGenAPIClient.html#contentstop)
            *   [CreateAgentInteractionParamsNonStreaming](./modules/interactions_client.GeminiNextGenAPIClient.html#createagentinteractionparamsnonstreaming)
            *   [CreateAgentInteractionParamsStreaming](./modules/interactions_client.GeminiNextGenAPIClient.html#createagentinteractionparamsstreaming)
            *   [CreateModelInteractionParamsNonStreaming](./modules/interactions_client.GeminiNextGenAPIClient.html#createmodelinteractionparamsnonstreaming)
            *   [CreateModelInteractionParamsStreaming](./modules/interactions_client.GeminiNextGenAPIClient.html#createmodelinteractionparamsstreaming)
            *   [DeepResearchAgentConfig](./modules/interactions_client.GeminiNextGenAPIClient.html#deepresearchagentconfig)
            *   [DocumentContent](./modules/interactions_client.GeminiNextGenAPIClient.html#documentcontent)
            *   [DocumentMimeType](./modules/interactions_client.GeminiNextGenAPIClient.html#documentmimetype)
            *   [DynamicAgentConfig](./modules/interactions_client.GeminiNextGenAPIClient.html#dynamicagentconfig)
            *   [ErrorEvent](./modules/interactions_client.GeminiNextGenAPIClient.html#errorevent)
            *   [FileSearchCallContent](./modules/interactions_client.GeminiNextGenAPIClient.html#filesearchcallcontent)
            *   [FileSearchResultContent](./modules/interactions_client.GeminiNextGenAPIClient.html#filesearchresultcontent)
            *   [Function](./modules/interactions_client.GeminiNextGenAPIClient.html#function)
            *   [FunctionCallContent](./modules/interactions_client.GeminiNextGenAPIClient.html#functioncallcontent)
            *   [FunctionResultContent](./modules/interactions_client.GeminiNextGenAPIClient.html#functionresultcontent)
            *   [GenerationConfig](./modules/interactions_client.GeminiNextGenAPIClient.html#generationconfig)
            *   [GoogleSearchCallArguments](./modules/interactions_client.GeminiNextGenAPIClient.html#googlesearchcallarguments)
            *   [GoogleSearchCallContent](./modules/interactions_client.GeminiNextGenAPIClient.html#googlesearchcallcontent)
            *   [GoogleSearchResult](./modules/interactions_client.GeminiNextGenAPIClient.html#googlesearchresult)
            *   [GoogleSearchResultContent](./modules/interactions_client.GeminiNextGenAPIClient.html#googlesearchresultcontent)
            *   [ImageConfig](./modules/interactions_client.GeminiNextGenAPIClient.html#imageconfig)
            *   [ImageContent](./modules/interactions_client.GeminiNextGenAPIClient.html#imagecontent)
            *   [ImageMimeType](./modules/interactions_client.GeminiNextGenAPIClient.html#imagemimetype)
            *   [Interaction](./modules/interactions_client.GeminiNextGenAPIClient.html#interaction)
            *   [InteractionCancelParams](./modules/interactions_client.GeminiNextGenAPIClient.html#interactioncancelparams)
            *   [InteractionCreateParams](./modules/interactions_client.GeminiNextGenAPIClient.html#interactioncreateparams)
            *   [InteractionDeleteParams](./modules/interactions_client.GeminiNextGenAPIClient.html#interactiondeleteparams)
            *   [InteractionDeleteResponse](./modules/interactions_client.GeminiNextGenAPIClient.html#interactiondeleteresponse)
            *   [InteractionEvent](./modules/interactions_client.GeminiNextGenAPIClient.html#interactionevent)
            *   [InteractionGetParams](./modules/interactions_client.GeminiNextGenAPIClient.html#interactiongetparams)
            *   [InteractionGetParamsNonStreaming](./modules/interactions_client.GeminiNextGenAPIClient.html#interactiongetparamsnonstreaming)
            *   [InteractionGetParamsStreaming](./modules/interactions_client.GeminiNextGenAPIClient.html#interactiongetparamsstreaming)
            *   [InteractionSSEEvent](./modules/interactions_client.GeminiNextGenAPIClient.html#interactionsseevent)
            *   [InteractionStatusUpdate](./modules/interactions_client.GeminiNextGenAPIClient.html#interactionstatusupdate)
            *   [MCPServerToolCallContent](./modules/interactions_client.GeminiNextGenAPIClient.html#mcpservertoolcallcontent)
            *   [MCPServerToolResultContent](./modules/interactions_client.GeminiNextGenAPIClient.html#mcpservertoolresultcontent)
            *   [Model](./modules/interactions_client.GeminiNextGenAPIClient.html#model)
            *   [SpeechConfig](./modules/interactions_client.GeminiNextGenAPIClient.html#speechconfig)
            *   [TextContent](./modules/interactions_client.GeminiNextGenAPIClient.html#textcontent)
            *   [ThinkingLevel](./modules/interactions_client.GeminiNextGenAPIClient.html#thinkinglevel)
            *   [ThoughtContent](./modules/interactions_client.GeminiNextGenAPIClient.html#thoughtcontent)
            *   [Tool](./modules/interactions_client.GeminiNextGenAPIClient.html#tool)
            *   [ToolChoice](./modules/interactions_client.GeminiNextGenAPIClient.html#toolchoice)
            *   [ToolChoiceConfig](./modules/interactions_client.GeminiNextGenAPIClient.html#toolchoiceconfig)
            *   [ToolChoiceType](./modules/interactions_client.GeminiNextGenAPIClient.html#toolchoicetype)
            *   [Turn](./modules/interactions_client.GeminiNextGenAPIClient.html#turn)
            *   [URLContextCallArguments](./modules/interactions_client.GeminiNextGenAPIClient.html#urlcontextcallarguments)
            *   [URLContextCallContent](./modules/interactions_client.GeminiNextGenAPIClient.html#urlcontextcallcontent)
            *   [URLContextResult](./modules/interactions_client.GeminiNextGenAPIClient.html#urlcontextresult)
            *   [URLContextResultContent](./modules/interactions_client.GeminiNextGenAPIClient.html#urlcontextresultcontent)
            *   [Usage](./modules/interactions_client.GeminiNextGenAPIClient.html#usage)
            *   [VideoContent](./modules/interactions_client.GeminiNextGenAPIClient.html#videocontent)
            *   [VideoMimeType](./modules/interactions_client.GeminiNextGenAPIClient.html#videomimetype)
            
        *   [BaseGeminiNextGenAPIClient](./classes/interactions_client.BaseGeminiNextGenAPIClient.html)
        *   [GeminiNextGenAPIClient](./classes/interactions_client.GeminiNextGenAPIClient-1.html)
        *   [ClientOptions](./interfaces/interactions_client.ClientOptions.html)
        *   [Logger](./modules/interactions_client.html#logger)
        *   [LogLevel](./modules/interactions_client.html#loglevel)
        
    *   [client-adapter](./modules/interactions_client-adapter.html)
        
        *   [GeminiNextGenAPIClientAdapter](./interfaces/interactions_client-adapter.GeminiNextGenAPIClientAdapter.html)
        
    *   core
        
        *   [api-promise](./modules/interactions_core_api-promise.html)
            
            *   [APIPromise](./classes/interactions_core_api-promise.APIPromise.html)
            
        *   [error](./modules/interactions_core_error.html)
            
            *   [APIConnectionError](./classes/interactions_core_error.APIConnectionError.html)
            *   [APIConnectionTimeoutError](./classes/interactions_core_error.APIConnectionTimeoutError.html)
            *   [APIError](./classes/interactions_core_error.APIError.html)
            *   [APIUserAbortError](./classes/interactions_core_error.APIUserAbortError.html)
            *   [AuthenticationError](./classes/interactions_core_error.AuthenticationError.html)
            *   [BadRequestError](./classes/interactions_core_error.BadRequestError.html)
            *   [ConflictError](./classes/interactions_core_error.ConflictError.html)
            *   [GeminiNextGenAPIClientError](./classes/interactions_core_error.GeminiNextGenAPIClientError.html)
            *   [InternalServerError](./classes/interactions_core_error.InternalServerError.html)
            *   [NotFoundError](./classes/interactions_core_error.NotFoundError.html)
            *   [PermissionDeniedError](./classes/interactions_core_error.PermissionDeniedError.html)
            *   [RateLimitError](./classes/interactions_core_error.RateLimitError.html)
            *   [UnprocessableEntityError](./classes/interactions_core_error.UnprocessableEntityError.html)
            
        *   [resource](./modules/interactions_core_resource.html)
            
            *   [APIResource](./classes/interactions_core_resource.APIResource.html)
            
        *   [streaming](./modules/interactions_core_streaming.html)
            
            *   [Stream](./classes/interactions_core_streaming.Stream.html)
            *   [ServerSentEvent](./types/interactions_core_streaming.ServerSentEvent.html)
            *   [\_iterSSEMessages](./functions/interactions_core_streaming._iterSSEMessages.html)
            
        *   [uploads](./modules/interactions_core_uploads.html)
            
            *   [BlobLikePart](./modules/interactions_core_uploads.html#bloblikepart)
            *   [toFile](./modules/interactions_core_uploads.html#tofile)
            *   [ToFileInput](./modules/interactions_core_uploads.html#tofileinput)
            *   [Uploadable](./modules/interactions_core_uploads.html#uploadable)
            
        
    *   [error](./modules/interactions_error.html)
        
        *   [APIConnectionError](./modules/interactions_error.html#apiconnectionerror)
        *   [APIConnectionTimeoutError](./modules/interactions_error.html#apiconnectiontimeouterror)
        *   [APIError](./modules/interactions_error.html#apierror)
        *   [APIUserAbortError](./modules/interactions_error.html#apiuseraborterror)
        *   [AuthenticationError](./modules/interactions_error.html#authenticationerror)
        *   [BadRequestError](./modules/interactions_error.html#badrequesterror)
        *   [ConflictError](./modules/interactions_error.html#conflicterror)
        *   [GeminiNextGenAPIClientError](./modules/interactions_error.html#gemininextgenapiclienterror)
        *   [InternalServerError](./modules/interactions_error.html#internalservererror)
        *   [NotFoundError](./modules/interactions_error.html#notfounderror)
        *   [PermissionDeniedError](./modules/interactions_error.html#permissiondeniederror)
        *   [RateLimitError](./modules/interactions_error.html#ratelimiterror)
        *   [UnprocessableEntityError](./modules/interactions_error.html#unprocessableentityerror)
        
    *   internal
        
        *   [builtin-types](./modules/interactions_internal_builtin-types.html)
            
            *   [BlobPropertyBag](./interfaces/interactions_internal_builtin-types.BlobPropertyBag.html)
            *   [FilePropertyBag](./interfaces/interactions_internal_builtin-types.FilePropertyBag.html)
            *   [Array](./types/interactions_internal_builtin-types.Array.html)
            *   [BodyInit](./types/interactions_internal_builtin-types.BodyInit.html)
            *   [Fetch](./types/interactions_internal_builtin-types.Fetch.html)
            *   [HeadersInit](./types/interactions_internal_builtin-types.HeadersInit.html)
            *   [Record](./types/interactions_internal_builtin-types.Record.html)
            *   [RequestInfo](./types/interactions_internal_builtin-types.RequestInfo.html)
            *   [RequestInit](./types/interactions_internal_builtin-types.RequestInit.html)
            *   [Response](./types/interactions_internal_builtin-types.Response.html)
            
        *   [decoders/line](./modules/interactions_internal_decoders_line.html)
            
            *   [LineDecoder](./classes/interactions_internal_decoders_line.LineDecoder.html)
            *   [Bytes](./types/interactions_internal_decoders_line.Bytes.html)
            *   [findDoubleNewlineIndex](./functions/interactions_internal_decoders_line.findDoubleNewlineIndex.html)
            
        *   [detect-platform](./modules/interactions_internal_detect-platform.html)
            
            *   [getPlatformHeaders](./functions/interactions_internal_detect-platform.getPlatformHeaders.html)
            *   [isRunningInBrowser](./functions/interactions_internal_detect-platform.isRunningInBrowser.html)
            
        *   [errors](./modules/interactions_internal_errors.html)
            
            *   [castToError](./functions/interactions_internal_errors.castToError.html)
            *   [isAbortError](./functions/interactions_internal_errors.isAbortError.html)
            
        *   [headers](./modules/interactions_internal_headers.html)
            
            *   [HeadersLike](./types/interactions_internal_headers.HeadersLike.html)
            *   [buildHeaders](./functions/interactions_internal_headers.buildHeaders.html)
            *   [isEmptyHeaders](./functions/interactions_internal_headers.isEmptyHeaders.html)
            
        *   [parse](./modules/interactions_internal_parse.html)
            
            *   [APIResponseProps](./types/interactions_internal_parse.APIResponseProps.html)
            *   [defaultParseResponse](./functions/interactions_internal_parse.defaultParseResponse.html)
            
        *   [request-options](./modules/interactions_internal_request-options.html)
            
            *   [EncodedContent](./types/interactions_internal_request-options.EncodedContent.html)
            *   [FinalRequestOptions](./types/interactions_internal_request-options.FinalRequestOptions.html)
            *   [RequestEncoder](./types/interactions_internal_request-options.RequestEncoder.html)
            *   [RequestOptions](./types/interactions_internal_request-options.RequestOptions.html)
            *   [FallbackEncoder](./functions/interactions_internal_request-options.FallbackEncoder.html)
            
        *   [shim-types](./modules/interactions_internal_shim-types.html)
            
            *   [ReadableStream](./types/interactions_internal_shim-types.ReadableStream.html)
            
        *   [shims](./modules/interactions_internal_shims.html)
            
            *   [CancelReadableStream](./functions/interactions_internal_shims.CancelReadableStream.html)
            *   [getDefaultFetch](./functions/interactions_internal_shims.getDefaultFetch.html)
            *   [makeReadableStream](./functions/interactions_internal_shims.makeReadableStream.html)
            *   [ReadableStreamFrom](./functions/interactions_internal_shims.ReadableStreamFrom.html)
            *   [ReadableStreamToAsyncIterable](./functions/interactions_internal_shims.ReadableStreamToAsyncIterable.html)
            
        *   [to-file](./modules/interactions_internal_to-file.html)
            
            *   [BlobLike](./interfaces/interactions_internal_to-file.BlobLike.html)
            *   [ResponseLike](./interfaces/interactions_internal_to-file.ResponseLike.html)
            *   [BlobLikePart](./types/interactions_internal_to-file.BlobLikePart.html)
            *   [ToFileInput](./types/interactions_internal_to-file.ToFileInput.html)
            *   [toFile](./functions/interactions_internal_to-file.toFile.html)
            
        *   [types](./modules/interactions_internal_types.html)
            
            *   [FinalizedRequestInit](./types/interactions_internal_types.FinalizedRequestInit.html)
            *   [HTTPMethod](./types/interactions_internal_types.HTTPMethod.html)
            *   [KeysEnum](./types/interactions_internal_types.KeysEnum.html)
            *   [MergedRequestInit](./types/interactions_internal_types.MergedRequestInit.html)
            *   [PromiseOrValue](./types/interactions_internal_types.PromiseOrValue.html)
            
        *   [uploads](./modules/interactions_internal_uploads.html)
            
            *   [BlobPart](./types/interactions_internal_uploads.BlobPart.html)
            *   [Uploadable](./types/interactions_internal_uploads.Uploadable.html)
            *   [checkFileSupport](./functions/interactions_internal_uploads.checkFileSupport.html)
            *   [createForm](./functions/interactions_internal_uploads.createForm.html)
            *   [getName](./functions/interactions_internal_uploads.getName.html)
            *   [isAsyncIterable](./functions/interactions_internal_uploads.isAsyncIterable.html)
            *   [makeFile](./functions/interactions_internal_uploads.makeFile.html)
            *   [maybeMultipartFormRequestOptions](./functions/interactions_internal_uploads.maybeMultipartFormRequestOptions.html)
            *   [multipartFormRequestOptions](./functions/interactions_internal_uploads.multipartFormRequestOptions.html)
            
        *   [utils](./modules/interactions_internal_utils.html)
            
            *   [coerceBoolean](./modules/interactions_internal_utils.html#coerceboolean)
            *   [coerceFloat](./modules/interactions_internal_utils.html#coercefloat)
            *   [coerceInteger](./modules/interactions_internal_utils.html#coerceinteger)
            *   [ensurePresent](./modules/interactions_internal_utils.html#ensurepresent)
            *   [formatRequestDetails](./modules/interactions_internal_utils.html#formatrequestdetails)
            *   [fromBase64](./modules/interactions_internal_utils.html#frombase64)
            *   [hasOwn](./modules/interactions_internal_utils.html#hasown)
            *   [isAbsoluteURL](./modules/interactions_internal_utils.html#isabsoluteurl)
            *   [isArray](./modules/interactions_internal_utils.html#isarray)
            *   [isEmptyObj](./modules/interactions_internal_utils.html#isemptyobj)
            *   [isObj](./modules/interactions_internal_utils.html#isobj)
            *   [isReadonlyArray](./modules/interactions_internal_utils.html#isreadonlyarray)
            *   [Logger](./modules/interactions_internal_utils.html#logger)
            *   [loggerFor](./modules/interactions_internal_utils.html#loggerfor)
            *   [LogLevel](./modules/interactions_internal_utils.html#loglevel)
            *   [maybeCoerceBoolean](./modules/interactions_internal_utils.html#maybecoerceboolean)
            *   [maybeCoerceFloat](./modules/interactions_internal_utils.html#maybecoercefloat)
            *   [maybeCoerceInteger](./modules/interactions_internal_utils.html#maybecoerceinteger)
            *   [maybeObj](./modules/interactions_internal_utils.html#maybeobj)
            *   [parseLogLevel](./modules/interactions_internal_utils.html#parseloglevel)
            *   [readEnv](./modules/interactions_internal_utils.html#readenv)
            *   [safeJSON](./modules/interactions_internal_utils.html#safejson)
            *   [sleep](./modules/interactions_internal_utils.html#sleep)
            *   [toBase64](./modules/interactions_internal_utils.html#tobase64)
            *   [uuid4](./modules/interactions_internal_utils.html#uuid4)
            *   [validatePositiveInteger](./modules/interactions_internal_utils.html#validatepositiveinteger)
            *   [base64](./modules/interactions_internal_utils_base64.html)
                
                *   [fromBase64](./functions/interactions_internal_utils_base64.fromBase64.html)
                *   [toBase64](./functions/interactions_internal_utils_base64.toBase64.html)
                
            *   [bytes](./modules/interactions_internal_utils_bytes.html)
                
                *   [concatBytes](./functions/interactions_internal_utils_bytes.concatBytes.html)
                *   [decodeUTF8](./functions/interactions_internal_utils_bytes.decodeUTF8.html)
                *   [encodeUTF8](./functions/interactions_internal_utils_bytes.encodeUTF8.html)
                
            *   [env](./modules/interactions_internal_utils_env.html)
                
                *   [readEnv](./functions/interactions_internal_utils_env.readEnv.html)
                
            *   [log](./modules/interactions_internal_utils_log.html)
                
                *   [Logger](./types/interactions_internal_utils_log.Logger.html)
                *   [LogLevel](./types/interactions_internal_utils_log.LogLevel.html)
                *   [formatRequestDetails](./functions/interactions_internal_utils_log.formatRequestDetails.html)
                *   [loggerFor](./functions/interactions_internal_utils_log.loggerFor.html)
                *   [parseLogLevel](./functions/interactions_internal_utils_log.parseLogLevel.html)
                
            *   [path](./modules/interactions_internal_utils_path.html)
                
                *   [createPathTagFunction](./functions/interactions_internal_utils_path.createPathTagFunction.html)
                *   [encodeURIPath](./functions/interactions_internal_utils_path.encodeURIPath.html)
                *   [path](./functions/interactions_internal_utils_path.path.html)
                
            *   [sleep](./modules/interactions_internal_utils_sleep.html)
                
                *   [sleep](./functions/interactions_internal_utils_sleep.sleep.html)
                
            *   [uuid](./modules/interactions_internal_utils_uuid.html)
                
                *   [uuid4](./functions/interactions_internal_utils_uuid.uuid4.html)
                
            *   [values](./modules/interactions_internal_utils_values.html)
                
                *   [coerceBoolean](./functions/interactions_internal_utils_values.coerceBoolean.html)
                *   [coerceFloat](./functions/interactions_internal_utils_values.coerceFloat.html)
                *   [coerceInteger](./functions/interactions_internal_utils_values.coerceInteger.html)
                *   [ensurePresent](./functions/interactions_internal_utils_values.ensurePresent.html)
                *   [hasOwn](./functions/interactions_internal_utils_values.hasOwn.html)
                *   [isAbsoluteURL](./functions/interactions_internal_utils_values.isAbsoluteURL.html)
                *   [isArray](./functions/interactions_internal_utils_values.isArray.html)
                *   [isEmptyObj](./functions/interactions_internal_utils_values.isEmptyObj.html)
                *   [isObj](./functions/interactions_internal_utils_values.isObj.html)
                *   [isReadonlyArray](./functions/interactions_internal_utils_values.isReadonlyArray.html)
                *   [maybeCoerceBoolean](./functions/interactions_internal_utils_values.maybeCoerceBoolean.html)
                *   [maybeCoerceFloat](./functions/interactions_internal_utils_values.maybeCoerceFloat.html)
                *   [maybeCoerceInteger](./functions/interactions_internal_utils_values.maybeCoerceInteger.html)
                *   [maybeObj](./functions/interactions_internal_utils_values.maybeObj.html)
                *   [safeJSON](./functions/interactions_internal_utils_values.safeJSON.html)
                *   [validatePositiveInteger](./functions/interactions_internal_utils_values.validatePositiveInteger.html)
                
            
        
    *   [resource](./modules/interactions_resource.html)
        
        *   [APIResource](./modules/interactions_resource.html#apiresource)
        
    *   [resources](./modules/interactions_resources.html)
        
        *   [AllowedTools](./modules/interactions_resources.html#allowedtools)
        *   [Annotation](./modules/interactions_resources.html#annotation)
        *   [AudioContent](./modules/interactions_resources.html#audiocontent)
        *   [AudioMimeType](./modules/interactions_resources.html#audiomimetype)
        *   [BaseInteractions](./modules/interactions_resources.html#baseinteractions)
        *   [CodeExecutionCallArguments](./modules/interactions_resources.html#codeexecutioncallarguments)
        *   [CodeExecutionCallContent](./modules/interactions_resources.html#codeexecutioncallcontent)
        *   [CodeExecutionResultContent](./modules/interactions_resources.html#codeexecutionresultcontent)
        *   [Content](./modules/interactions_resources.html#content)
        *   [ContentDelta](./modules/interactions_resources.html#contentdelta)
        *   [ContentStart](./modules/interactions_resources.html#contentstart)
        *   [ContentStop](./modules/interactions_resources.html#contentstop)
        *   [CreateAgentInteractionParamsNonStreaming](./modules/interactions_resources.html#createagentinteractionparamsnonstreaming)
        *   [CreateAgentInteractionParamsStreaming](./modules/interactions_resources.html#createagentinteractionparamsstreaming)
        *   [CreateModelInteractionParamsNonStreaming](./modules/interactions_resources.html#createmodelinteractionparamsnonstreaming)
        *   [CreateModelInteractionParamsStreaming](./modules/interactions_resources.html#createmodelinteractionparamsstreaming)
        *   [DeepResearchAgentConfig](./modules/interactions_resources.html#deepresearchagentconfig)
        *   [DocumentContent](./modules/interactions_resources.html#documentcontent)
        *   [DocumentMimeType](./modules/interactions_resources.html#documentmimetype)
        *   [DynamicAgentConfig](./modules/interactions_resources.html#dynamicagentconfig)
        *   [ErrorEvent](./modules/interactions_resources.html#errorevent)
        *   [FileSearchCallContent](./modules/interactions_resources.html#filesearchcallcontent)
        *   [FileSearchResultContent](./modules/interactions_resources.html#filesearchresultcontent)
        *   [Function](./modules/interactions_resources.html#function)
        *   [FunctionCallContent](./modules/interactions_resources.html#functioncallcontent)
        *   [FunctionResultContent](./modules/interactions_resources.html#functionresultcontent)
        *   [GenerationConfig](./modules/interactions_resources.html#generationconfig)
        *   [GoogleSearchCallArguments](./modules/interactions_resources.html#googlesearchcallarguments)
        *   [GoogleSearchCallContent](./modules/interactions_resources.html#googlesearchcallcontent)
        *   [GoogleSearchResult](./modules/interactions_resources.html#googlesearchresult)
        *   [GoogleSearchResultContent](./modules/interactions_resources.html#googlesearchresultcontent)
        *   [ImageConfig](./modules/interactions_resources.html#imageconfig)
        *   [ImageContent](./modules/interactions_resources.html#imagecontent)
        *   [ImageMimeType](./modules/interactions_resources.html#imagemimetype)
        *   [Interaction](./modules/interactions_resources.html#interaction)
        *   [InteractionCancelParams](./modules/interactions_resources.html#interactioncancelparams)
        *   [InteractionCreateParams](./modules/interactions_resources.html#interactioncreateparams)
        *   [InteractionDeleteParams](./modules/interactions_resources.html#interactiondeleteparams)
        *   [InteractionDeleteResponse](./modules/interactions_resources.html#interactiondeleteresponse)
        *   [InteractionEvent](./modules/interactions_resources.html#interactionevent)
        *   [InteractionGetParams](./modules/interactions_resources.html#interactiongetparams)
        *   [InteractionGetParamsNonStreaming](./modules/interactions_resources.html#interactiongetparamsnonstreaming)
        *   [InteractionGetParamsStreaming](./modules/interactions_resources.html#interactiongetparamsstreaming)
        *   [Interactions](./modules/interactions_resources.html#interactions)
        *   [InteractionSSEEvent](./modules/interactions_resources.html#interactionsseevent)
        *   [InteractionStatusUpdate](./modules/interactions_resources.html#interactionstatusupdate)
        *   [MCPServerToolCallContent](./modules/interactions_resources.html#mcpservertoolcallcontent)
        *   [MCPServerToolResultContent](./modules/interactions_resources.html#mcpservertoolresultcontent)
        *   [Model](./modules/interactions_resources.html#model)
        *   [SpeechConfig](./modules/interactions_resources.html#speechconfig)
        *   [TextContent](./modules/interactions_resources.html#textcontent)
        *   [ThinkingLevel](./modules/interactions_resources.html#thinkinglevel)
        *   [ThoughtContent](./modules/interactions_resources.html#thoughtcontent)
        *   [Tool](./modules/interactions_resources.html#tool)
        *   [ToolChoice](./modules/interactions_resources.html#toolchoice)
        *   [ToolChoiceConfig](./modules/interactions_resources.html#toolchoiceconfig)
        *   [ToolChoiceType](./modules/interactions_resources.html#toolchoicetype)
        *   [Turn](./modules/interactions_resources.html#turn)
        *   [URLContextCallArguments](./modules/interactions_resources.html#urlcontextcallarguments)
        *   [URLContextCallContent](./modules/interactions_resources.html#urlcontextcallcontent)
        *   [URLContextResult](./modules/interactions_resources.html#urlcontextresult)
        *   [URLContextResultContent](./modules/interactions_resources.html#urlcontextresultcontent)
        *   [Usage](./modules/interactions_resources.html#usage)
        *   [VideoContent](./modules/interactions_resources.html#videocontent)
        *   [VideoMimeType](./modules/interactions_resources.html#videomimetype)
        *   [interactions](./modules/interactions_resources_interactions.html)
            
            *   [BaseInteractions](./classes/interactions_resources_interactions.BaseInteractions.html)
            *   [BaseCreateAgentInteractionParams](./interfaces/interactions_resources_interactions.BaseCreateAgentInteractionParams.html)
            *   [BaseCreateModelInteractionParams](./interfaces/interactions_resources_interactions.BaseCreateModelInteractionParams.html)
            *   [InteractionGetParamsBase](./interfaces/interactions_resources_interactions.InteractionGetParamsBase.html)
            *   [AllowedTools](./modules/interactions_resources_interactions.html#allowedtools)
            *   [Annotation](./modules/interactions_resources_interactions.html#annotation)
            *   [AudioContent](./modules/interactions_resources_interactions.html#audiocontent)
            *   [AudioMimeType](./modules/interactions_resources_interactions.html#audiomimetype)
            *   [CodeExecutionCallArguments](./modules/interactions_resources_interactions.html#codeexecutioncallarguments)
            *   [CodeExecutionCallContent](./modules/interactions_resources_interactions.html#codeexecutioncallcontent)
            *   [CodeExecutionResultContent](./modules/interactions_resources_interactions.html#codeexecutionresultcontent)
            *   [Content](./modules/interactions_resources_interactions.html#content)
            *   [ContentDelta](./modules/interactions_resources_interactions.html#contentdelta)
            *   [ContentStart](./modules/interactions_resources_interactions.html#contentstart)
            *   [ContentStop](./modules/interactions_resources_interactions.html#contentstop)
            *   [CreateAgentInteractionParamsNonStreaming](./modules/interactions_resources_interactions.html#createagentinteractionparamsnonstreaming)
            *   [CreateAgentInteractionParamsStreaming](./modules/interactions_resources_interactions.html#createagentinteractionparamsstreaming)
            *   [CreateModelInteractionParamsNonStreaming](./modules/interactions_resources_interactions.html#createmodelinteractionparamsnonstreaming)
            *   [CreateModelInteractionParamsStreaming](./modules/interactions_resources_interactions.html#createmodelinteractionparamsstreaming)
            *   [DeepResearchAgentConfig](./modules/interactions_resources_interactions.html#deepresearchagentconfig)
            *   [DocumentContent](./modules/interactions_resources_interactions.html#documentcontent)
            *   [DocumentMimeType](./modules/interactions_resources_interactions.html#documentmimetype)
            *   [DynamicAgentConfig](./modules/interactions_resources_interactions.html#dynamicagentconfig)
            *   [ErrorEvent](./modules/interactions_resources_interactions.html#errorevent)
            *   [FileSearchCallContent](./modules/interactions_resources_interactions.html#filesearchcallcontent)
            *   [FileSearchResultContent](./modules/interactions_resources_interactions.html#filesearchresultcontent)
            *   [Function](./modules/interactions_resources_interactions.html#function)
            *   [FunctionCallContent](./modules/interactions_resources_interactions.html#functioncallcontent)
            *   [FunctionResultContent](./modules/interactions_resources_interactions.html#functionresultcontent)
            *   [GenerationConfig](./modules/interactions_resources_interactions.html#generationconfig)
            *   [GoogleSearchCallArguments](./modules/interactions_resources_interactions.html#googlesearchcallarguments)
            *   [GoogleSearchCallContent](./modules/interactions_resources_interactions.html#googlesearchcallcontent)
            *   [GoogleSearchResult](./modules/interactions_resources_interactions.html#googlesearchresult)
            *   [GoogleSearchResultContent](./modules/interactions_resources_interactions.html#googlesearchresultcontent)
            *   [ImageConfig](./modules/interactions_resources_interactions.html#imageconfig)
            *   [ImageContent](./modules/interactions_resources_interactions.html#imagecontent)
            *   [ImageMimeType](./modules/interactions_resources_interactions.html#imagemimetype)
            *   [Interaction](./modules/interactions_resources_interactions.html#interaction)
            *   [InteractionCancelParams](./modules/interactions_resources_interactions.html#interactioncancelparams)
            *   [InteractionCreateParams](./modules/interactions_resources_interactions.html#interactioncreateparams)
            *   [InteractionDeleteParams](./modules/interactions_resources_interactions.html#interactiondeleteparams)
            *   [InteractionDeleteResponse](./modules/interactions_resources_interactions.html#interactiondeleteresponse)
            *   [InteractionEvent](./modules/interactions_resources_interactions.html#interactionevent)
            *   [InteractionGetParams](./modules/interactions_resources_interactions.html#interactiongetparams)
            *   [InteractionGetParamsNonStreaming](./modules/interactions_resources_interactions.html#interactiongetparamsnonstreaming)
            *   [InteractionGetParamsStreaming](./modules/interactions_resources_interactions.html#interactiongetparamsstreaming)
            *   [Interactions](./modules/interactions_resources_interactions.html#interactions)
            *   [InteractionSSEEvent](./modules/interactions_resources_interactions.html#interactionsseevent)
            *   [InteractionStatusUpdate](./modules/interactions_resources_interactions.html#interactionstatusupdate)
            *   [MCPServerToolCallContent](./modules/interactions_resources_interactions.html#mcpservertoolcallcontent)
            *   [MCPServerToolResultContent](./modules/interactions_resources_interactions.html#mcpservertoolresultcontent)
            *   [Model](./modules/interactions_resources_interactions.html#model)
            *   [SpeechConfig](./modules/interactions_resources_interactions.html#speechconfig)
            *   [TextContent](./modules/interactions_resources_interactions.html#textcontent)
            *   [ThinkingLevel](./modules/interactions_resources_interactions.html#thinkinglevel)
            *   [ThoughtContent](./modules/interactions_resources_interactions.html#thoughtcontent)
            *   [Tool](./modules/interactions_resources_interactions.html#tool)
            *   [ToolChoice](./modules/interactions_resources_interactions.html#toolchoice)
            *   [ToolChoiceConfig](./modules/interactions_resources_interactions.html#toolchoiceconfig)
            *   [ToolChoiceType](./modules/interactions_resources_interactions.html#toolchoicetype)
            *   [Turn](./modules/interactions_resources_interactions.html#turn)
            *   [URLContextCallArguments](./modules/interactions_resources_interactions.html#urlcontextcallarguments)
            *   [URLContextCallContent](./modules/interactions_resources_interactions.html#urlcontextcallcontent)
            *   [URLContextResult](./modules/interactions_resources_interactions.html#urlcontextresult)
            *   [URLContextResultContent](./modules/interactions_resources_interactions.html#urlcontextresultcontent)
            *   [Usage](./modules/interactions_resources_interactions.html#usage)
            *   [VideoContent](./modules/interactions_resources_interactions.html#videocontent)
            *   [VideoMimeType](./modules/interactions_resources_interactions.html#videomimetype)
            
        
    *   [resources](./modules/interactions_resources-1.html)
        
        *   [AllowedTools](./modules/interactions_resources-1.html#allowedtools)
        *   [Annotation](./modules/interactions_resources-1.html#annotation)
        *   [AudioContent](./modules/interactions_resources-1.html#audiocontent)
        *   [AudioMimeType](./modules/interactions_resources-1.html#audiomimetype)
        *   [BaseInteractions](./modules/interactions_resources-1.html#baseinteractions)
        *   [CodeExecutionCallArguments](./modules/interactions_resources-1.html#codeexecutioncallarguments)
        *   [CodeExecutionCallContent](./modules/interactions_resources-1.html#codeexecutioncallcontent)
        *   [CodeExecutionResultContent](./modules/interactions_resources-1.html#codeexecutionresultcontent)
        *   [Content](./modules/interactions_resources-1.html#content)
        *   [ContentDelta](./modules/interactions_resources-1.html#contentdelta)
        *   [ContentStart](./modules/interactions_resources-1.html#contentstart)
        *   [ContentStop](./modules/interactions_resources-1.html#contentstop)
        *   [CreateAgentInteractionParamsNonStreaming](./modules/interactions_resources-1.html#createagentinteractionparamsnonstreaming)
        *   [CreateAgentInteractionParamsStreaming](./modules/interactions_resources-1.html#createagentinteractionparamsstreaming)
        *   [CreateModelInteractionParamsNonStreaming](./modules/interactions_resources-1.html#createmodelinteractionparamsnonstreaming)
        *   [CreateModelInteractionParamsStreaming](./modules/interactions_resources-1.html#createmodelinteractionparamsstreaming)
        *   [DeepResearchAgentConfig](./modules/interactions_resources-1.html#deepresearchagentconfig)
        *   [DocumentContent](./modules/interactions_resources-1.html#documentcontent)
        *   [DocumentMimeType](./modules/interactions_resources-1.html#documentmimetype)
        *   [DynamicAgentConfig](./modules/interactions_resources-1.html#dynamicagentconfig)
        *   [ErrorEvent](./modules/interactions_resources-1.html#errorevent)
        *   [FileSearchCallContent](./modules/interactions_resources-1.html#filesearchcallcontent)
        *   [FileSearchResultContent](./modules/interactions_resources-1.html#filesearchresultcontent)
        *   [Function](./modules/interactions_resources-1.html#function)
        *   [FunctionCallContent](./modules/interactions_resources-1.html#functioncallcontent)
        *   [FunctionResultContent](./modules/interactions_resources-1.html#functionresultcontent)
        *   [GenerationConfig](./modules/interactions_resources-1.html#generationconfig)
        *   [GoogleSearchCallArguments](./modules/interactions_resources-1.html#googlesearchcallarguments)
        *   [GoogleSearchCallContent](./modules/interactions_resources-1.html#googlesearchcallcontent)
        *   [GoogleSearchResult](./modules/interactions_resources-1.html#googlesearchresult)
        *   [GoogleSearchResultContent](./modules/interactions_resources-1.html#googlesearchresultcontent)
        *   [ImageConfig](./modules/interactions_resources-1.html#imageconfig)
        *   [ImageContent](./modules/interactions_resources-1.html#imagecontent)
        *   [ImageMimeType](./modules/interactions_resources-1.html#imagemimetype)
        *   [Interaction](./modules/interactions_resources-1.html#interaction)
        *   [InteractionCancelParams](./modules/interactions_resources-1.html#interactioncancelparams)
        *   [InteractionCreateParams](./modules/interactions_resources-1.html#interactioncreateparams)
        *   [InteractionDeleteParams](./modules/interactions_resources-1.html#interactiondeleteparams)
        *   [InteractionDeleteResponse](./modules/interactions_resources-1.html#interactiondeleteresponse)
        *   [InteractionEvent](./modules/interactions_resources-1.html#interactionevent)
        *   [InteractionGetParams](./modules/interactions_resources-1.html#interactiongetparams)
        *   [InteractionGetParamsNonStreaming](./modules/interactions_resources-1.html#interactiongetparamsnonstreaming)
        *   [InteractionGetParamsStreaming](./modules/interactions_resources-1.html#interactiongetparamsstreaming)
        *   [Interactions](./modules/interactions_resources-1.html#interactions)
        *   [InteractionSSEEvent](./modules/interactions_resources-1.html#interactionsseevent)
        *   [InteractionStatusUpdate](./modules/interactions_resources-1.html#interactionstatusupdate)
        *   [MCPServerToolCallContent](./modules/interactions_resources-1.html#mcpservertoolcallcontent)
        *   [MCPServerToolResultContent](./modules/interactions_resources-1.html#mcpservertoolresultcontent)
        *   [Model](./modules/interactions_resources-1.html#model)
        *   [SpeechConfig](./modules/interactions_resources-1.html#speechconfig)
        *   [TextContent](./modules/interactions_resources-1.html#textcontent)
        *   [ThinkingLevel](./modules/interactions_resources-1.html#thinkinglevel)
        *   [ThoughtContent](./modules/interactions_resources-1.html#thoughtcontent)
        *   [Tool](./modules/interactions_resources-1.html#tool)
        *   [ToolChoice](./modules/interactions_resources-1.html#toolchoice)
        *   [ToolChoiceConfig](./modules/interactions_resources-1.html#toolchoiceconfig)
        *   [ToolChoiceType](./modules/interactions_resources-1.html#toolchoicetype)
        *   [Turn](./modules/interactions_resources-1.html#turn)
        *   [URLContextCallArguments](./modules/interactions_resources-1.html#urlcontextcallarguments)
        *   [URLContextCallContent](./modules/interactions_resources-1.html#urlcontextcallcontent)
        *   [URLContextResult](./modules/interactions_resources-1.html#urlcontextresult)
        *   [URLContextResultContent](./modules/interactions_resources-1.html#urlcontextresultcontent)
        *   [Usage](./modules/interactions_resources-1.html#usage)
        *   [VideoContent](./modules/interactions_resources-1.html#videocontent)
        *   [VideoMimeType](./modules/interactions_resources-1.html#videomimetype)
        
    *   [streaming](./modules/interactions_streaming.html)
        
        *   [\_iterSSEMessages](./modules/interactions_streaming.html#_iterssemessages)
        *   [ServerSentEvent](./modules/interactions_streaming.html#serversentevent)
        *   [Stream](./modules/interactions_streaming.html#stream)
        
    *   [tree-shakable](./modules/interactions_tree-shakable.html)
        
        *   [PartialGeminiNextGenAPIClient](./types/interactions_tree-shakable.PartialGeminiNextGenAPIClient.html)
        *   [createClient](./functions/interactions_tree-shakable.createClient.html)
        
    *   [uploads](./modules/interactions_uploads.html)
        
        *   [BlobLikePart](./modules/interactions_uploads.html#bloblikepart)
        *   [toFile](./modules/interactions_uploads.html#tofile)
        *   [ToFileInput](./modules/interactions_uploads.html#tofileinput)
        *   [Uploadable](./modules/interactions_uploads.html#uploadable)
        
    *   [version](./modules/interactions_version.html)
        
        *   [VERSION](./variables/interactions_version.VERSION.html)
        
    
*   [live](./modules/live.html)
    
    *   [Live](./classes/live.Live.html)
    *   [Session](./classes/live.Session.html)
    
*   [models](./modules/models.html)
    
    *   [Models](./classes/models.Models.html)
    
*   [music](./modules/music.html)
    
    *   [LiveMusic](./classes/music.LiveMusic.html)
    *   [LiveMusicSession](./classes/music.LiveMusicSession.html)
    
*   [operations](./modules/operations.html)
    
    *   [Operations](./classes/operations.Operations.html)
    
*   [pagers](./modules/pagers.html)
    
    *   [PagedItem](./enums/pagers.PagedItem.html)
    *   [Pager](./classes/pagers.Pager.html)
    *   [PagedItemConfig](./interfaces/pagers.PagedItemConfig.html)
    
*   tokenizer
    
    *   [node](./modules/tokenizer_node.html)
        
        *   [ComputeTokensResult](./modules/tokenizer_node.html#computetokensresult)
        *   [CountTokensResult](./modules/tokenizer_node.html#counttokensresult)
        *   [TokensInfo](./modules/tokenizer_node.html#tokensinfo)
        
    *   [web](./modules/tokenizer_web.html)
    
*   [tokens](./modules/tokens.html)
    
    *   [Tokens](./classes/tokens.Tokens.html)
    
*   [tunings](./modules/tunings.html)
    
    *   [Tunings](./classes/tunings.Tunings.html)
    
*   [types](./modules/types.html)
    
    *   [ActivityHandling](./enums/types.ActivityHandling.html)
    *   [AdapterSize](./enums/types.AdapterSize.html)
    *   [ApiSpec](./enums/types.ApiSpec.html)
    *   [AuthType](./enums/types.AuthType.html)
    *   [Behavior](./enums/types.Behavior.html)
    *   [BlockedReason](./enums/types.BlockedReason.html)
    *   [ControlReferenceType](./enums/types.ControlReferenceType.html)
    *   [DocumentState](./enums/types.DocumentState.html)
    *   [DynamicRetrievalConfigMode](./enums/types.DynamicRetrievalConfigMode.html)
    *   [EditMode](./enums/types.EditMode.html)
    *   [EndSensitivity](./enums/types.EndSensitivity.html)
    *   [Environment](./enums/types.Environment.html)
    *   [FeatureSelectionPreference](./enums/types.FeatureSelectionPreference.html)
    *   [FileSource](./enums/types.FileSource.html)
    *   [FileState](./enums/types.FileState.html)
    *   [FinishReason](./enums/types.FinishReason.html)
    *   [FunctionCallingConfigMode](./enums/types.FunctionCallingConfigMode.html)
    *   [FunctionResponseScheduling](./enums/types.FunctionResponseScheduling.html)
    *   [HarmBlockMethod](./enums/types.HarmBlockMethod.html)
    *   [HarmBlockThreshold](./enums/types.HarmBlockThreshold.html)
    *   [HarmCategory](./enums/types.HarmCategory.html)
    *   [HarmProbability](./enums/types.HarmProbability.html)
    *   [HarmSeverity](./enums/types.HarmSeverity.html)
    *   [HttpElementLocation](./enums/types.HttpElementLocation.html)
    *   [ImagePromptLanguage](./enums/types.ImagePromptLanguage.html)
    *   [JobState](./enums/types.JobState.html)
    *   [Language](./enums/types.Language.html)
    *   [LiveMusicPlaybackControl](./enums/types.LiveMusicPlaybackControl.html)
    *   [MaskReferenceMode](./enums/types.MaskReferenceMode.html)
    *   [MediaModality](./enums/types.MediaModality.html)
    *   [MediaResolution](./enums/types.MediaResolution.html)
    *   [Modality](./enums/types.Modality.html)
    *   [MusicGenerationMode](./enums/types.MusicGenerationMode.html)
    *   [Outcome](./enums/types.Outcome.html)
    *   [PartMediaResolutionLevel](./enums/types.PartMediaResolutionLevel.html)
    *   [PersonGeneration](./enums/types.PersonGeneration.html)
    *   [PhishBlockThreshold](./enums/types.PhishBlockThreshold.html)
    *   [SafetyFilterLevel](./enums/types.SafetyFilterLevel.html)
    *   [Scale](./enums/types.Scale.html)
    *   [SegmentMode](./enums/types.SegmentMode.html)
    *   [StartSensitivity](./enums/types.StartSensitivity.html)
    *   [SubjectReferenceType](./enums/types.SubjectReferenceType.html)
    *   [ThinkingLevel](./enums/types.ThinkingLevel.html)
    *   [TrafficType](./enums/types.TrafficType.html)
    *   [TuningMethod](./enums/types.TuningMethod.html)
    *   [TuningMode](./enums/types.TuningMode.html)
    *   [TuningTask](./enums/types.TuningTask.html)
    *   [TurnCompleteReason](./enums/types.TurnCompleteReason.html)
    *   [TurnCoverage](./enums/types.TurnCoverage.html)
    *   [Type](./enums/types.Type.html)
    *   [UrlRetrievalStatus](./enums/types.UrlRetrievalStatus.html)
    *   [VadSignalType](./enums/types.VadSignalType.html)
    *   [VideoCompressionQuality](./enums/types.VideoCompressionQuality.html)
    *   [VideoGenerationMaskMode](./enums/types.VideoGenerationMaskMode.html)
    *   [VideoGenerationReferenceType](./enums/types.VideoGenerationReferenceType.html)
    *   [VoiceActivityType](./enums/types.VoiceActivityType.html)
    *   [CancelTuningJobResponse](./classes/types.CancelTuningJobResponse.html)
    *   [ComputeTokensResponse](./classes/types.ComputeTokensResponse.html)
    *   [ContentReferenceImage](./classes/types.ContentReferenceImage.html)
    *   [ControlReferenceImage](./classes/types.ControlReferenceImage.html)
    *   [CountTokensResponse](./classes/types.CountTokensResponse.html)
    *   [CreateFileResponse](./classes/types.CreateFileResponse.html)
    *   [DeleteCachedContentResponse](./classes/types.DeleteCachedContentResponse.html)
    *   [DeleteFileResponse](./classes/types.DeleteFileResponse.html)
    *   [DeleteModelResponse](./classes/types.DeleteModelResponse.html)
    *   [EditImageResponse](./classes/types.EditImageResponse.html)
    *   [EmbedContentResponse](./classes/types.EmbedContentResponse.html)
    *   [FunctionResponse](./classes/types.FunctionResponse.html)
    *   [FunctionResponseBlob](./classes/types.FunctionResponseBlob.html)
    *   [FunctionResponseFileData](./classes/types.FunctionResponseFileData.html)
    *   [FunctionResponsePart](./classes/types.FunctionResponsePart.html)
    *   [GenerateContentResponse](./classes/types.GenerateContentResponse.html)
    *   [GenerateContentResponsePromptFeedback](./classes/types.GenerateContentResponsePromptFeedback.html)
    *   [GenerateContentResponseUsageMetadata](./classes/types.GenerateContentResponseUsageMetadata.html)
    *   [GenerateImagesResponse](./classes/types.GenerateImagesResponse.html)
    *   [GenerateVideosOperation](./classes/types.GenerateVideosOperation.html)
    *   [GenerateVideosResponse](./classes/types.GenerateVideosResponse.html)
    *   [HttpResponse](./classes/types.HttpResponse.html)
    *   [ImportFileOperation](./classes/types.ImportFileOperation.html)
    *   [ImportFileResponse](./classes/types.ImportFileResponse.html)
    *   [InlinedEmbedContentResponse](./classes/types.InlinedEmbedContentResponse.html)
    *   [InlinedResponse](./classes/types.InlinedResponse.html)
    *   [ListBatchJobsResponse](./classes/types.ListBatchJobsResponse.html)
    *   [ListCachedContentsResponse](./classes/types.ListCachedContentsResponse.html)
    *   [ListDocumentsResponse](./classes/types.ListDocumentsResponse.html)
    *   [ListFileSearchStoresResponse](./classes/types.ListFileSearchStoresResponse.html)
    *   [ListFilesResponse](./classes/types.ListFilesResponse.html)
    *   [ListModelsResponse](./classes/types.ListModelsResponse.html)
    *   [ListTuningJobsResponse](./classes/types.ListTuningJobsResponse.html)
    *   [LiveClientToolResponse](./classes/types.LiveClientToolResponse.html)
    *   [LiveMusicServerMessage](./classes/types.LiveMusicServerMessage.html)
    *   [LiveSendToolResponseParameters](./classes/types.LiveSendToolResponseParameters.html)
    *   [LiveServerMessage](./classes/types.LiveServerMessage.html)
    *   [MaskReferenceImage](./classes/types.MaskReferenceImage.html)
    *   [RawReferenceImage](./classes/types.RawReferenceImage.html)
    *   [RecontextImageResponse](./classes/types.RecontextImageResponse.html)
    *   [ReplayResponse](./classes/types.ReplayResponse.html)
    *   [SegmentImageResponse](./classes/types.SegmentImageResponse.html)
    *   [SingleEmbedContentResponse](./classes/types.SingleEmbedContentResponse.html)
    *   [StyleReferenceImage](./classes/types.StyleReferenceImage.html)
    *   [SubjectReferenceImage](./classes/types.SubjectReferenceImage.html)
    *   [UploadToFileSearchStoreOperation](./classes/types.UploadToFileSearchStoreOperation.html)
    *   [UploadToFileSearchStoreResponse](./classes/types.UploadToFileSearchStoreResponse.html)
    *   [UploadToFileSearchStoreResumableResponse](./classes/types.UploadToFileSearchStoreResumableResponse.html)
    *   [UpscaleImageResponse](./classes/types.UpscaleImageResponse.html)
    *   [ActivityEnd](./interfaces/types.ActivityEnd.html)
    *   [ActivityStart](./interfaces/types.ActivityStart.html)
    *   [ApiAuth](./interfaces/types.ApiAuth.html)
    *   [ApiAuthApiKeyConfig](./interfaces/types.ApiAuthApiKeyConfig.html)
    *   [ApiKeyConfig](./interfaces/types.ApiKeyConfig.html)
    *   [AudioChunk](./interfaces/types.AudioChunk.html)
    *   [AudioTranscriptionConfig](./interfaces/types.AudioTranscriptionConfig.html)
    *   [AuthConfig](./interfaces/types.AuthConfig.html)
    *   [AuthConfigGoogleServiceAccountConfig](./interfaces/types.AuthConfigGoogleServiceAccountConfig.html)
    *   [AuthConfigHttpBasicAuthConfig](./interfaces/types.AuthConfigHttpBasicAuthConfig.html)
    *   [AuthConfigOauthConfig](./interfaces/types.AuthConfigOauthConfig.html)
    *   [AuthConfigOidcConfig](./interfaces/types.AuthConfigOidcConfig.html)
    *   [AuthToken](./interfaces/types.AuthToken.html)
    *   [AutomaticActivityDetection](./interfaces/types.AutomaticActivityDetection.html)
    *   [AutomaticFunctionCallingConfig](./interfaces/types.AutomaticFunctionCallingConfig.html)
    *   [BatchJob](./interfaces/types.BatchJob.html)
    *   [BatchJobDestination](./interfaces/types.BatchJobDestination.html)
    *   [BatchJobSource](./interfaces/types.BatchJobSource.html)
    *   [Blob](./interfaces/types.Blob.html)
    *   [CachedContent](./interfaces/types.CachedContent.html)
    *   [CachedContentUsageMetadata](./interfaces/types.CachedContentUsageMetadata.html)
    *   [CallableTool](./interfaces/types.CallableTool.html)
    *   [CallableToolConfig](./interfaces/types.CallableToolConfig.html)
    *   [CancelBatchJobConfig](./interfaces/types.CancelBatchJobConfig.html)
    *   [CancelBatchJobParameters](./interfaces/types.CancelBatchJobParameters.html)
    *   [CancelTuningJobConfig](./interfaces/types.CancelTuningJobConfig.html)
    *   [CancelTuningJobParameters](./interfaces/types.CancelTuningJobParameters.html)
    *   [Candidate](./interfaces/types.Candidate.html)
    *   [Checkpoint](./interfaces/types.Checkpoint.html)
    *   [ChunkingConfig](./interfaces/types.ChunkingConfig.html)
    *   [Citation](./interfaces/types.Citation.html)
    *   [CitationMetadata](./interfaces/types.CitationMetadata.html)
    *   [CodeExecutionResult](./interfaces/types.CodeExecutionResult.html)
    *   [CompletionStats](./interfaces/types.CompletionStats.html)
    *   [ComputerUse](./interfaces/types.ComputerUse.html)
    *   [ComputeTokensConfig](./interfaces/types.ComputeTokensConfig.html)
    *   [ComputeTokensParameters](./interfaces/types.ComputeTokensParameters.html)
    *   [ComputeTokensResult](./interfaces/types.ComputeTokensResult.html)
    *   [Content](./interfaces/types.Content.html)
    *   [ContentEmbedding](./interfaces/types.ContentEmbedding.html)
    *   [ContentEmbeddingStatistics](./interfaces/types.ContentEmbeddingStatistics.html)
    *   [ContextWindowCompressionConfig](./interfaces/types.ContextWindowCompressionConfig.html)
    *   [ControlReferenceConfig](./interfaces/types.ControlReferenceConfig.html)
    *   [CountTokensConfig](./interfaces/types.CountTokensConfig.html)
    *   [CountTokensParameters](./interfaces/types.CountTokensParameters.html)
    *   [CountTokensResult](./interfaces/types.CountTokensResult.html)
    *   [CreateAuthTokenConfig](./interfaces/types.CreateAuthTokenConfig.html)
    *   [CreateAuthTokenParameters](./interfaces/types.CreateAuthTokenParameters.html)
    *   [CreateBatchJobConfig](./interfaces/types.CreateBatchJobConfig.html)
    *   [CreateBatchJobParameters](./interfaces/types.CreateBatchJobParameters.html)
    *   [CreateCachedContentConfig](./interfaces/types.CreateCachedContentConfig.html)
    *   [CreateCachedContentParameters](./interfaces/types.CreateCachedContentParameters.html)
    *   [CreateChatParameters](./interfaces/types.CreateChatParameters.html)
    *   [CreateEmbeddingsBatchJobConfig](./interfaces/types.CreateEmbeddingsBatchJobConfig.html)
    *   [CreateEmbeddingsBatchJobParameters](./interfaces/types.CreateEmbeddingsBatchJobParameters.html)
    *   [CreateFileConfig](./interfaces/types.CreateFileConfig.html)
    *   [CreateFileParameters](./interfaces/types.CreateFileParameters.html)
    *   [CreateFileSearchStoreConfig](./interfaces/types.CreateFileSearchStoreConfig.html)
    *   [CreateFileSearchStoreParameters](./interfaces/types.CreateFileSearchStoreParameters.html)
    *   [CreateTuningJobConfig](./interfaces/types.CreateTuningJobConfig.html)
    *   [CreateTuningJobParameters](./interfaces/types.CreateTuningJobParameters.html)
    *   [CreateTuningJobParametersPrivate](./interfaces/types.CreateTuningJobParametersPrivate.html)
    *   [CustomMetadata](./interfaces/types.CustomMetadata.html)
    *   [DatasetDistribution](./interfaces/types.DatasetDistribution.html)
    *   [DatasetDistributionDistributionBucket](./interfaces/types.DatasetDistributionDistributionBucket.html)
    *   [DatasetStats](./interfaces/types.DatasetStats.html)
    *   [DeleteBatchJobConfig](./interfaces/types.DeleteBatchJobConfig.html)
    *   [DeleteBatchJobParameters](./interfaces/types.DeleteBatchJobParameters.html)
    *   [DeleteCachedContentConfig](./interfaces/types.DeleteCachedContentConfig.html)
    *   [DeleteCachedContentParameters](./interfaces/types.DeleteCachedContentParameters.html)
    *   [DeleteDocumentConfig](./interfaces/types.DeleteDocumentConfig.html)
    *   [DeleteDocumentParameters](./interfaces/types.DeleteDocumentParameters.html)
    *   [DeleteFileConfig](./interfaces/types.DeleteFileConfig.html)
    *   [DeleteFileParameters](./interfaces/types.DeleteFileParameters.html)
    *   [DeleteFileSearchStoreConfig](./interfaces/types.DeleteFileSearchStoreConfig.html)
    *   [DeleteFileSearchStoreParameters](./interfaces/types.DeleteFileSearchStoreParameters.html)
    *   [DeleteModelConfig](./interfaces/types.DeleteModelConfig.html)
    *   [DeleteModelParameters](./interfaces/types.DeleteModelParameters.html)
    *   [DeleteResourceJob](./interfaces/types.DeleteResourceJob.html)
    *   [DistillationDataStats](./interfaces/types.DistillationDataStats.html)
    *   [Document](./interfaces/types.Document.html)
    *   [DownloadFileConfig](./interfaces/types.DownloadFileConfig.html)
    *   [DownloadFileParameters](./interfaces/types.DownloadFileParameters.html)
    *   [DynamicRetrievalConfig](./interfaces/types.DynamicRetrievalConfig.html)
    *   [EditImageConfig](./interfaces/types.EditImageConfig.html)
    *   [EditImageParameters](./interfaces/types.EditImageParameters.html)
    *   [EmbedContentBatch](./interfaces/types.EmbedContentBatch.html)
    *   [EmbedContentConfig](./interfaces/types.EmbedContentConfig.html)
    *   [EmbedContentMetadata](./interfaces/types.EmbedContentMetadata.html)
    *   [EmbedContentParameters](./interfaces/types.EmbedContentParameters.html)
    *   [EmbeddingsBatchJobSource](./interfaces/types.EmbeddingsBatchJobSource.html)
    *   [EncryptionSpec](./interfaces/types.EncryptionSpec.html)
    *   [Endpoint](./interfaces/types.Endpoint.html)
    *   [EnterpriseWebSearch](./interfaces/types.EnterpriseWebSearch.html)
    *   [EntityLabel](./interfaces/types.EntityLabel.html)
    *   [ExecutableCode](./interfaces/types.ExecutableCode.html)
    *   [ExternalApi](./interfaces/types.ExternalApi.html)
    *   [ExternalApiElasticSearchParams](./interfaces/types.ExternalApiElasticSearchParams.html)
    *   [ExternalApiSimpleSearchParams](./interfaces/types.ExternalApiSimpleSearchParams.html)
    *   [FetchPredictOperationConfig](./interfaces/types.FetchPredictOperationConfig.html)
    *   [FetchPredictOperationParameters](./interfaces/types.FetchPredictOperationParameters.html)
    *   [File](./interfaces/types.File.html)
    *   [FileData](./interfaces/types.FileData.html)
    *   [FileSearch](./interfaces/types.FileSearch.html)
    *   [FileSearchStore](./interfaces/types.FileSearchStore.html)
    *   [FileStatus](./interfaces/types.FileStatus.html)
    *   [FunctionCall](./interfaces/types.FunctionCall.html)
    *   [FunctionCallingConfig](./interfaces/types.FunctionCallingConfig.html)
    *   [FunctionDeclaration](./interfaces/types.FunctionDeclaration.html)
    *   [GeminiPreferenceExample](./interfaces/types.GeminiPreferenceExample.html)
    *   [GeminiPreferenceExampleCompletion](./interfaces/types.GeminiPreferenceExampleCompletion.html)
    *   [GenerateContentConfig](./interfaces/types.GenerateContentConfig.html)
    *   [GenerateContentParameters](./interfaces/types.GenerateContentParameters.html)
    *   [GeneratedImage](./interfaces/types.GeneratedImage.html)
    *   [GeneratedImageMask](./interfaces/types.GeneratedImageMask.html)
    *   [GeneratedVideo](./interfaces/types.GeneratedVideo.html)
    *   [GenerateImagesConfig](./interfaces/types.GenerateImagesConfig.html)
    *   [GenerateImagesParameters](./interfaces/types.GenerateImagesParameters.html)
    *   [GenerateVideosConfig](./interfaces/types.GenerateVideosConfig.html)
    *   [GenerateVideosParameters](./interfaces/types.GenerateVideosParameters.html)
    *   [GenerateVideosSource](./interfaces/types.GenerateVideosSource.html)
    *   [GenerationConfig](./interfaces/types.GenerationConfig.html)
    *   [GenerationConfigRoutingConfig](./interfaces/types.GenerationConfigRoutingConfig.html)
    *   [GenerationConfigRoutingConfigAutoRoutingMode](./interfaces/types.GenerationConfigRoutingConfigAutoRoutingMode.html)
    *   [GenerationConfigRoutingConfigManualRoutingMode](./interfaces/types.GenerationConfigRoutingConfigManualRoutingMode.html)
    *   [GenerationConfigThinkingConfig](./interfaces/types.GenerationConfigThinkingConfig.html)
    *   [GetBatchJobConfig](./interfaces/types.GetBatchJobConfig.html)
    *   [GetBatchJobParameters](./interfaces/types.GetBatchJobParameters.html)
    *   [GetCachedContentConfig](./interfaces/types.GetCachedContentConfig.html)
    *   [GetCachedContentParameters](./interfaces/types.GetCachedContentParameters.html)
    *   [GetDocumentConfig](./interfaces/types.GetDocumentConfig.html)
    *   [GetDocumentParameters](./interfaces/types.GetDocumentParameters.html)
    *   [GetFileConfig](./interfaces/types.GetFileConfig.html)
    *   [GetFileParameters](./interfaces/types.GetFileParameters.html)
    *   [GetFileSearchStoreConfig](./interfaces/types.GetFileSearchStoreConfig.html)
    *   [GetFileSearchStoreParameters](./interfaces/types.GetFileSearchStoreParameters.html)
    *   [GetModelConfig](./interfaces/types.GetModelConfig.html)
    *   [GetModelParameters](./interfaces/types.GetModelParameters.html)
    *   [GetOperationConfig](./interfaces/types.GetOperationConfig.html)
    *   [GetOperationParameters](./interfaces/types.GetOperationParameters.html)
    *   [GetTuningJobConfig](./interfaces/types.GetTuningJobConfig.html)
    *   [GetTuningJobParameters](./interfaces/types.GetTuningJobParameters.html)
    *   [GoogleMaps](./interfaces/types.GoogleMaps.html)
    *   [GoogleRpcStatus](./interfaces/types.GoogleRpcStatus.html)
    *   [GoogleSearch](./interfaces/types.GoogleSearch.html)
    *   [GoogleSearchRetrieval](./interfaces/types.GoogleSearchRetrieval.html)
    *   [GoogleTypeDate](./interfaces/types.GoogleTypeDate.html)
    *   [GroundingChunk](./interfaces/types.GroundingChunk.html)
    *   [GroundingChunkMaps](./interfaces/types.GroundingChunkMaps.html)
    *   [GroundingChunkMapsPlaceAnswerSources](./interfaces/types.GroundingChunkMapsPlaceAnswerSources.html)
    *   [GroundingChunkMapsPlaceAnswerSourcesAuthorAttribution](./interfaces/types.GroundingChunkMapsPlaceAnswerSourcesAuthorAttribution.html)
    *   [GroundingChunkMapsPlaceAnswerSourcesReviewSnippet](./interfaces/types.GroundingChunkMapsPlaceAnswerSourcesReviewSnippet.html)
    *   [GroundingChunkRetrievedContext](./interfaces/types.GroundingChunkRetrievedContext.html)
    *   [GroundingChunkWeb](./interfaces/types.GroundingChunkWeb.html)
    *   [GroundingMetadata](./interfaces/types.GroundingMetadata.html)
    *   [GroundingMetadataSourceFlaggingUri](./interfaces/types.GroundingMetadataSourceFlaggingUri.html)
    *   [GroundingSupport](./interfaces/types.GroundingSupport.html)
    *   [HttpOptions](./interfaces/types.HttpOptions.html)
    *   [Image](./interfaces/types.Image.html)
    *   [ImageConfig](./interfaces/types.ImageConfig.html)
    *   [ImportFileConfig](./interfaces/types.ImportFileConfig.html)
    *   [ImportFileParameters](./interfaces/types.ImportFileParameters.html)
    *   [InlinedRequest](./interfaces/types.InlinedRequest.html)
    *   [Interval](./interfaces/types.Interval.html)
    *   [JobError](./interfaces/types.JobError.html)
    *   [LatLng](./interfaces/types.LatLng.html)
    *   [ListBatchJobsConfig](./interfaces/types.ListBatchJobsConfig.html)
    *   [ListBatchJobsParameters](./interfaces/types.ListBatchJobsParameters.html)
    *   [ListCachedContentsConfig](./interfaces/types.ListCachedContentsConfig.html)
    *   [ListCachedContentsParameters](./interfaces/types.ListCachedContentsParameters.html)
    *   [ListDocumentsConfig](./interfaces/types.ListDocumentsConfig.html)
    *   [ListDocumentsParameters](./interfaces/types.ListDocumentsParameters.html)
    *   [ListFilesConfig](./interfaces/types.ListFilesConfig.html)
    *   [ListFileSearchStoresConfig](./interfaces/types.ListFileSearchStoresConfig.html)
    *   [ListFileSearchStoresParameters](./interfaces/types.ListFileSearchStoresParameters.html)
    *   [ListFilesParameters](./interfaces/types.ListFilesParameters.html)
    *   [ListModelsConfig](./interfaces/types.ListModelsConfig.html)
    *   [ListModelsParameters](./interfaces/types.ListModelsParameters.html)
    *   [ListTuningJobsConfig](./interfaces/types.ListTuningJobsConfig.html)
    *   [ListTuningJobsParameters](./interfaces/types.ListTuningJobsParameters.html)
    *   [LiveCallbacks](./interfaces/types.LiveCallbacks.html)
    *   [LiveClientContent](./interfaces/types.LiveClientContent.html)
    *   [LiveClientMessage](./interfaces/types.LiveClientMessage.html)
    *   [LiveClientRealtimeInput](./interfaces/types.LiveClientRealtimeInput.html)
    *   [LiveClientSetup](./interfaces/types.LiveClientSetup.html)
    *   [LiveConnectConfig](./interfaces/types.LiveConnectConfig.html)
    *   [LiveConnectConstraints](./interfaces/types.LiveConnectConstraints.html)
    *   [LiveConnectParameters](./interfaces/types.LiveConnectParameters.html)
    *   [LiveMusicCallbacks](./interfaces/types.LiveMusicCallbacks.html)
    *   [LiveMusicClientContent](./interfaces/types.LiveMusicClientContent.html)
    *   [LiveMusicClientMessage](./interfaces/types.LiveMusicClientMessage.html)
    *   [LiveMusicClientSetup](./interfaces/types.LiveMusicClientSetup.html)
    *   [LiveMusicConnectParameters](./interfaces/types.LiveMusicConnectParameters.html)
    *   [LiveMusicFilteredPrompt](./interfaces/types.LiveMusicFilteredPrompt.html)
    *   [LiveMusicGenerationConfig](./interfaces/types.LiveMusicGenerationConfig.html)
    *   [LiveMusicServerContent](./interfaces/types.LiveMusicServerContent.html)
    *   [LiveMusicServerSetupComplete](./interfaces/types.LiveMusicServerSetupComplete.html)
    *   [LiveMusicSetConfigParameters](./interfaces/types.LiveMusicSetConfigParameters.html)
    *   [LiveMusicSetWeightedPromptsParameters](./interfaces/types.LiveMusicSetWeightedPromptsParameters.html)
    *   [LiveMusicSourceMetadata](./interfaces/types.LiveMusicSourceMetadata.html)
    *   [LiveSendClientContentParameters](./interfaces/types.LiveSendClientContentParameters.html)
    *   [LiveSendRealtimeInputParameters](./interfaces/types.LiveSendRealtimeInputParameters.html)
    *   [LiveServerContent](./interfaces/types.LiveServerContent.html)
    *   [LiveServerGoAway](./interfaces/types.LiveServerGoAway.html)
    *   [LiveServerSessionResumptionUpdate](./interfaces/types.LiveServerSessionResumptionUpdate.html)
    *   [LiveServerSetupComplete](./interfaces/types.LiveServerSetupComplete.html)
    *   [LiveServerToolCall](./interfaces/types.LiveServerToolCall.html)
    *   [LiveServerToolCallCancellation](./interfaces/types.LiveServerToolCallCancellation.html)
    *   [LogprobsResult](./interfaces/types.LogprobsResult.html)
    *   [LogprobsResultCandidate](./interfaces/types.LogprobsResultCandidate.html)
    *   [LogprobsResultTopCandidates](./interfaces/types.LogprobsResultTopCandidates.html)
    *   [MaskReferenceConfig](./interfaces/types.MaskReferenceConfig.html)
    *   [ModalityTokenCount](./interfaces/types.ModalityTokenCount.html)
    *   [Model](./interfaces/types.Model.html)
    *   [ModelSelectionConfig](./interfaces/types.ModelSelectionConfig.html)
    *   [MultiSpeakerVoiceConfig](./interfaces/types.MultiSpeakerVoiceConfig.html)
    *   [Operation](./interfaces/types.Operation.html)
    *   [OperationFromAPIResponseParameters](./interfaces/types.OperationFromAPIResponseParameters.html)
    *   [OperationGetParameters](./interfaces/types.OperationGetParameters.html)
    *   [Part](./interfaces/types.Part.html)
    *   [PartialArg](./interfaces/types.PartialArg.html)
    *   [PartMediaResolution](./interfaces/types.PartMediaResolution.html)
    *   [PartnerModelTuningSpec](./interfaces/types.PartnerModelTuningSpec.html)
    *   [PrebuiltVoiceConfig](./interfaces/types.PrebuiltVoiceConfig.html)
    *   [PreferenceOptimizationDataStats](./interfaces/types.PreferenceOptimizationDataStats.html)
    *   [PreferenceOptimizationHyperParameters](./interfaces/types.PreferenceOptimizationHyperParameters.html)
    *   [PreferenceOptimizationSpec](./interfaces/types.PreferenceOptimizationSpec.html)
    *   [PreTunedModel](./interfaces/types.PreTunedModel.html)
    *   [ProactivityConfig](./interfaces/types.ProactivityConfig.html)
    *   [ProductImage](./interfaces/types.ProductImage.html)
    *   [RagChunk](./interfaces/types.RagChunk.html)
    *   [RagChunkPageSpan](./interfaces/types.RagChunkPageSpan.html)
    *   [RagRetrievalConfig](./interfaces/types.RagRetrievalConfig.html)
    *   [RagRetrievalConfigFilter](./interfaces/types.RagRetrievalConfigFilter.html)
    *   [RagRetrievalConfigHybridSearch](./interfaces/types.RagRetrievalConfigHybridSearch.html)
    *   [RagRetrievalConfigRanking](./interfaces/types.RagRetrievalConfigRanking.html)
    *   [RagRetrievalConfigRankingLlmRanker](./interfaces/types.RagRetrievalConfigRankingLlmRanker.html)
    *   [RagRetrievalConfigRankingRankService](./interfaces/types.RagRetrievalConfigRankingRankService.html)
    *   [RealtimeInputConfig](./interfaces/types.RealtimeInputConfig.html)
    *   [RecontextImageConfig](./interfaces/types.RecontextImageConfig.html)
    *   [RecontextImageParameters](./interfaces/types.RecontextImageParameters.html)
    *   [RecontextImageSource](./interfaces/types.RecontextImageSource.html)
    *   [ReplayFile](./interfaces/types.ReplayFile.html)
    *   [ReplayInteraction](./interfaces/types.ReplayInteraction.html)
    *   [ReplayRequest](./interfaces/types.ReplayRequest.html)
    *   [ReplicatedVoiceConfig](./interfaces/types.ReplicatedVoiceConfig.html)
    *   [Retrieval](./interfaces/types.Retrieval.html)
    *   [RetrievalConfig](./interfaces/types.RetrievalConfig.html)
    *   [RetrievalMetadata](./interfaces/types.RetrievalMetadata.html)
    *   [SafetyAttributes](./interfaces/types.SafetyAttributes.html)
    *   [SafetyRating](./interfaces/types.SafetyRating.html)
    *   [SafetySetting](./interfaces/types.SafetySetting.html)
    *   [Schema](./interfaces/types.Schema.html)
    *   [ScribbleImage](./interfaces/types.ScribbleImage.html)
    *   [SearchEntryPoint](./interfaces/types.SearchEntryPoint.html)
    *   [Segment](./interfaces/types.Segment.html)
    *   [SegmentImageConfig](./interfaces/types.SegmentImageConfig.html)
    *   [SegmentImageParameters](./interfaces/types.SegmentImageParameters.html)
    *   [SegmentImageSource](./interfaces/types.SegmentImageSource.html)
    *   [SendMessageParameters](./interfaces/types.SendMessageParameters.html)
    *   [SessionResumptionConfig](./interfaces/types.SessionResumptionConfig.html)
    *   [SlidingWindow](./interfaces/types.SlidingWindow.html)
    *   [SpeakerVoiceConfig](./interfaces/types.SpeakerVoiceConfig.html)
    *   [SpeechConfig](./interfaces/types.SpeechConfig.html)
    *   [StringList](./interfaces/types.StringList.html)
    *   [StyleReferenceConfig](./interfaces/types.StyleReferenceConfig.html)
    *   [SubjectReferenceConfig](./interfaces/types.SubjectReferenceConfig.html)
    *   [SupervisedHyperParameters](./interfaces/types.SupervisedHyperParameters.html)
    *   [SupervisedTuningDatasetDistribution](./interfaces/types.SupervisedTuningDatasetDistribution.html)
    *   [SupervisedTuningDatasetDistributionDatasetBucket](./interfaces/types.SupervisedTuningDatasetDistributionDatasetBucket.html)
    *   [SupervisedTuningDataStats](./interfaces/types.SupervisedTuningDataStats.html)
    *   [SupervisedTuningSpec](./interfaces/types.SupervisedTuningSpec.html)
    *   [TestTableFile](./interfaces/types.TestTableFile.html)
    *   [TestTableItem](./interfaces/types.TestTableItem.html)
    *   [ThinkingConfig](./interfaces/types.ThinkingConfig.html)
    *   [TokensInfo](./interfaces/types.TokensInfo.html)
    *   [Tool](./interfaces/types.Tool.html)
    *   [ToolCodeExecution](./interfaces/types.ToolCodeExecution.html)
    *   [ToolConfig](./interfaces/types.ToolConfig.html)
    *   [Transcription](./interfaces/types.Transcription.html)
    *   [TunedModel](./interfaces/types.TunedModel.html)
    *   [TunedModelCheckpoint](./interfaces/types.TunedModelCheckpoint.html)
    *   [TunedModelInfo](./interfaces/types.TunedModelInfo.html)
    *   [TuningDataset](./interfaces/types.TuningDataset.html)
    *   [TuningDataStats](./interfaces/types.TuningDataStats.html)
    *   [TuningExample](./interfaces/types.TuningExample.html)
    *   [TuningJob](./interfaces/types.TuningJob.html)
    *   [TuningOperation](./interfaces/types.TuningOperation.html)
    *   [TuningValidationDataset](./interfaces/types.TuningValidationDataset.html)
    *   [UpdateCachedContentConfig](./interfaces/types.UpdateCachedContentConfig.html)
    *   [UpdateCachedContentParameters](./interfaces/types.UpdateCachedContentParameters.html)
    *   [UpdateModelConfig](./interfaces/types.UpdateModelConfig.html)
    *   [UpdateModelParameters](./interfaces/types.UpdateModelParameters.html)
    *   [UploadFileConfig](./interfaces/types.UploadFileConfig.html)
    *   [UploadFileParameters](./interfaces/types.UploadFileParameters.html)
    *   [UploadToFileSearchStoreConfig](./interfaces/types.UploadToFileSearchStoreConfig.html)
    *   [UploadToFileSearchStoreParameters](./interfaces/types.UploadToFileSearchStoreParameters.html)
    *   [UpscaleImageConfig](./interfaces/types.UpscaleImageConfig.html)
    *   [UpscaleImageParameters](./interfaces/types.UpscaleImageParameters.html)
    *   [UrlContext](./interfaces/types.UrlContext.html)
    *   [UrlContextMetadata](./interfaces/types.UrlContextMetadata.html)
    *   [UrlMetadata](./interfaces/types.UrlMetadata.html)
    *   [UsageMetadata](./interfaces/types.UsageMetadata.html)
    *   [VeoHyperParameters](./interfaces/types.VeoHyperParameters.html)
    *   [VeoTuningSpec](./interfaces/types.VeoTuningSpec.html)
    *   [VertexAISearch](./interfaces/types.VertexAISearch.html)
    *   [VertexAISearchDataStoreSpec](./interfaces/types.VertexAISearchDataStoreSpec.html)
    *   [VertexRagStore](./interfaces/types.VertexRagStore.html)
    *   [VertexRagStoreRagResource](./interfaces/types.VertexRagStoreRagResource.html)
    *   [Video](./interfaces/types.Video.html)
    *   [VideoGenerationMask](./interfaces/types.VideoGenerationMask.html)
    *   [VideoGenerationReferenceImage](./interfaces/types.VideoGenerationReferenceImage.html)
    *   [VideoMetadata](./interfaces/types.VideoMetadata.html)
    *   [VoiceActivity](./interfaces/types.VoiceActivity.html)
    *   [VoiceActivityDetectionSignal](./interfaces/types.VoiceActivityDetectionSignal.html)
    *   [VoiceConfig](./interfaces/types.VoiceConfig.html)
    *   [WeightedPrompt](./interfaces/types.WeightedPrompt.html)
    *   [WhiteSpaceConfig](./interfaces/types.WhiteSpaceConfig.html)
    *   [BatchJobDestinationUnion](./types/types.BatchJobDestinationUnion.html)
    *   [BatchJobSourceUnion](./types/types.BatchJobSourceUnion.html)
    *   [BlobImageUnion](./types/types.BlobImageUnion.html)
    *   [ContentListUnion](./types/types.ContentListUnion.html)
    *   [ContentUnion](./types/types.ContentUnion.html)
    *   [DownloadableFileUnion](./types/types.DownloadableFileUnion.html)
    *   [PartListUnion](./types/types.PartListUnion.html)
    *   [PartUnion](./types/types.PartUnion.html)
    *   [ReferenceImage](./types/types.ReferenceImage.html)
    *   [SchemaUnion](./types/types.SchemaUnion.html)
    *   [SpeechConfigUnion](./types/types.SpeechConfigUnion.html)
    *   [ToolListUnion](./types/types.ToolListUnion.html)
    *   [ToolUnion](./types/types.ToolUnion.html)
    *   [createFunctionResponsePartFromBase64](./functions/types.createFunctionResponsePartFromBase64.html)
    *   [createFunctionResponsePartFromUri](./functions/types.createFunctionResponsePartFromUri.html)
    *   [createModelContent](./functions/types.createModelContent.html)
    *   [createPartFromBase64](./functions/types.createPartFromBase64.html)
    *   [createPartFromCodeExecutionResult](./functions/types.createPartFromCodeExecutionResult.html)
    *   [createPartFromExecutableCode](./functions/types.createPartFromExecutableCode.html)
    *   [createPartFromFunctionCall](./functions/types.createPartFromFunctionCall.html)
    *   [createPartFromFunctionResponse](./functions/types.createPartFromFunctionResponse.html)
    *   [createPartFromText](./functions/types.createPartFromText.html)
    *   [createPartFromUri](./functions/types.createPartFromUri.html)
    *   [createUserContent](./functions/types.createUserContent.html)
    

Generated using [TypeDoc](https://typedoc.org/)

MMNEPVFCICPMFPCPTTAAATR