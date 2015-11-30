export default function reverseOctave(source) {
  return source.replace(/[<>]/g, str => str === "<" ? ">" : "<");
}
