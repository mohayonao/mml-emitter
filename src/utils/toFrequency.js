export default function toFrequency(noteNumber, a4Index, a4Frequency) {
  return a4Frequency * Math.pow(2, (noteNumber - a4Index) / 12);
}
