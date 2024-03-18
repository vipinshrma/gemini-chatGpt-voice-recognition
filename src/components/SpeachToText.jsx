import React, { useState, useRef, useEffect } from "react";

const mimeType = "audio/wav";

import OpenAI from 'openai';
import { async } from "regenerator-runtime";
import speech  ,{useSpeechRecognition } from 'react-speech-recognition'

// const openai = new OpenAI({
// //   apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
// });

const AudioRecorder = () => {
    const {listening,transcript:transcriptValue} = useSpeechRecognition()

    const [permission, setPermission] = useState(false);
    const mediaRecorder = useRef(null);
    const [recordingStatus, setRecordingStatus] = useState("inactive");
    const [stream, setStream] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [audio, setAudio] = useState(null);
    const audioText = useRef(null)
    const textRef = useRef(null)
    const [transcript,setTranscript] = useState('')


    console.log("tratranscript outer",transcriptValue)

    const getMicrophonePermission = async () => {
        if ("MediaRecorder" in window) {
            try {
                const streamData = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false,
                });
                setPermission(true);
                setStream(streamData);
            } catch (err) {
                alert(err.message);
            }
        } else {
            alert("The MediaRecorder API is not supported in your browser.");
        }
    };


    const startRecording = async () => {
        setRecordingStatus("recording");
        //create new Media recorder instance using the stream
        const media = new MediaRecorder(stream, { type: mimeType });
        //set the MediaRecorder instance to the mediaRecorder ref
        mediaRecorder.current = media;
        //invokes the start method to start the recording process
        mediaRecorder.current.start();
        let localAudioChunks = [];
        mediaRecorder.current.ondataavailable = (event) => {
            if (typeof event.data === "undefined") return;
            if (event.data.size === 0) return;
            localAudioChunks.push(event.data);
        };
        setAudioChunks(localAudioChunks);
    };

    const stopRecording = () => {
        setRecordingStatus("inactive");
        //stops the recording instance
        mediaRecorder.current.stop();
        mediaRecorder.current.onstop = () => {
            //creates a blob file from the audiochunks data
            const audioBlob = new Blob(audioChunks, { type: mimeType });
            //creates a playable URL from the blob file.
            const audioUrl = URL.createObjectURL(audioBlob);
            convertAudioToText(audioUrl)
            setAudio(audioUrl);
            setAudioChunks([]);
        };
    };

    function convertAudioToText(audioUrl) {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log("trans s",transcript)
            setTranscript(transcript)
            // outputDiv.textContent = 'Text: ' + transcript;
        };

        recognition.onerror = (event) => {
            console.log("event err",event.error)
            // outputDiv.textContent = 'Error occurred: ' + event.error;
        };

        const audio = new Audio(audioUrl);
        audio.onloadedmetadata = () => {
            recognition.start();
        };
    }

    const AI_SpeechToText = async()=>{
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream("/path/to/file/audio.mp3"),
            model: "whisper-1",
          });
        
          console.log(transcription.text);
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

    //     resetAudioConfig()
    //   },[])

    return (
        <>
            <div className="audio-controls">
                {!permission ? (
                    <button onClick={getMicrophonePermission} type="button">
                        Get Microphone
                    </button>
                ) : null}
                {permission && recordingStatus === "inactive" ? (
                    <button onClick={speech.startListening()} type="button">
                        Start Recording
                    </button>
                ) : null}
                {recordingStatus === "recording" ? (
                    <button onClick={speech.stopListening()} type="button">
                        Stop Recording
                    </button>
                ) : null}


            </div>
            {audio ? (
                <div className="audio-container">
                    <audio src={audio} controls></audio>
                    {/* <a download href={audio}>
                        Download Recording
                    </a> */}


                </div>
            ) : null}
            <input  onChange={(e)=>textRef.current = e.target.value} />
            <div>
            <button onClick={()=>speakText(audioText.current)}>Speak</button>
            </div>
        </>

    );
};

export default AudioRecorder;
