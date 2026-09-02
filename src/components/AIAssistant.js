import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  Bot,
  Code2,
  Bug,
  Sparkles,
  FileText,
  Send,
  MessageSquare,
  Loader2,
  Copy,
  Check,
} from "lucide-react";

const AIAssistant = ({ code, language }) => {
  const [selectedAction, setSelectedAction] = useState(null);
  const [response, setResponse] = useState("");
  const [customQuestion, setCustomQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const actions = [
    {
      name: "Explain Code",
      icon: <Code2 size={18} />,
    },
    {
      name: "Find Bugs",
      icon: <Bug size={18} />,
    },
    {
      name: "Improve Code",
      icon: <Sparkles size={18} />,
    },
    {
      name: "Generate Docs",
      icon: <FileText size={18} />,
    },
  ];

  /* =====================================
     CALL AI API
  ===================================== */

  const callAI = async (action, question = "") => {
    if (!code || code.trim() === "") {
      setResponse(
        "Please write some code in the editor before using the AI Assistant."
      );
      return;
    }

    setLoading(true);
    setResponse("");
    setCopied(false);

    try {
      const apiResponse = await fetch(
        "http://localhost:5000/api/ai",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            language,
            action,
            customQuestion: question,
          }),
        }
      );

      const data = await apiResponse.json();

      if (!apiResponse.ok) {
        throw new Error(
          data.message ||
            "Something went wrong while processing your request."
        );
      }

      /*
        IMPORTANT:
        ReactMarkdown requires a string.

        This safely handles:
        - normal string responses
        - unexpected API values
        - null / undefined
        - object responses
      */

      let aiResponse = "";

      if (typeof data.response === "string") {
        aiResponse = data.response;
      } else if (data.response !== null && data.response !== undefined) {
        aiResponse = String(data.response);
      } else {
        aiResponse =
          "The AI did not return a response. Please try again.";
      }

      setResponse(aiResponse);
    } catch (error) {
      console.error("AI Request Error:", error);

      setResponse(
        error.message ||
          "Something went wrong while processing your AI request."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================
     ACTION BUTTON
  ===================================== */

  const handleAction = (action) => {
    setSelectedAction(action);
    callAI(action);
  };

  /* =====================================
     CUSTOM QUESTION
  ===================================== */

  const handleCustomQuestion = () => {
    if (!customQuestion.trim()) {
      setResponse(
        "Please enter a question for the AI Assistant."
      );
      return;
    }

    setSelectedAction("Ask AI");

    callAI(
      "Ask AI",
      customQuestion
    );
  };

  /* =====================================
     COPY RESPONSE
  ===================================== */

  const handleCopy = async () => {
    if (!response) return;

    try {
      await navigator.clipboard.writeText(
        typeof response === "string"
          ? response
          : String(response)
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Copy failed:",
        error
      );
    }
  };

  return (
    <div className="aiAssistant">

      {/* AI HEADER */}

      <div className="aiHeader">
        <Bot size={25} />

        <div>
          <h3>AI Code Assistant</h3>

          <p>
            Analyze, improve and understand
            your code
          </p>
        </div>
      </div>

      {/* AI ACTIONS */}

      <div className="aiActions">
        {actions.map((action) => (
          <button
            key={action.name}
            className={`aiActionButton ${
              selectedAction === action.name
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleAction(action.name)
            }
            disabled={loading}
          >
            {action.icon}

            <span>{action.name}</span>
          </button>
        ))}
      </div>

      {/* AI RESPONSE */}

      <div className="aiResponse">

        {loading ? (

          <div className="aiPlaceholder">
            <Loader2
              size={38}
              className="spinner"
            />

            <h3>Analyzing your code</h3>

            <p>
              The AI is reviewing your code.
              Please wait...
            </p>
          </div>

        ) : response ? (

          <div className="responseContainer">

            <div className="responseHeader">

              <span>
                {selectedAction || "AI"} Result
              </span>

              <button
                className="copyButton"
                onClick={handleCopy}
                title="Copy response"
              >
                {copied ? (
                  <Check size={17} />
                ) : (
                  <Copy size={17} />
                )}

                {copied
                  ? "Copied"
                  : "Copy"}
              </button>

            </div>

            {/* MARKDOWN RESPONSE */}

            <div className="responseContent">

              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
              >
                {typeof response === "string"
                  ? response
                  : String(response)}
              </ReactMarkdown>

            </div>

          </div>

        ) : (

          <div className="aiPlaceholder">
            <Bot size={46} />

            <h3>Ready to help</h3>

            <p>
              Select an action or ask a custom
              question about your code.
            </p>
          </div>

        )}

      </div>

      {/* CUSTOM QUESTION */}

      <div className="customAiSection">

        <div className="customAiTitle">
          <MessageSquare size={18} />

          <span>
            Ask AI about your code
          </span>
        </div>

        <textarea
          value={customQuestion}
          onChange={(e) =>
            setCustomQuestion(e.target.value)
          }
          placeholder="Example: How can I optimize this code?"
          disabled={loading}
        />

        <button
          className="askAiButton"
          onClick={handleCustomQuestion}
          disabled={
            loading ||
            !customQuestion.trim()
          }
        >

          {loading ? (
            <>
              <Loader2
                size={17}
                className="spinner"
              />

              Analyzing...
            </>
          ) : (
            <>
              <Send size={17} />

              Ask AI
            </>
          )}

        </button>

      </div>

    </div>
  );
};

export default AIAssistant;