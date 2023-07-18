import {
  Select,
  Badge,
  SimpleGrid,
  Button,
  Textarea,
  Text,
} from "@mantine/core";
import { useState } from "react";
import { Configuration, OpenAIApi } from "openai";

import "./App.css";

const configuration = new Configuration({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});

// helper to make query to OpenAI API
const useChatGPT = (configuration) => {
  const openai = new OpenAIApi(configuration);

  return {
    queryChatGPT: async (content, { temperature } = {}) => {
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo", // default model
        temperature,
        messages: [
          {
            role: "user",
            content,
          },
        ],
      });

      return response.data.choices[0].message.content;
    },
  };
};

function App() {
  const [size, setSize] = useState(3);
  const [level, setLevel] = useState("easy");
  const [paragraph, setParagraph] = useState("");
  const [review, setReview] = useState("");
  const [writing, setWriting] = useState("");
  const [words, setWords] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [practiseLoading, setPractiseLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [askLoading, setAskLoading] = useState(false);

  const { queryChatGPT } = useChatGPT(configuration);

  const sizeOptions = [1, 3, 5, 7, 9].map((size) => ({
    value: size,
    label: size,
  }));

  const levelOptions = ["Easy", "Medium", "Hard"].map((level) => ({
    value: level.toLowerCase(),
    label: level,
  }));

  const onGenerateParagraph = async () => {
    setPractiseLoading(true);

    const content = await queryChatGPT(
      `Generate a paragraph (in English) in a random daily topic with maximum ${size} lines and at level ${level}`,
      {
        temperature: 1, // we want the text to be most randomized
      }
    );

    setParagraph(content);
    setPractiseLoading(false);
  };

  const onReview = async () => {
    setReviewLoading(true);

    const content = await queryChatGPT(
      `
      The original text: "${paragraph}"

      Check and review the following writing which is translated from the original text:
      "${writing}"
      `,
      {
        temperature: 0, // we want the result to be consistent
      }
    );

    setReview(content);

    const json = await queryChatGPT(
      `Generate 3 new words related to the following writing's topic and output them as an array with key "word" in JSON format:
      "${writing}"`,
      {
        temperature: 1, // we want the text to be most randomized
      }
    );

    try {
      const data = JSON.parse(json);

      setWords((data.word || []).map((w) => w.word));
    } finally {
      setReviewLoading(false);
    }
  };

  const onAsk = async () => {
    setAskLoading(true);

    const answer = await queryChatGPT(question);

    setAnswer(answer);
    setAskLoading(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Practice Writing with ChatGPT</h1>

        {!process.env.REACT_APP_OPENAI_API_KEY && (
          <Badge color="red">
            Please setup the OpenAI API Key as instruction.
          </Badge>
        )}
      </header>

      <div className="App-main">
        <SimpleGrid cols={2}>
          <SimpleGrid cols={2}>
            <Select
              label="The paragraph size"
              placeholder="Pick the maximum sentences"
              data={sizeOptions}
              value={size}
              onChange={setSize}
            />

            <Select
              label="Level"
              placeholder="Pick the level"
              data={levelOptions}
              value={level}
              onChange={setLevel}
            />
          </SimpleGrid>

          <div className="buttons">
            <Button onClick={onGenerateParagraph} loading={practiseLoading}>
              Generate paragraph
            </Button>
          </div>
        </SimpleGrid>

        {paragraph && (
          <>
            <h4>Paragraph</h4>
            <Text fz="lg" c="blue" className="App-text">
              {paragraph}
            </Text>

            <SimpleGrid cols={2}>
              <Textarea
                placeholder="Translate text to your language"
                label="Translation"
                value={writing}
                onChange={(event) => setWriting(event.currentTarget.value)}
                withAsterisk
                autosize
                size="md"
                minRows={3}
              />

              <div className="buttons">
                <Button onClick={onReview} loading={reviewLoading}>
                  Check writing
                </Button>
              </div>
            </SimpleGrid>
          </>
        )}

        {review && (
          <>
            <h4>Review</h4>

            <Text fz="lg" c="orange" className="App-text">
              {review.split("\n").map((item, idx) => (
                <span key={idx}>
                  {item}
                  <br />
                </span>
              ))}
            </Text>

            {words.length > 0 && (
              <h5>
                Words to note: <b>{words.join(", ")}</b>
              </h5>
            )}

            <SimpleGrid cols={2}>
              <Textarea
                placeholder="Question"
                label="Ask more question"
                value={question}
                onChange={(event) => setQuestion(event.currentTarget.value)}
                autosize
                size="md"
                minRows={1}
              />

              <div className="buttons">
                <Button onClick={onAsk} loading={askLoading}>
                  Ask
                </Button>
              </div>
            </SimpleGrid>

            {answer && (
              <>
                <h4>Answer</h4>
                <Text fz="lg" c="orange" className="App-text">
                  {answer.split("\n").map((item, idx) => (
                    <span key={idx}>
                      {item}
                      <br />
                    </span>
                  ))}
                </Text>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
