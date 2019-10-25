import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import React from "react";
const strokeWidth = 2;
const percentageValues = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const ProgressProvider = ({ values, children }) => {
  const [valueIndex, setValueIndex] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setValueIndex(valueIndex => (valueIndex + 1) % values.length);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  return children(valueIndex);
};
const LoadingCircle = ({ overRideStroke, extraStyle }) => {
  return (
    <ProgressProvider values={percentageValues}>
      {valueIndex => (
        <Progressbar
          value={percentageValues[valueIndex]}
          text={``}
          styles={buildStyles({
            pathTransition:
              percentageValues[valueIndex] === 0
                ? "none"
                : "stroke-dashoffset 0.5s ease 0s"
          })}
          strokeWidth={overRideStroke ? overRideStroke : strokeWidth}
        />
      )}
    </ProgressProvider>
  );
};

const Progressbar = ({ value, strokeWidth }) => (
  <CircularProgressbar
    value={value}
    strokeWidth={strokeWidth}
    styles={buildStyles({
      // Rotation of path and trail, in number of turns (0-1)
      rotation: 0,

      // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
      strokeLinecap: "butt",

      // How long animation takes to go from one percentage to another, in seconds
      pathTransitionDuration: 0.5,

      // Can specify path transition in more detail, or remove it entirely
      // pathTransition: 'none',

      // Colors
      pathColor: `rgba(62, 152, 199, ${value / 100})`,
      textColor: "#f88",
      trailColor: "#d6d6d6",
      backgroundColor: "#3e98c7"
    })}
  />
);
export default LoadingCircle;
