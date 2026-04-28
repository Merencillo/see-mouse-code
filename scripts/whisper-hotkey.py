#!/usr/bin/env python3
import time
import tempfile
import threading
import subprocess
import numpy as np
import sounddevice as sd
import scipy.io.wavfile as wav
import whisper
import pyperclip
from pynput import keyboard

SAMPLE_RATE = 16000
MODEL_SIZE = "small"
DOUBLE_TAP_THRESHOLD = 0.4  # seconds between two taps to count as double-tap
MAX_TAP_DURATION = 0.4      # a tap must be released within this time (not a hold)

# Customize this with your own Claude Code slash commands for better accuracy
INITIAL_PROMPT = (
    "Claude Code slash commands: /help, /clear, /review, /init, /schedule, /loop."
)

recording = False
frames = []
stream = None
stream_lock = threading.Lock()

ctrl_press_time = None
last_tap_time = None


def start_recording():
    global recording, frames, stream
    with stream_lock:
        frames = []
        recording = True

        def callback(indata, frame_count, time_info, status):
            if recording:
                frames.append(indata.copy())

        stream = sd.InputStream(samplerate=SAMPLE_RATE, channels=1,
                                dtype='float32', callback=callback)
        stream.start()
    print("⏺  Recording... double-tap Ctrl to stop.")


def stop_and_transcribe():
    global recording, frames, stream
    with stream_lock:
        recording = False
        if stream:
            stream.stop()
            stream.close()
            stream = None
        captured = list(frames)

    if not captured:
        print("⚠️  No audio captured.")
        return

    print("⏳  Transcribing...")
    audio = np.concatenate(captured, axis=0)

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        tmp_path = f.name
        wav.write(tmp_path, SAMPLE_RATE, audio)

    result = model.transcribe(tmp_path, language="en", initial_prompt=INITIAL_PROMPT)
    text = result["text"].strip()

    pyperclip.copy(text)
    print(f"✅  {text}")
    print("📋  Pasting into active window...\n")

    # Small delay to let the user's Ctrl key release before pasting
    time.sleep(0.2)
    subprocess.run([
        "osascript", "-e",
        'tell application "System Events" to keystroke "v" using command down'
    ])


def on_press(key):
    global ctrl_press_time
    if key in (keyboard.Key.ctrl_l, keyboard.Key.ctrl_r):
        if ctrl_press_time is None:
            ctrl_press_time = time.time()


def on_release(key):
    global ctrl_press_time, last_tap_time, recording
    if key in (keyboard.Key.ctrl_l, keyboard.Key.ctrl_r):
        if ctrl_press_time is None:
            return
        duration = time.time() - ctrl_press_time
        ctrl_press_time = None

        if duration > MAX_TAP_DURATION:
            return  # It was a hold, not a tap

        now = time.time()
        if last_tap_time and (now - last_tap_time) <= DOUBLE_TAP_THRESHOLD:
            last_tap_time = None  # Reset
            if not recording:
                threading.Thread(target=start_recording, daemon=True).start()
            else:
                threading.Thread(target=stop_and_transcribe, daemon=True).start()
        else:
            last_tap_time = now


print(f"Loading Whisper ({MODEL_SIZE} model)...")
model = whisper.load_model(MODEL_SIZE)
print("✓ Whisper ready!")
print("─────────────────────────────────────────────")
print("  Double-tap Ctrl → start recording")
print("  Double-tap Ctrl again → stop + paste into chat")
print("  Ctrl+C to quit")
print("─────────────────────────────────────────────\n")

with keyboard.Listener(on_press=on_press, on_release=on_release) as listener:
    listener.join()
