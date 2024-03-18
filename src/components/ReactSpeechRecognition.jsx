import React, { useEffect, useState } from 'react'
import speech, { useSpeechRecognition } from 'react-speech-recognition'
import "regenerator-runtime"
import { GoogleGenerativeAI } from '@google/generative-ai'

import OpenAI from 'openai';

const genAI = new GoogleGenerativeAI('AIzaSyDhKlPu-Z1kvQWYNxG8y53AXtKrbx1f8Gc');


const openai = new OpenAI({
  apiKey:import.meta.env.VITE_GEMINI_AI_SECRET_KEY,
  dangerouslyAllowBrowser: true
});


export default function ReactSpeechRecognition() {
  const { listening, transcript: transcriptValue } = useSpeechRecognition()
  const [messages, setMessages] = useState([])

  async function runAI(message) {
    // For text-only input, use the gemini-pro model
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // const chat = model.startChat({
      //    history: [
      //     {
      //       role: "user",
      //       parts: "Hello, I have 2 dogs in my house.",
      //     },
      //     {
      //       role: "model",
      //       parts: "Great to meet you. What would you like to know?",
      //     },
      //   ],
      //   generationConfig: {
      //     maxOutputTokens: 100,
      //   },
      // });

      // const msg = "How many paws are in my house?";

      // const result = await chat.sendMessage(message);
      const result = await model.generateContent(message);

      const response = await result.response;
      const text = response.text();
      setMessages([...messages, {
        role: 'user',
        parts: message
      },
      {
        role: 'model',
        parts: text
      }])
      
      console.log("text", text)

      speakText(text)
    } catch (error) {
      console.log("err", error)
    }
  }

  // useEffect(() => {
  //   runAI()
  // }, [])

  const chatCompletion = async (message) => {
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          ...messages,
          {
            role: 'user',
            message
          }
        ],
        model: "gpt-3.5-turbo",
      })
      console.log(completion);
    } catch (error) {
      console.log("ai err", error)
    }

  }

  const speakText = (textToSpeak) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Optional settings
    // utterance.lang = 'en-US'; // Set the language
    utterance.rate = 1.0; // Set the speaking rate (default is 1.0)
    utterance.pitch = 1.0; // Set the pitch (default is 1.0)

    // Speak the text
    synth.speak(utterance);
  };

  useEffect(() => {
    if (!listening && transcriptValue) {
      runAI(transcriptValue)
    }
  }, [transcriptValue, listening])

  return (
    <>
      <div>ReactSpeechRecognition</div>
      <button onClick={() => speech.startListening()}>Start</button>
      <button onClick={() => {
        speech.stopListening()
        // runAI(transcriptValue)
      }}> Stop</button>

      {
        messages?.length > 0 && (

          <>
            {
              messages?.map((message => {
                return <div>
                  {
                    message?.role === 'user' && <p>User: {message?.parts}</p>
                  }

                  {
                    message?.role === 'model' && <p>AI: {message?.parts}</p>
                  }
                </div>
              }))
            }
          </>
        )
      }
    </>

  )
}
