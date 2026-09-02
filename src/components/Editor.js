import React, {
  useEffect,
  useRef,
} from "react";

import {
  EditorView,
  basicSetup,
} from "codemirror";

import {
  javascript,
} from "@codemirror/lang-javascript";

import {
  python,
} from "@codemirror/lang-python";

import {
  java,
} from "@codemirror/lang-java";

import {
  cpp,
} from "@codemirror/lang-cpp";

import {
  html,
} from "@codemirror/lang-html";

import {
  oneDark,
} from "@codemirror/theme-one-dark";

import {
  EditorState,
} from "@codemirror/state";

import ACTIONS from "../Actions";


/* =====================================
   LIGHT CODEMIRROR THEME
===================================== */

const lightEditorTheme =
  EditorView.theme(
    {
      "&": {
        backgroundColor: "#ffffff",
        color: "#1e293b",
      },

      ".cm-scroller": {
        backgroundColor: "#ffffff",
      },

      ".cm-content": {
        caretColor: "#1e293b",
      },

      ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: "#1e293b",
      },

      ".cm-selectionBackground": {
        backgroundColor:
          "#dbeafe !important",
      },

      "&.cm-focused .cm-selectionBackground": {
        backgroundColor:
          "#bfdbfe !important",
      },

      ".cm-gutters": {
        backgroundColor: "#f8fafc",
        color: "#64748b",
        borderRight:
          "1px solid #e2e8f0",
      },

      ".cm-activeLineGutter": {
        backgroundColor: "#f1f5f9",
        color: "#334155",
      },

      ".cm-activeLine": {
        backgroundColor: "#fafcff",
      },
    },

    {
      dark: false,
    }
  );


/* =====================================
   EDITOR COMPONENT
===================================== */

const Editor = ({
  socketRef,
  socket,
  roomId,
  language,
  theme,
  onCodeChange,
}) => {
  const editorRef = useRef(null);

  const viewRef = useRef(null);

  const updatingRef = useRef(false);

  const socketRefLatest =
    useRef(socketRef);

  const roomIdRef =
    useRef(roomId);

  const codeRef = useRef(
    "// Start coding here...\n"
  );


  /* =====================================
     UPDATE REFERENCES
  ===================================== */

  useEffect(() => {
    socketRefLatest.current =
      socketRef;

    roomIdRef.current =
      roomId;
  }, [socketRef, roomId]);


  /* =====================================
     LANGUAGE EXTENSION
  ===================================== */

  const getLanguageExtension = (
    selectedLanguage
  ) => {
    switch (selectedLanguage) {
      case "python":
        return python();

      case "java":
        return java();

      case "cpp":
        return cpp();

      case "html":
        return html();

      case "javascript":
      default:
        return javascript({
          jsx: true,
        });
    }
  };


  /* =====================================
     CREATE EDITOR
  ===================================== */

  useEffect(() => {
    if (!editorRef.current) return;

    const startState =
      EditorState.create({
        doc: codeRef.current,

        extensions: [
          basicSetup,

          getLanguageExtension(
            language
          ),

          theme === "dark"
            ? oneDark
            : lightEditorTheme,

          EditorView.lineWrapping,

          EditorView.updateListener.of(
            (update) => {
              if (
                update.docChanged &&
                !updatingRef.current
              ) {
                const newCode =
                  update.state.doc.toString();

                codeRef.current =
                  newCode;

                if (onCodeChange) {
                  onCodeChange(newCode);
                }

                const currentSocket =
                  socketRefLatest.current
                    ?.current;

                if (currentSocket) {
                  currentSocket.emit(
                    ACTIONS.CODE_CHANGE,
                    {
                      roomId:
                        roomIdRef.current,

                      code: newCode,
                    }
                  );
                }
              }
            }
          ),
        ],
      });

    const view =
      new EditorView({
        state: startState,
        parent: editorRef.current,
      });

    viewRef.current = view;

    return () => {
      if (viewRef.current) {
        codeRef.current =
          viewRef.current.state.doc.toString();
      }

      view.destroy();

      viewRef.current = null;
    };
  }, [
    language,
    theme,
    onCodeChange,
  ]);


  /* =====================================
     RECEIVE REAL-TIME CODE
  ===================================== */

  useEffect(() => {
    if (!socket) return;

    const updateEditorCode = (
      incomingCode
    ) => {
      if (
        viewRef.current &&
        incomingCode !==
          viewRef.current.state.doc.toString()
      ) {
        updatingRef.current = true;

        viewRef.current.dispatch({
          changes: {
            from: 0,

            to:
              viewRef.current.state.doc
                .length,

            insert: incomingCode,
          },
        });

        codeRef.current =
          incomingCode;

        if (onCodeChange) {
          onCodeChange(incomingCode);
        }

        updatingRef.current = false;
      }
    };

    const handleSyncCode = ({
      code,
    }) => {
      updateEditorCode(code);
    };

    const handleCodeChange = ({
      code,
    }) => {
      updateEditorCode(code);
    };

    socket.on(
      ACTIONS.SYNC_CODE,
      handleSyncCode
    );

    socket.on(
      ACTIONS.CODE_CHANGE,
      handleCodeChange
    );

    return () => {
      socket.off(
        ACTIONS.SYNC_CODE,
        handleSyncCode
      );

      socket.off(
        ACTIONS.CODE_CHANGE,
        handleCodeChange
      );
    };
  }, [socket, onCodeChange]);


  return (
    <div
      ref={editorRef}
      className="codeMirrorRoot"
    />
  );
};

export default Editor;