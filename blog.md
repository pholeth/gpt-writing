# Develop an app with ChatGPT

I think writing is the best method to learn a new language. I usually want to have a place where I can find the short paragraphs with random topics to practice writing and have a person to review my writings. However, it is not easy in practice to have those, unless you go to a dedicated writing class. But thanks to ChatGPT and OpenAI, they provided an amazing technology so we can do all this for free (not really but extremely small fee). So this article is going to show how to develop a Web application with ChatGPT or OpenAI Api.

## About the App

Our app would be simple. There is only one page and the user is asked to input the paragraph size (number of sentences) and the difficulty level (easy, medium and hard) and generate a paragraph to practice writing. After the writing is done, users can select to check if the writing is correct and possibly provide a corrections.

The app is built using React and OpenAI API for Javascript for simplicity and the main focus is more to show how to build a Web app that interacts with ChatGPT to develop meaningful applications with the power of AI. The article assumes that you already knew about React and Web development, so all trivial tasks such as creating components in React are not mentioned.

### Get started

To get started, first create a new React app, there is no limitation on which tool to create the React app, but for quick and simplicity, `create-react-app` is proven to be quite a popular tool to use. Use the following command to create new React app (required to have NodeJS installed first)

And also check it can be run

```
$ npx create-react-app myGptWriting
$ cd myGptWrting
$ npm start
```

If the app is generated and can be run, now let's talk about the OpenAI API

## OpenAI API

OpenAI offers an API for paid subscriptions (free trial) to interact with the ChatGPT. Here are the main terms used in app and also in ChatGPT.

- **prompt** is like the query we use to query database, for example of a prompt "_Translate this text to Finnish_" or "_Calculate the result of this operation_" .etc...

- **completion** refer to the results sent back from ChatGPT. There are various completion types, like _TextCompletion_ or _ChatCompletion_ for replies like we do chat with chatGPT. It has the name of completion probably due the everything is a generation from a model rather than an actual result of a calculation.

- **model** ChatGPT is an AI model and it is trained for various purposes, and thus there are different models optimized for different use cases, for example models optimized for chat are _gpt-3.5-turbo_ or _gpt-4_ or _ada_, _davinci_ for text completions. Each comes with a pro and con and with differnt price when using the API, i.e one is faster but less accurate or one is most accurate but slower .etc...

- **temperature** A parameter used in the API query used to indicate the randomness of the prompt (value is from zero to 1). Zero means it is least random and we can expect the same result for the same input and 1 means it is very random.

When making the OpenAI API, we will send in the _prompt_, together with the _model_ and _the user role_ (required in chat completion and it has 3 values: _system_, _assistant_ and _user_) and the API return back the _completion_ results. The result is an array but has only one item unless we specifiy more.

## The Paragraph Generation

The first part in the app is to create 2 drop-down selectors and a button that will generate the paragraph. It is a trivial step in React to add those components into the main page and all the UI frameworks can be used in this step, in this article it will use the Mantine UI framework for React.

So now, we have the UI and need to fill in the handler for the button click. We will make a query to OpenAI API to generate the paragraph that we need. Assuming the paragraph size and the difficulty level is stored as the state and ready to use as followed,

```js
const [size, setSize] = useState(1);
const [level, setLevel] = useState("medium");

// the paragraph to generate
const [paragraph, setParagraph] = useState("");
```

First, we need to install the OpenAI SDK package

```
$ npm install openai
```

Then import and configure the OpenAI client,

```js
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY || "YOUR-OPENAI-API-KEY",
});

const openai = new OpenAIApi(configuration);
```

In order to obtain the Api key, go to [https://platform.openai.com/docs/api-reference](https://platform.openai.com/docs/api-reference) and register the account and create a new API key, it has a free trial for 30 days. Even with paid subscription, personal use is also very cheap.

After obtaining the Api key, either use it directly in the code (just to demo, not recommended in production use) or put it via the environment variable.

So now, we are ready to use the API. At this time of this writing, it seems that the model `gpt-3.5-turbo` has the cheapest price and also serve the purpose, thus it is chosen for this app. From that, we have to to use the chat completion API query in order to use this model. Note that, this model and this completion is mostly for chat generation.

Here is the snippet to make the API call.

```js
const response = await openai.createChatCompletion({
  model: "gpt-3.5-turbo",
  temperature: 1, // we want the text to be most randomized
  messages: [
    {
      role: "user",
      content: `Generate a paragraph (in English) in a random topic with maximum ${size} lines and at level ${level}`,
    },
  ],
});

setParagraph(response.data.choices[0].message.content);
```

In the first statement, we specified the chat completion call, we passed in the model and the array of _messages_. Each message comes with a _role_ and the _content_ (prompt). Especially, in this call, the `temperature` is set to 1 to indicate that we want the results to be fully randomized, we don't want the same paragraph returned everytime. Finally, we passed the results (`choices` - an array of completions but usually only 1 item returned)

The next question is how to make this kind of prompt. Open AI has a limited free online course on how to create those prompts at [https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/](https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/) where it teachs how to make the prompts so that the ChatGPT can effectively understand it. There is also now a new branch of title, called _prompt engineer_ :D

So that is, we made the first prompt or the first interaction with ChatGPT. Wait for a while, we should get the result back and there the paragraph returned.

## The Writing Review

In the first part, we interacted with ChatGPT to generate for us the paragraph. Now we want it to review our writing work and perhaps give some corrections. So now we need a text input component and a button to trigger the reivew. It is again trivial task in React and assume that the writing is stored in state and ready to use as followed

```js
// the writing work
const [writing, setWriting] = useState("");

// the reviews's text
const [review, setReview] = useState("");
```

Next is the handler when press on the button,

```js
const response = await openai.createChatCompletion({
  model: "gpt-3.5-turbo",
  temperature: 0,
  messages: [
    {
      role: "user",
      content: `Check and review the following writing which is translated from the original text:
        "${writing}"

        The original text: "${paragraph}".
        `,
    },
  ],
});
```

In this OpenAI call, the temperatur is set to zero since we want the result or the review to be consistent all the time. In this prompt, we injected our writing work and also the previous paragraph into the message. And that's it, that is how we can utilize the power of ChatGPT to create helpful applications. It is more in how we know to write the right prompt so that ChatGPT can work most effective. Of course, there are a lot of more to learn (see the course above) in various tasks for ChatGPT.

## To wrap up

The app in my opinion is very useful in everyday work to help me learning new language. Even though the technical part in the app is very simple but it demonstrates one point, which is how easy nowadays to create a smart and helpful applications for daily life by utilizing the ChatGPT. Beside the model used in this app, there are a lot of models and different completions or cases (ImageCompletion) to try out for various purposes. The creativity is endless.

## Source code & screenshots

Here is the source code for working app

https://github.com/pholeth/gpt-writing

And the screenshots of the working app

![App screenshot](./docs/app-screenshot.png)
