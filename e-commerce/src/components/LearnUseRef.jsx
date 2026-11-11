import { useEffect, useRef } from "react";

const LearnUseRef = () => {
  // JS DOM -> Actual DOM

  const h1Ref=useRef(null);

  useEffect(() => {
    // document.querySelector("h1").style.color = "red";
    h1Ref.current.style.color="greenyellow";
  }, []);

  return (
    <div>
      <h1 className="text-3xl text-center" ref={h1Ref}>Hello Everyone!</h1>
    </div>
  );
};

export default LearnUseRef;
