export default function xtend(...args) {
  let result = {};

  args.forEach((props) => {
    if (props && typeof props === "object") {
      Object.keys(props).forEach((key) => {
        result[key] = props[key];
      });
    }
  });

  return result;
}
