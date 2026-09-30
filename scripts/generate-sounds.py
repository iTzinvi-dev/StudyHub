#!/usr/bin/env python3
"""
Generates the five ambient loops the sound mixer looks for, straight into
public/sounds/. No samples, no downloads, no licences to keep track of — every
track is synthesised from noise and short transients, so the result is free to
ship and loops without an audible join.

    python3 scripts/generate-sounds.py

Requires numpy and ffmpeg.
"""

from __future__ import annotations

import pathlib
import subprocess

import numpy as np

RATE = 44_100
OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "sounds"

rng = np.random.default_rng(20260930)


# ----------------------------------------------------------------- noise beds

def white(n: int) -> np.ndarray:
    return rng.standard_normal(n)


def brown(n: int) -> np.ndarray:
    """Integrated white noise: the low, heavy rumble underneath wind and rain."""
    out = np.cumsum(white(n))
    out -= np.linspace(out[0], out[-1], n)  # remove the drift
    return out / (np.max(np.abs(out)) + 1e-9)


def pink(n: int) -> np.ndarray:
    """Approximate 1/f noise by summing octaves of filtered white noise."""
    out = np.zeros(n)
    for octave in range(1, 7):
        window = 2 ** octave
        steps = n // window + 1
        held = np.repeat(rng.standard_normal(steps), window)[:n]
        out += held / octave
    return out / (np.max(np.abs(out)) + 1e-9)


def fft_filter(x: np.ndarray, low: float, high: float) -> np.ndarray:
    """Zero everything outside [low, high] Hz. Blunt, but fine for textures."""
    spectrum = np.fft.rfft(x)
    freqs = np.fft.rfftfreq(len(x), 1 / RATE)
    spectrum[(freqs < low) | (freqs > high)] = 0
    return np.fft.irfft(spectrum, len(x))


def smooth(x: np.ndarray, samples: int) -> np.ndarray:
    if samples <= 1:
        return x
    kernel = np.ones(samples) / samples
    return np.convolve(x, kernel, mode="same")


def envelope(n: int, attack: int, decay: int) -> np.ndarray:
    """A percussive shape: fast rise, then an exponential fall."""
    out = np.zeros(n)
    attack = min(attack, n)
    out[:attack] = np.linspace(0, 1, attack)
    if decay < n:
        tail = np.arange(n - attack)
        out[attack:] = np.exp(-tail / (decay / 5))
    return out


# --------------------------------------------------------------------- mixing

def place(track: np.ndarray, event: np.ndarray, at: float, gain: float = 1.0) -> None:
    """Drop an event onto the track at a time in seconds, wrapping at the loop."""
    start = int(at * RATE) % len(track)
    end = start + len(event)
    if end <= len(track):
        track[start:end] += event * gain
        return
    first = len(track) - start
    track[start:] += event[:first] * gain
    track[: end - len(track)] += event[first:] * gain


def close_loop(x: np.ndarray, fade_seconds: float = 2.0) -> np.ndarray:
    """
    Blend the tail into the head and drop the tail, so the end of the file runs
    straight back into its beginning. Without this every loop has a seam.
    """
    fade = int(fade_seconds * RATE)
    fade = min(fade, len(x) // 4)
    ramp = np.linspace(0, np.pi / 2, fade)
    x[:fade] = x[-fade:] * np.cos(ramp) + x[:fade] * np.sin(ramp)
    return x[: len(x) - fade]


def stereo(
    left: np.ndarray, right: np.ndarray, target_rms: float = 0.07, ceiling: float = 0.55
) -> np.ndarray:
    """
    Level by perceived loudness rather than peak. Wind and keyboard are mostly
    quiet with a few loud moments, so peak-matching left them 20 dB under rain
    and inaudible at the same slider position. Tracks that would clip on the way
    up are soft-limited instead, which lifts the body without squashing the
    transients flat.
    """
    out = np.stack([left, right], axis=1)
    rms = np.sqrt(np.mean(out**2)) + 1e-9
    out = out * (target_rms / rms)

    peak = float(np.max(np.abs(out)))
    if peak > ceiling:
        # Soft knee over the loud tail only. Scaling everything down leaves the
        # crest factor untouched; squashing just the peaks is what lets a sparse
        # track like keyboard sit at the same level as a continuous one.
        knee = peak * 0.55
        loud = np.abs(out) > knee
        out[loud] = np.sign(out[loud]) * (knee + (np.abs(out[loud]) - knee) * 0.28)
        out *= ceiling / float(np.max(np.abs(out)))
    return out


def write(name: str, samples: np.ndarray) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / f"{name}.mp3"
    raw = samples.astype("<f4").tobytes()
    subprocess.run(
        [
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
            "-f", "f32le", "-ar", str(RATE), "-ac", "2", "-i", "-",
            "-c:a", "libmp3lame", "-b:a", "96k", "-ar", str(RATE),
            str(path),
        ],
        input=raw,
        check=True,
    )
    print(f"  {path.relative_to(OUT.parent.parent)}  {path.stat().st_size / 1024:.0f} kB")


# ------------------------------------------------------------------- the tracks

def rain(seconds: int = 60) -> np.ndarray:
    """Steady rain: a hissing bed with droplet pings scattered over it."""
    n = seconds * RATE
    bed = fft_filter(white(n), 700, 9000) * 0.5 + brown(n) * 0.25
    bed = smooth(bed, 3)

    track = bed.copy()
    for _ in range(int(seconds * 26)):
        length = int(rng.uniform(0.02, 0.07) * RATE)
        pitch = rng.uniform(900, 3200)
        t = np.arange(length) / RATE
        ping = np.sin(2 * np.pi * pitch * t) * envelope(length, 40, length)
        place(track, ping, rng.uniform(0, seconds), rng.uniform(0.05, 0.2))
    return track


def wind(seconds: int = 75) -> np.ndarray:
    """Gusts: brown noise whose brightness and level drift on a slow LFO."""
    n = seconds * RATE
    base = brown(n)
    track = np.zeros(n)

    # Sweep the filter in chunks so the timbre opens and closes like a gust.
    chunk = int(1.5 * RATE)
    for start in range(0, n - chunk, chunk):
        cutoff = rng.uniform(180, 900)
        track[start : start + chunk] = fft_filter(base[start : start + chunk], 20, cutoff)

    t = np.arange(n) / RATE
    # Floors matter: two LFOs multiplied together reached near zero, so the bed
    # all but vanished for seconds at a time and the quietest second sat 21x
    # under the loudest. Wind should gust, not blink.
    gust = 0.78 + 0.22 * np.sin(2 * np.pi * t / rng.uniform(9, 15) + rng.uniform(0, 6))
    gust *= 0.82 + 0.18 * np.sin(2 * np.pi * t / rng.uniform(23, 41))
    return smooth(track * gust, 400)


def nature(seconds: int = 75) -> np.ndarray:
    """Outdoors: a soft leaf rustle, a low insect drone, and birdsong."""
    n = seconds * RATE
    bed = fft_filter(white(n), 2000, 8000) * 0.16
    t = np.arange(n) / RATE
    rustle = bed * (0.6 + 0.4 * np.sin(2 * np.pi * t / rng.uniform(5, 9)))
    drone = fft_filter(brown(n), 90, 320) * 0.22

    track = rustle + drone
    for _ in range(int(seconds * 0.9)):
        notes = rng.integers(2, 5)
        at = rng.uniform(0, seconds)
        for note in range(notes):
            length = int(rng.uniform(0.05, 0.12) * RATE)
            start_hz = rng.uniform(2200, 4200)
            end_hz = start_hz * rng.uniform(0.7, 1.5)
            step = np.arange(length) / length
            freq = start_hz + (end_hz - start_hz) * step
            phase = 2 * np.pi * np.cumsum(freq) / RATE
            chirp = np.sin(phase) * envelope(length, 60, length) * 0.9
            place(track, chirp, at + note * rng.uniform(0.09, 0.2), rng.uniform(0.08, 0.22))
    return track


def library(seconds: int = 75) -> np.ndarray:
    """A quiet room: air handling, a far-off murmur, and the odd page turned."""
    n = seconds * RATE
    track = fft_filter(brown(n), 30, 160) * 0.42
    t = np.arange(n) / RATE

    # Distant voices are just noise whose loudness breathes; no words in it.
    murmur = fft_filter(white(n), 220, 1400) * 0.075
    murmur *= 0.4 + 0.6 * np.abs(np.sin(2 * np.pi * t / rng.uniform(3, 6)))
    murmur *= 0.5 + 0.5 * np.abs(np.sin(2 * np.pi * t / rng.uniform(11, 19) + 1.7))
    track += smooth(murmur, 60)

    for _ in range(int(seconds * 0.22)):
        length = int(rng.uniform(0.25, 0.5) * RATE)
        page = fft_filter(white(length), 1200, 5000)
        swell = np.sin(np.linspace(0, np.pi, length)) ** 2
        place(track, page * swell, rng.uniform(0, seconds), rng.uniform(0.1, 0.24))

    for _ in range(int(seconds * 0.08)):
        length = int(rng.uniform(0.12, 0.3) * RATE)
        t2 = np.arange(length) / RATE
        creak = np.sin(2 * np.pi * rng.uniform(120, 260) * t2) * envelope(length, 200, length)
        place(track, creak, rng.uniform(0, seconds), rng.uniform(0.05, 0.13))
    return track


def keyboard(seconds: int = 60) -> np.ndarray:
    """Typing: bursts of key clicks at a human rhythm, with thinking pauses."""
    n = seconds * RATE
    # A room, not a void: the desk tone plus a faint air hiss keep the gaps
    # between bursts from dropping to silence.
    track = fft_filter(brown(n), 40, 120) * 0.16 + fft_filter(white(n), 300, 2600) * 0.012

    cursor = 0.0
    while cursor < seconds - 1:
        for _ in range(rng.integers(4, 11)):
            click_len = int(0.035 * RATE)
            click = fft_filter(white(click_len), 1800, 7000) * envelope(click_len, 12, click_len)
            thock_len = int(0.05 * RATE)
            t = np.arange(thock_len) / RATE
            thock = np.sin(2 * np.pi * rng.uniform(95, 175) * t) * envelope(thock_len, 8, thock_len)
            size = max(len(click), len(thock))
            click = np.pad(click, (0, size - len(click)))
            thock = np.pad(thock, (0, size - len(thock)))
            place(track, click + thock * 0.5, cursor, rng.uniform(0.5, 1.0))
            cursor += rng.uniform(0.075, 0.16)
        cursor += rng.uniform(0.35, 1.7)  # reading, or thinking
    return track


TRACKS = [
    ("rain", rain),
    ("wind", wind),
    ("nature", nature),
    ("library", library),
    ("keyboard", keyboard),
]


def main() -> None:
    print("Generating ambient loops into public/sounds/")
    for name, build in TRACKS:
        mono = close_loop(build())
        # Two unrelated renders per channel, so the stereo image is wide rather
        # than a single mono source duplicated.
        # Two independent renders widen the image for the textures. Typing is
        # one person, so it is the same take in both ears instead.
        if name == "keyboard":
            left = right = mono
        else:
            left = mono
            right = close_loop(build())
            cut = min(len(left), len(right))
            left, right = left[:cut], right[:cut]
        write(name, stereo(left, right))
    print("Done.")


if __name__ == "__main__":
    main()
