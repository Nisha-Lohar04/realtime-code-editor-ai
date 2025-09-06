import React, { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorState } from "@codemirror/state";
import ACTIONS from '../Actions';

const Editor = ({ socketRef, roomId, onCodeChange }) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const updatingRef = useRef(false); // New ref to track remote updates

  useEffect(() => {
    if (!editorRef.current) return;

    const startState = EditorState.create({
      doc: "// Start coding here...\n",
      extensions: [
        basicSetup,
        javascript({ jsx: true }),
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !updatingRef.current) { // Only emit if change is local
            const code = update.state.doc.toString();
            onCodeChange(code);
            if (socketRef.current) {
              socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                roomId,
                code,
              });
            }
          }
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.SYNC_CODE, ({ code }) => {
        if (viewRef.current && code !== viewRef.current.state.doc.toString()) {
          updatingRef.current = true; // Set flag before remote update
          viewRef.current.dispatch({
            changes: { from: 0, to: viewRef.current.state.doc.length, insert: code },
          });
          updatingRef.current = false; // Reset flag after remote update
        }
      });

      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (viewRef.current && code !== viewRef.current.state.doc.toString()) {
          updatingRef.current = true; // Set flag before remote update
          viewRef.current.dispatch({
            changes: { from: 0, to: viewRef.current.state.doc.length, insert: code },
          });
          updatingRef.current = false; // Reset flag after remote update
        }
      });
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off(ACTIONS.SYNC_CODE);
        socketRef.current.off(ACTIONS.CODE_CHANGE);
      }
    };
  }, [socketRef.current]);

  return <div ref={editorRef} style={{ height: "100%" }} />;
};

export default Editor;
